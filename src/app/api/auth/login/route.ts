// 用户登录 API
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { generateToken, setAuthCookie } from '@/lib/auth'
import { rateLimitMiddleware } from '@/lib/middleware'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '请输入密码'),
})

export async function POST(request: NextRequest) {
  // 速率限制检查
  const rateLimitResponse = rateLimitMiddleware(request, 'auth')
  if (rateLimitResponse) return rateLimitResponse
  
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      )
    }
    
    // 验证密码
    const isValid = await bcrypt.compare(password, user.password)
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      )
    }
    
    // 检查用户状态
    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, error: '账号已被禁用' },
        { status: 403 }
      )
    }
    
    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })
    
    // 生成 JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
    
    // 返回用户信息
    const { password: _, ...userWithoutPassword } = user
    
    const response = NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    })
    
    response.headers.set('Set-Cookie', setAuthCookie(token))
    
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      )
    }
    
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: '登录失败，请稍后重试' },
      { status: 500 }
    )
  }
}
