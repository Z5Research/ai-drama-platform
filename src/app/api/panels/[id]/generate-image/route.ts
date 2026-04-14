import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { getDefaultAiService } from '@/lib/ai'
import { rateLimitMiddleware } from '@/lib/middleware'

// POST /api/panels/[id]/generate-image - 生成图像
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
      imagePrompt, 
      count = 1,
      style = 'realistic',
      aspectRatio = '9:16'
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

    // 验证权限
    if (panel.storyboard?.episode?.project?.userId !== user.id) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }

    // 更新状态为处理中
    await prisma.panel.update({
      where: { id },
      data: {
        imageStatus: 'processing',
        imagePrompt: imagePrompt || panel.imagePrompt,
      }
    })

    try {
      // 调用真实 AI 服务
      const aiService = getDefaultAiService()
      
      // 解析尺寸
      let size: '1024x1024' | '1024x1792' | '1792x1024' = '1024x1792'
      if (aspectRatio === '16:9') size = '1792x1024'
      else if (aspectRatio === '1:1') size = '1024x1024'
      
      const imageUrls = await aiService.generateImage({
        prompt: imagePrompt || panel.imagePrompt || panel.description || '',
        size,
        count,
        style: style as 'realistic' | 'anime' | '3d' | 'sketch',
      })

      // 更新面板
      const updatedPanel = await prisma.panel.update({
        where: { id },
        data: {
          imageStatus: 'completed',
          imageUrl: imageUrls[0],
          candidateUrls: JSON.stringify(imageUrls),
        }
      })

      return NextResponse.json({ 
        panel: updatedPanel,
        candidateUrls: imageUrls
      })
    } catch (aiError) {
      console.error('AI图像生成失败:', aiError)
      
      // 更新状态为失败
      await prisma.panel.update({
        where: { id },
        data: { imageStatus: 'failed' }
      })
      
      return NextResponse.json({ 
        error: '图像生成失败',
        ...(process.env.NODE_ENV === 'development' && {
          details: aiError instanceof Error ? aiError.message : '未知错误'
        })
      }, { status: 500 })
    }
  } catch (error) {
    console.error('生成图像失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
