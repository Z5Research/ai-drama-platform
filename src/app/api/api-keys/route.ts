// API 密钥管理
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import crypto from 'crypto'
import { z } from 'zod'

const createApiKeySchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  permissions: z.array(z.string()).default(['read']),
  rateLimit: z.number().min(1).max(1000).default(100),
})

// 获取用户的API密钥列表
export async function GET() {
  try {
    const user = await requireAuth()
    
    const keys = await prisma.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        prefix: true,
        permissions: true,
        rateLimit: true,
        lastUsedAt: true,
        usageCount: true,
        expiresAt: true,
        status: true,
        createdAt: true,
      },
    })
    
    return NextResponse.json({
      success: true,
      data: keys,
    })
  } catch (error) {
    console.error('Get API keys error:', error)
    return NextResponse.json(
      { success: false, error: '获取API密钥失败' },
      { status: 500 }
    )
  }
}

// 创建新的API密钥
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { name, permissions, rateLimit } = createApiKeySchema.parse(body)
    
    // 生成密钥
    const rawKey = crypto.randomBytes(32).toString('base64url')
    const key = `sk_live_${rawKey}`
    const prefix = key.substring(0, 12)
    
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        name,
        key,
        prefix,
        permissions: JSON.stringify(permissions),
        rateLimit,
      },
    })
    
    // 只返回一次完整密钥
    return NextResponse.json({
      success: true,
      data: {
        ...apiKey,
        key, // 完整密钥，只显示一次
        permissions,
      },
      message: '请妥善保存密钥，系统不会再次显示',
    })
  } catch (error) {
    console.error('Create API key error:', error)
    return NextResponse.json(
      { success: false, error: '创建API密钥失败' },
      { status: 500 }
    )
  }
}
