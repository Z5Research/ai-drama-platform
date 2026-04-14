import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { rateLimitMiddleware } from '@/lib/middleware'

// GET /api/panels/[id] - 获取面板详情
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await context.params

    const panel = await prisma.panel.findUnique({
      where: { id },
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

    if (!panel) {
      return NextResponse.json({ error: '面板不存在' }, { status: 404 })
    }

    // 权限验证
    if (panel.storyboard?.episode?.project?.userId !== user.id) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 })
    }

    return NextResponse.json({ panel })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    console.error('获取面板详情失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// PUT /api/panels/[id] - 更新面板
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await context.params
    const body = await request.json()

    // 权限验证
    const panel = await prisma.panel.findUnique({
      where: { id },
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

    if (!panel) {
      return NextResponse.json({ error: '面板不存在' }, { status: 404 })
    }

    if (panel.storyboard?.episode?.project?.userId !== user.id) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }

    const updated = await prisma.panel.update({
      where: { id },
      data: {
        shotType: body.shotType,
        cameraMove: body.cameraMove,
        description: body.description,
        location: body.location,
        characters: body.characters ? JSON.stringify(body.characters) : undefined,
        props: body.props ? JSON.stringify(body.props) : undefined,
        srtSegment: body.srtSegment,
        srtStart: body.srtStart,
        srtEnd: body.srtEnd,
        duration: body.duration,
        imagePrompt: body.imagePrompt,
        videoPrompt: body.videoPrompt,
        imageStatus: body.imageStatus,
        videoStatus: body.videoStatus,
        imageUrl: body.imageUrl,
        videoUrl: body.videoUrl,
        notes: body.notes,
      },
    })

    return NextResponse.json({ panel: updated })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    console.error('更新面板失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// DELETE /api/panels/[id] - 删除面板
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await context.params

    // 权限验证
    const panel = await prisma.panel.findUnique({
      where: { id },
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

    if (!panel) {
      return NextResponse.json({ error: '面板不存在' }, { status: 404 })
    }

    if (panel.storyboard?.episode?.project?.userId !== user.id) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }

    await prisma.panel.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    console.error('删除面板失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}