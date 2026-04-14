import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import crypto from 'crypto'

const renderRequestSchema = z.object({
  editorProjectId: z.string(),
  format: z.enum(['mp4', 'webm']).default('mp4'),
  quality: z.enum(['draft', 'high', '720p', '1080p', '4K']).default('1080p')
})

/**
 * POST /api/editor/projects/[episodeId]/render
 * 发起渲染任务
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const user = await requireAuth()
    const { episodeId } = await params
    const body = await request.json()
    const { editorProjectId, format, quality } = renderRequestSchema.parse(body)

    // 验证项目存在并检查权限
    const editorProject = await prisma.videoEditorProject.findUnique({
      where: { episodeId },
      include: {
        episode: {
          include: {
            project: { select: { userId: true } }
          }
        }
      }
    })

    if (!editorProject) {
      return NextResponse.json(
        { error: 'Editor project not found' },
        { status: 404 }
      )
    }

    // 权限验证
    if (editorProject.episode?.project?.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 检查当前渲染状态
    if (editorProject.renderStatus === 'rendering') {
      return NextResponse.json(
        { error: 'Project is already rendering' },
        { status: 400 }
      )
    }

    // 使用安全的随机ID生成
    const renderTaskId = `render_${Date.now()}_${crypto.randomUUID().split('-')[0]}`

    // 更新渲染状态
    await prisma.videoEditorProject.update({
      where: { episodeId },
      data: {
        renderStatus: 'pending',
        renderTaskId
      }
    })

    // 在实际项目中，这里应该将任务加入 BullMQ 队列
    // 现在模拟创建任务记录
    // await queue.add('render-video', {
    //   editorProjectId,
    //   episodeId,
    //   format,
    //   quality,
    //   projectData: JSON.parse(editorProject.projectData)
    // })

    return NextResponse.json({
      success: true,
      renderTaskId,
      message: '渲染任务已创建',
      estimatedTime: '预计 5-10 分钟'
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to start render:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}