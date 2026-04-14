import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

/**
 * POST /api/panels/[id]/lip-sync
 * 口型同步 - 将音频与视频同步
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()

    const { id } = await params
    const body = await request.json()
    const { audioUrl } = body

    // 获取面板信息
    const panel = await prisma.panel.findUnique({
      where: { id },
      include: {
        storyboard: {
          include: {
            episode: {
              include: {
                project: true
              }
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
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }

    if (!panel.videoUrl) {
      return NextResponse.json({ error: '面板没有视频' }, { status: 400 })
    }

    // 更新状态为处理中
    await prisma.panel.update({
      where: { id },
      data: { lipSyncStatus: 'processing' }
    })

    try {
      // TODO: 实际调用口型同步服务
      // 当前使用模拟实现
      
      // 模拟口型同步处理（2秒）
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const lipSyncVideoUrl = panel.videoUrl + '?lipsync=1'
      
      // 更新面板
      const updatedPanel = await prisma.panel.update({
        where: { id },
        data: {
          lipSyncStatus: 'completed',
          lipSyncVideoUrl,
        }
      })

      return NextResponse.json({
        panel: updatedPanel,
        lipSyncVideoUrl
      })
    } catch (syncError) {
      console.error('口型同步失败:', syncError)
      
      await prisma.panel.update({
        where: { id },
        data: { lipSyncStatus: 'failed' }
      })
      
      return NextResponse.json({
        error: '口型同步失败',
        ...(process.env.NODE_ENV === 'development' && {
          details: syncError instanceof Error ? syncError.message : '未知错误'
        })
      }, { status: 500 })
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    console.error('口型同步API错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}