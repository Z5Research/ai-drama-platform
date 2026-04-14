// 模板详情 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    const { id } = await context.params
    
    const template = await prisma.template.findUnique({
      where: { id },
    })
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: '模板不存在' },
        { status: 404 }
      )
    }
    
    // 增加使用次数
    await prisma.template.update({
      where: { id },
      data: { useCount: { increment: 1 } },
    })
    
    // 检查收藏状态
    let isFavorited = false
    if (user) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_templateId: {
            userId: user.id,
            templateId: id,
          },
        },
      })
      isFavorited = !!favorite
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...template,
        isFavorited,
      },
    })
  } catch (error) {
    console.error('Get template error:', error)
    return NextResponse.json(
      { success: false, error: '获取模板详情失败' },
      { status: 500 }
    )
  }
}
