import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// GET /api/storyboards/[id] - 获取分镜详情
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await context.params

    const storyboard = await prisma.storyboard.findUnique({
      where: { id },
      include: {
        panels: {
          orderBy: { panelIndex: 'asc' }
        },
        clip: true,
        episode: {
          include: {
            project: { select: { userId: true } }
          }
        }
      }
    })

    if (!storyboard) {
      return NextResponse.json({ error: '分镜不存在' }, { status: 404 })
    }

    // 权限验证
    if (storyboard.episode?.project?.userId !== user.id) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 })
    }

    return NextResponse.json({ storyboard })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    console.error('获取分镜详情失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// PUT /api/storyboards/[id] - 更新分镜
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await context.params
    const body = await request.json()

    // 权限验证
    const storyboard = await prisma.storyboard.findUnique({
      where: { id },
      include: { episode: { include: { project: { select: { userId: true } } } } }
    })

    if (!storyboard) {
      return NextResponse.json({ error: '分镜不存在' }, { status: 404 })
    }

    if (storyboard.episode?.project?.userId !== user.id) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }

    const updated = await prisma.storyboard.update({
      where: { id },
      data: {
        panelCount: body.panelCount,
        previewUrl: body.previewUrl,
        photographyPlan: body.photographyPlan,
      },
    })

    return NextResponse.json({ storyboard: updated })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    console.error('更新分镜失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// DELETE /api/storyboards/[id] - 删除分镜
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await context.params

    // 权限验证
    const storyboard = await prisma.storyboard.findUnique({
      where: { id },
      include: { episode: { include: { project: { select: { userId: true } } } } }
    })

    if (!storyboard) {
      return NextResponse.json({ error: '分镜不存在' }, { status: 404 })
    }

    if (storyboard.episode?.project?.userId !== user.id) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }

    // 删除关联的面板
    await prisma.$transaction([
      prisma.panel.deleteMany({ where: { storyboardId: id } }),
      prisma.storyboard.delete({ where: { id } }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    console.error('删除分镜失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}