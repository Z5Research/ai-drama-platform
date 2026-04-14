import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/editor/projects/[episodeId]/render-status
 * 获取渲染状态
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const { episodeId } = await params
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('id')

    const editorProject = await prisma.videoEditorProject.findUnique({
      where: { episodeId }
    })

    if (!editorProject) {
      return NextResponse.json(
        { error: 'Editor project not found' },
        { status: 404 }
      )
    }

    // 在实际项目中，这里应该从 BullMQ 获取任务状态
    // 现在返回数据库中存储的状态

    // 模拟渲染进度（实际应该从队列获取）
    let progress = 0
    if (editorProject.renderStatus === 'rendering') {
      // 模拟进度
      const startTime = editorProject.updatedAt.getTime()
      const elapsed = (Date.now() - startTime) / 1000 // 秒
      progress = Math.min(100, Math.floor(elapsed / 60 * 10)) // 假设 10 分钟完成
    } else if (editorProject.renderStatus === 'completed') {
      progress = 100
    }

    return NextResponse.json({
      status: editorProject.renderStatus || 'pending',
      progress,
      outputUrl: editorProject.outputUrl,
      renderTaskId: editorProject.renderTaskId,
      updatedAt: editorProject.updatedAt
    })
  } catch (error) {
    console.error('Failed to get render status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}