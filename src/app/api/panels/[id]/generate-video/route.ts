import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { getDefaultAiService } from '@/lib/ai'
import { rateLimitMiddleware } from '@/lib/middleware'

// POST /api/panels/[id]/generate-video - 生成视频
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
      videoPrompt,
      imageUrl,
      duration = 5,
      aspectRatio = '9:16',
      quality = 'standard'
    } = body

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

    // 更新状态为处理中
    await prisma.panel.update({
      where: { id },
      data: {
        videoStatus: 'processing',
        videoPrompt: videoPrompt || panel.videoPrompt,
      }
    })

    try {
      // 调用真实 AI 服务
      const aiService = getDefaultAiService()
      
      const videoUrl = await aiService.generateVideo({
        prompt: videoPrompt || panel.videoPrompt || panel.description || '',
        imageUrl: imageUrl || panel.imageUrl || undefined,
        duration,
        aspectRatio: aspectRatio as '16:9' | '9:16' | '1:1',
        quality: quality as 'standard' | 'high',
      })

      // 更新面板
      const updatedPanel = await prisma.panel.update({
        where: { id },
        data: {
          videoStatus: 'completed',
          videoUrl,
        }
      })

      return NextResponse.json({ 
        panel: updatedPanel,
        videoUrl
      })
    } catch (aiError) {
      console.error('AI视频生成失败:', aiError)
      
      // 更新状态为失败
      await prisma.panel.update({
        where: { id },
        data: { videoStatus: 'failed' }
      })
      
      return NextResponse.json({ 
        error: '视频生成失败',
        ...(process.env.NODE_ENV === 'development' && {
          details: aiError instanceof Error ? aiError.message : '未知错误'
        })
      }, { status: 500 })
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    console.error('生成视频失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}