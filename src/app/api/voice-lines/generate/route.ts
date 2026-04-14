import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { getDefaultAiService } from '@/lib/ai'
import { rateLimitMiddleware } from '@/lib/middleware'

/**
 * POST /api/voice-lines/generate
 * 批量生成配音
 * Body: { voiceLineIds?: string[], episodeId?: string, speaker?: string }
 */
export async function POST(request: NextRequest) {
  // 速率限制
  const rateLimitResponse = rateLimitMiddleware(request, 'ai')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const user = await requireAuth()

    const body = await request.json()
    const { voiceLineIds, episodeId, speaker } = body

    if (!voiceLineIds && !episodeId) {
      return NextResponse.json(
        { error: 'voiceLineIds or episodeId is required' },
        { status: 400 }
      )
    }

    // 获取要生成的台词列表
    const voiceLines = []

    if (voiceLineIds && Array.isArray(voiceLineIds)) {
      const lines = await prisma.voiceLine.findMany({
        where: { id: { in: voiceLineIds } },
        include: {
          episode: {
            include: {
              project: { select: { userId: true } }
            }
          }
        }
      })
      voiceLines.push(...lines)
    } else if (episodeId) {
      const whereClause: Record<string, unknown> = { episodeId }
      if (speaker) whereClause.speaker = speaker
      
      const lines = await prisma.voiceLine.findMany({
        where: whereClause,
        include: {
          episode: {
            include: {
              project: { select: { userId: true } }
            }
          }
        },
        orderBy: { lineIndex: 'asc' }
      })
      voiceLines.push(...lines)
    }

    if (voiceLines.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No voice lines found' 
      }, { status: 404 })
    }

    // 验证权限
    if (voiceLines[0].episode?.project?.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
      // 调用真实 TTS 服务
      const aiService = getDefaultAiService()
      const results: Array<{ id: string; success: boolean; audioUrl?: string; error?: string }> = []

      for (const line of voiceLines) {
        try {
          const audioUrl = await aiService.generateAudio({
            text: line.content,
            voiceId: line.voiceId || undefined,
            emotion: line.emotionPrompt || undefined,
            emotionStrength: line.emotionStrength || undefined,
          })

          // 更新台词记录
          await prisma.voiceLine.update({
            where: { id: line.id },
            data: { audioUrl }
          })

          results.push({
            id: line.id,
            success: true,
            audioUrl
          })
        } catch (err) {
          console.error(`生成台词 ${line.id} 失败:`, err)
          results.push({
            id: line.id,
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error'
          })
        }
      }

      const successCount = results.filter(r => r.success).length

      return NextResponse.json({
        success: true,
        results,
        total: voiceLines.length,
        successCount,
        failedCount: voiceLines.length - successCount
      })
    } catch (aiError) {
      console.error('TTS服务调用失败:', aiError)
      return NextResponse.json({
        success: false,
        error: 'TTS服务调用失败',
        ...(process.env.NODE_ENV === 'development' && {
          details: aiError instanceof Error ? aiError.message : 'Unknown error'
        })
      }, { status: 500 })
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error generating voice lines:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}