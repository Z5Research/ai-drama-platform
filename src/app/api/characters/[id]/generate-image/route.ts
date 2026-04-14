import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { getDefaultAiService } from '@/lib/ai'
import { rateLimitMiddleware } from '@/lib/middleware'

// POST /api/characters/[id]/generate-image - 生成角色图片
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 速率限制
  const rateLimitResponse = rateLimitMiddleware(request, 'ai')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const user = await requireAuth()

    const { id } = await params
    const body = await request.json()
    const { 
      description,
      style = 'realistic',
      count = 4
    } = body

    // 获取角色信息
    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        appearances: {
          orderBy: { appearanceIndex: 'desc' },
          take: 1
        }
      }
    })

    if (!character) {
      return NextResponse.json({ error: '角色不存在' }, { status: 404 })
    }

    // 验证权限
    if (character.userId !== user.id) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }

    try {
      // 调用真实 AI 服务
      const aiService = getDefaultAiService()
      
      // 构建角色描述词
      const prompt = description || character.description || 
        `角色: ${character.name}${character.profileData ? `, ${character.profileData}` : ''}`
      
      const imageUrls = await aiService.generateImage({
        prompt,
        size: '1024x1792',
        count,
        style: style as 'realistic' | 'anime' | '3d' | 'sketch',
      })

      // 获取或创建外观记录
      let appearance = character.appearances[0]
      
      if (!appearance) {
        appearance = await prisma.characterAppearance.create({
          data: {
            characterId: id,
            appearanceIndex: 0,
            changeReason: '初始形象',
            description: prompt,
            imageUrls: JSON.stringify(imageUrls),
            imageUrl: imageUrls[0],
          }
        })
      } else {
        // 更新现有外观
        appearance = await prisma.characterAppearance.update({
          where: { id: appearance.id },
          data: {
            previousImageUrls: appearance.imageUrls,
            previousImageUrl: appearance.imageUrl,
            previousDescription: appearance.description,
            description: prompt,
            imageUrls: JSON.stringify(imageUrls),
            imageUrl: imageUrls[0],
          },
        })
      }

      return NextResponse.json({
        success: true,
        appearance,
        imageUrls
      })
    } catch (aiError) {
      console.error('AI角色图片生成失败:', aiError)
      return NextResponse.json({
        error: '图片生成失败',
        ...(process.env.NODE_ENV === 'development' && {
          details: aiError instanceof Error ? aiError.message : '未知错误'
        })
      }, { status: 500 })
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    console.error('生成角色图片失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}