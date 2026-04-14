// 删除/撤销 API 密钥
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await context.params
    
    // 验证所有权
    const key = await prisma.apiKey.findFirst({
      where: { id, userId: user.id },
    })
    
    if (!key) {
      return NextResponse.json(
        { success: false, error: '密钥不存在' },
        { status: 404 }
      )
    }
    
    await prisma.apiKey.delete({
      where: { id },
    })
    
    return NextResponse.json({
      success: true,
      message: '密钥已删除',
    })
  } catch (error) {
    console.error('Delete API key error:', error)
    return NextResponse.json(
      { success: false, error: '删除密钥失败' },
      { status: 500 }
    )
  }
}
