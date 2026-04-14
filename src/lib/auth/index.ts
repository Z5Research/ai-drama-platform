// JWT 认证工具
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from '../db'
import { User } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET

// 生产环境强制要求配置 JWT_SECRET
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be configured in production environment')
}

// 开发环境：每次启动生成随机密钥（更安全）
const generateDevSecret = (): string => {
  const crypto = require('crypto')
  const secret = crypto.randomBytes(32).toString('hex')
  console.warn('⚠️  Using generated JWT secret for development (changes on restart)')
  console.warn('   Set JWT_SECRET in .env for persistent sessions')
  return secret
}

const SECRET = JWT_SECRET || (process.env.NODE_ENV === 'production' 
  ? (() => { throw new Error('JWT_SECRET must be configured in production') })()
  : generateDevSecret())
const JWT_EXPIRES_SECONDS = 7 * 24 * 60 * 60 // 7天

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export interface AuthUser extends Omit<User, 'password'> {}

// 生成 JWT Token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: JWT_EXPIRES_SECONDS })
}

// 验证 JWT Token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload
  } catch {
    return null
  }
}

// 从请求头获取用户
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    
    if (!token) return null
    
    const payload = verifyToken(token)
    if (!payload) return null
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        credits: true,
        totalCredits: true,
        vipLevel: true,
        vipExpiredAt: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    })
    
    return user
  } catch {
    return null
  }
}

// 兼容旧代码的 auth 函数
export async function auth(): Promise<{ user: AuthUser } | null> {
  const user = await getAuthUser()
  if (!user) return null
  return { user }
}

// 要求用户已登录
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

// 要求管理员权限
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth()
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin required')
  }
  return user
}

// 设置认证 Cookie
export function setAuthCookie(token: string, maxAge: number = 7 * 24 * 60 * 60): string {
  return `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`
}

// 清除认证 Cookie
export function clearAuthCookie(): string {
  return 'token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
}
