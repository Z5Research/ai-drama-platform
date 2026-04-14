// 管理员 API - 系统配置
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// 系统配置 Schema
const systemConfigSchema = z.object({
  // AI配置
  aiProvider: z.enum(['bailian', 'volcengine', 'openai']).optional(),
  aiModel: z.string().optional(),
  
  // 积分配置
  defaultCredits: z.number().int().min(0).optional(),
  
  // VIP配置
  vipMonthlyPrice: z.number().min(0).optional(),
  vipQuarterlyPrice: z.number().min(0).optional(),
  vipYearlyPrice: z.number().min(0).optional(),
  
  // 功能开关
  enableRegistration: z.boolean().optional(),
  enableAiImage: z.boolean().optional(),
  enableAiVideo: z.boolean().optional(),
  
  // 速率限制
  rateLimitAuth: z.number().int().min(1).optional(),
  rateLimitAi: z.number().int().min(1).optional(),
})

// 内存配置存储（生产环境应使用数据库）
let systemConfig: Record<string, unknown> = {
  aiProvider: 'bailian',
  aiModel: 'qwen-plus',
  defaultCredits: 100,
  vipMonthlyPrice: 99,
  vipQuarterlyPrice: 249,
  vipYearlyPrice: 799,
  enableRegistration: true,
  enableAiImage: true,
  enableAiVideo: true,
  rateLimitAuth: 10,
  rateLimitAi: 20,
}

// GET /api/admin/config - 获取系统配置
export async function GET() {
  try {
    await requireAdmin()
    
    return NextResponse.json({
      success: true,
      config: systemConfig,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT /api/admin/config - 更新系统配置
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    const data = systemConfigSchema.parse(body)
    
    // 更新配置
    systemConfig = { ...systemConfig, ...data }
    
    return NextResponse.json({
      success: true,
      config: systemConfig,
      message: '配置已更新',
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: '配置格式错误', details: error.issues }, { status: 400 })
    }
    console.error('Update config error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}