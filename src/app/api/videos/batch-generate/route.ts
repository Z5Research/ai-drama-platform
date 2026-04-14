// 批量视频生成API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { getDefaultAiService } from '@/lib/ai'

// POST /api/videos/batch-generate - 批量生成视频
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { projectId, options = {} } = body

    // 获取项目的所有面板和角色信息
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
      include: {
        characters: true,
        episodes: {
          include: {
            clips: {
              include: {
                storyboard: {
                  include: {
                    panels: {
                      where: {
                        imageUrl: { not: null }, // 只处理有图像的面板
                      },
                      orderBy: { panelNumber: 'asc' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ success: false, error: '项目不存在' }, { status: 404 })
    }

    // 收集所有需要生成视频的面板
    const panelsToProcess = []
    for (const episode of project.episodes || []) {
      for (const clip of episode.clips || []) {
        if (clip.storyboard?.panels) {
          panelsToProcess.push(...clip.storyboard.panels)
        }
      }
    }

    if (panelsToProcess.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有可用的图像来生成视频' },
        { status: 400 }
      )
    }

    // 构建角色一致性映射
    const characterPrompts: Record<string, string> = {}
    for (const char of project.characters || []) {
      if (char.profileData) {
        try {
          const profile = JSON.parse(char.profileData as string)
          if (profile.consistencyPrompt) {
            characterPrompts[char.name] = profile.consistencyPrompt
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }

    const aiService = getDefaultAiService()
    const results = []

    // 批量生成视频
    for (const panel of panelsToProcess) {
      // 检查是否已有视频
      if (panel.videoUrl && !options.forceRegenerate) {
        results.push({
          panelId: panel.id,
          status: 'skipped',
          message: '视频已存在',
        })
        continue
      }

      try {
        // 更新状态为处理中
        await prisma.panel.update({
          where: { id: panel.id },
          data: { videoStatus: 'processing' },
        })

        // 构建视频提示词（加入角色一致性）
        let videoPrompt = panel.description || ''
        for (const [charName, charPrompt] of Object.entries(characterPrompts)) {
          if (videoPrompt.includes(charName)) {
            videoPrompt = `${charPrompt}，${videoPrompt}`
            break
          }
        }

        // 调用视频生成API
        const videoUrl = await aiService.generateVideo({
          imageUrl: panel.imageUrl!,
          prompt: videoPrompt,
          duration: options.duration || 5,
          aspectRatio: project.aspectRatio === '16:9' ? '16:9' : '9:16',
          quality: options.quality || 'standard',
        })

        // 更新面板
        await prisma.panel.update({
          where: { id: panel.id },
          data: {
            videoStatus: 'completed',
            videoUrl,
            videoPrompt,
          },
        })

        results.push({
          panelId: panel.id,
          status: 'success',
          videoUrl,
        })

        // 避免API限流，每次生成后等待
        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (error) {
        console.error(`生成视频失败 (panel ${panel.id}):`, error)

        await prisma.panel.update({
          where: { id: panel.id },
          data: { videoStatus: 'failed' },
        })

        results.push({
          panelId: panel.id,
          status: 'failed',
          error: error instanceof Error ? error.message : '未知错误',
        })
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length
    const failedCount = results.filter((r) => r.status === 'failed').length

    return NextResponse.json({
      success: true,
      data: {
        total: results.length,
        success: successCount,
        failed: failedCount,
        results,
      },
    })
  } catch (error) {
    console.error('Batch video generation error:', error)
    return NextResponse.json(
      { success: false, error: '批量视频生成失败' },
      { status: 500 }
    )
  }
}