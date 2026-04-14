import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { rateLimitMiddleware } from '@/lib/middleware'
import { Prisma } from '@prisma/client'

// GET /api/storyboards - 获取分镜列表
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    const episodeId = searchParams.get('episodeId')
    const clipId = searchParams.get('clipId')

    if (!episodeId && !clipId) {
      return NextResponse.json({ error: '需要 episodeId 或 clipId 参数' }, { status: 400 })
    }

    const where: Prisma.StoryboardWhereInput = {}
    if (episodeId) where.episodeId = episodeId
    if (clipId) where.clipId = clipId

    const storyboards = await prisma.storyboard.findMany({
      where,
      include: {
        panels: {
          orderBy: { panelIndex: 'asc' }
        },
        clip: true,
        episode: {
          include: {
            project: {
              select: { userId: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // 权限验证
    for (const storyboard of storyboards) {
      if (storyboard.episode?.project?.userId !== user.id) {
        return NextResponse.json({ error: '无权访问' }, { status: 403 })
      }
    }

    return NextResponse.json({ storyboards })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    console.error('获取分镜列表失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// POST /api/storyboards - 创建分镜
export async function POST(request: NextRequest) {
  // 速率限制
  const rateLimitResponse = rateLimitMiddleware(request, 'ai')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const user = await requireAuth()

    const body = await request.json()
    const { episodeId, clipId, panelCount = 9, panels = [] } = body

    if (!episodeId || !clipId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 权限验证：检查episode是否属于用户
    const episode = await prisma.episode.findFirst({
      where: { id: episodeId },
      include: { project: { select: { userId: true } } }
    })

    if (!episode || episode.project?.userId !== user.id) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }

    // 检查是否已存在
    const existing = await prisma.storyboard.findUnique({
      where: { clipId }
    })

    if (existing) {
      return NextResponse.json({ error: '该片段已有分镜' }, { status: 400 })
    }

    // 创建分镜
    const storyboard = await prisma.storyboard.create({
      data: {
        episodeId,
        clipId,
        panelCount,
        panels: {
          create: panels.map((panel: Record<string, unknown>, index: number) => ({
            panelIndex: index,
            panelNumber: index + 1,
            shotType: panel.shotType as string | undefined,
            cameraMove: panel.cameraMove as string | undefined,
            description: panel.description as string | undefined,
            location: panel.location as string | undefined,
            characters: panel.characters ? JSON.stringify(panel.characters) : null,
            props: panel.props ? JSON.stringify(panel.props) : null,
            srtSegment: panel.srtSegment as string | undefined,
            srtStart: panel.srtStart as number | undefined,
            srtEnd: panel.srtEnd as number | undefined,
            duration: panel.duration as number | undefined,
            imagePrompt: panel.imagePrompt as string | undefined,
            videoPrompt: panel.videoPrompt as string | undefined,
          }))
        }
      },
      include: {
        panels: {
          orderBy: { panelIndex: 'asc' }
        }
      }
    })

    return NextResponse.json({ storyboard }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    console.error('创建分镜失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}