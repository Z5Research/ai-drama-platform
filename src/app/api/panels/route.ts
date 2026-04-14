import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { rateLimitMiddleware } from '@/lib/middleware'

// GET /api/panels - 获取面板列表
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    const storyboardId = searchParams.get('storyboardId')

    if (!storyboardId) {
      return NextResponse.json({ error: '需要 storyboardId 参数' }, { status: 400 })
    }

    const panels = await prisma.panel.findMany({
      where: { storyboardId },
      orderBy: { panelIndex: 'asc' },
      include: {
        storyboard: {
          include: {
            episode: {
              include: { project: { select: { userId: true } } }
            }
          }
        }
      }
    })

    // 权限验证
    if (panels.length > 0 && panels[0].storyboard?.episode?.project?.userId !== user.id) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 })
    }

    return NextResponse.json({ panels })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    console.error('获取面板列表失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// POST /api/panels - 创建面板
export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimitMiddleware(request, 'ai')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const user = await requireAuth()

    const body = await request.json()
    const { storyboardId, ...data } = body

    if (!storyboardId) {
      return NextResponse.json({ error: '缺少 storyboardId' }, { status: 400 })
    }

    // 权限验证
    const storyboard = await prisma.storyboard.findUnique({
      where: { id: storyboardId },
      include: { episode: { include: { project: { select: { userId: true } } } } }
    })

    if (!storyboard || storyboard.episode?.project?.userId !== user.id) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }

    const panel = await prisma.panel.create({
      data: {
        storyboardId,
        panelIndex: data.panelIndex ?? 0,
        panelNumber: data.panelNumber,
        shotType: data.shotType,
        cameraMove: data.cameraMove,
        description: data.description,
        location: data.location,
        characters: data.characters ? JSON.stringify(data.characters) : null,
        props: data.props ? JSON.stringify(data.props) : null,
        srtSegment: data.srtSegment,
        srtStart: data.srtStart,
        srtEnd: data.srtEnd,
        duration: data.duration,
        imagePrompt: data.imagePrompt,
        videoPrompt: data.videoPrompt,
      },
    })

    return NextResponse.json({ panel }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    console.error('创建面板失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}