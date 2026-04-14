// 用户注册 API
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { generateToken, setAuthCookie } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
  name: z.string().min(2, '昵称至少2位'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = registerSchema.parse(body)
    
    // 检查邮箱是否已存在
    const existing = await prisma.user.findUnique({
      where: { email },
    })
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 400 }
      )
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // 创建用户，赠送初始积分
    const defaultCredits = parseInt(process.env.DEFAULT_FREE_CREDITS || '100')
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        credits: defaultCredits,
        totalCredits: defaultCredits,
      },
    })
    
    // 记录积分赠送
    await prisma.creditLog.create({
      data: {
        userId: user.id,
        amount: defaultCredits,
        balance: defaultCredits,
        type: 'gift',
        source: 'system',
        description: '注册赠送',
      },
    })
    
    // 生成 JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
    
    // 返回用户信息（不含密码）
    const { password: _, ...userWithoutPassword } = user
    
    const response = NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
    })
    
    // 设置 Cookie
    response.headers.set('Set-Cookie', setAuthCookie(token))
    
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      )
    }
    
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: '注册失败，请稍后重试' },
      { status: 500 }
    )
  }
}
