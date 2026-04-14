// API 中间件工具
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdmin } from '../auth'

// API 响应包装器
export function apiResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

// API 错误响应
export function apiError(message: string, status = 400, details?: string) {
  const isDev = process.env.NODE_ENV === 'development'
  return NextResponse.json(
    {
      error: message,
      ...(isDev && details && { details }),
    },
    { status }
  )
}

// 认证中间件包装器
export async function withAuth<T>(
  handler: (user: Awaited<ReturnType<typeof requireAuth>>, req: NextRequest) => Promise<T>
) {
  try {
    const user = await requireAuth()
    return { success: true, user, data: await handler(user, null as any) }
  } catch (error) {
    return { success: false, error: 'Unauthorized', status: 401 }
  }
}

// 管理员中间件包装器
export async function withAdmin<T>(
  handler: (user: Awaited<ReturnType<typeof requireAdmin>>, req: NextRequest) => Promise<T>
) {
  try {
    const user = await requireAdmin()
    return { success: true, user, data: await handler(user, null as any) }
  } catch (error) {
    if (error instanceof Error && error.message === 'Forbidden: Admin required') {
      return { success: false, error: 'Forbidden', status: 403 }
    }
    return { success: false, error: 'Unauthorized', status: 401 }
  }
}

// 速率限制存储（内存版，生产环境应使用 Redis）
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// 速率限制配置
interface RateLimitConfig {
  windowMs: number // 时间窗口（毫秒）
  max: number // 最大请求数
  message?: string // 自定义错误消息
}

// 默认配置
const defaultRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1分钟
  max: 60, // 每分钟60次
  message: '请求过于频繁，请稍后再试',
}

// 认证接口速率限制（更严格）
const authRateLimit: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10, // 最多10次
  message: '登录尝试次数过多，请15分钟后再试',
}

// AI生成接口速率限制
const aiRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1分钟
  max: 20, // 每分钟20次
  message: 'AI生成请求过于频繁，请稍后再试',
}

// 获取客户端IP
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIp) {
    return realIp
  }
  return 'unknown'
}

// 速率限制检查
export function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig = defaultRateLimit
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = getClientIp(req)
  const key = `${ip}:${req.nextUrl.pathname}`
  const now = Date.now()
  
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    // 创建新记录
    const newRecord = { count: 1, resetTime: now + config.windowMs }
    rateLimitStore.set(key, newRecord)
    return { allowed: true, remaining: config.max - 1, resetTime: newRecord.resetTime }
  }
  
  if (record.count >= config.max) {
    // 超过限制
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }
  
  // 增加计数
  record.count++
  rateLimitStore.set(key, record)
  return { allowed: true, remaining: config.max - record.count, resetTime: record.resetTime }
}

// 速率限制中间件
export function rateLimitMiddleware(
  req: NextRequest,
  type: 'default' | 'auth' | 'ai' = 'default'
): NextResponse | null {
  const config = 
    type === 'auth' ? authRateLimit :
    type === 'ai' ? aiRateLimit :
    defaultRateLimit
  
  const result = checkRateLimit(req, config)
  
  if (!result.allowed) {
    return NextResponse.json(
      { error: config.message || '请求过于频繁' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(config.max),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.resetTime),
        },
      }
    )
  }
  
  return null // 允许继续
}

// 清理过期的速率限制记录（定时执行）
export function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// 每小时清理一次
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 60 * 60 * 1000)
}
