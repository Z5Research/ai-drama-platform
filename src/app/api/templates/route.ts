// 模板 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// 获取模板列表
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    
    const where: any = { status: 'active' }
    if (category && category !== 'all') where.category = category
    if (featured === 'true') where.isFeatured = true
    
    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        orderBy: [
          { isFeatured: 'desc' },
          { useCount: 'desc' },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.template.count({ where }),
    ])
    
    // 如果用户已登录，检查收藏状态
    let templatesWithFavorite = templates
    if (user) {
      const favorites = await prisma.favorite.findMany({
        where: {
          userId: user.id,
          templateId: { in: templates.map(t => t.id) },
        },
      })
      const favoriteIds = new Set(favorites.map(f => f.templateId))
      templatesWithFavorite = templates.map(t => ({
        ...t,
        isFavorited: favoriteIds.has(t.id),
      }))
    }
    
    return NextResponse.json({
      success: true,
      data: {
        items: templatesWithFavorite,
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total,
      },
    })
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json(
      { success: false, error: '获取模板失败' },
      { status: 500 }
    )
  }
}
