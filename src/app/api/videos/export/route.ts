// 视频导出API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

// GET /api/videos/export?projectId=xxx - 获取导出状态
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: '缺少项目ID' },
        { status: 400 }
      )
    }

    // 获取项目的视频状态统计
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
      include: {
        episodes: {
          include: {
            clips: {
              include: {
                storyboard: {
                  include: {
                    panels: true,
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

    // 统计视频状态
    let totalPanels = 0
    let completedVideos = 0
    let processingVideos = 0
    let failedVideos = 0
    const videoUrls: string[] = []

    for (const episode of project.episodes || []) {
      for (const clip of episode.clips || []) {
        if (clip.storyboard?.panels) {
          for (const panel of clip.storyboard.panels) {
            totalPanels++
            if (panel.videoStatus === 'completed' && panel.videoUrl) {
              completedVideos++
              videoUrls.push(panel.videoUrl)
            } else if (panel.videoStatus === 'processing') {
              processingVideos++
            } else if (panel.videoStatus === 'failed') {
              failedVideos++
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        projectId,
        projectName: project.title,
        statistics: {
          totalPanels,
          completedVideos,
          processingVideos,
          failedVideos,
          completionRate: totalPanels > 0 ? (completedVideos / totalPanels) * 100 : 0,
        },
        videoUrls,
        canExport: completedVideos === totalPanels && totalPanels > 0,
      },
    })
  } catch (error) {
    console.error('Export status error:', error)
    return NextResponse.json(
      { success: false, error: '获取导出状态失败' },
      { status: 500 }
    )
  }
}

// POST /api/videos/export - 导出最终视频
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { projectId, format = 'mp4', quality = 'high' } = body

    // 调用合成API
    const composeResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/videos/compose`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, options: { format, quality } }),
      }
    )

    if (!composeResponse.ok) {
      const error = await composeResponse.json()
      return NextResponse.json(
        { success: false, error: error.error || '视频合成失败' },
        { status: 500 }
      )
    }

    const composeData = await composeResponse.json()

    // 保存导出记录
    const exportRecord = await prisma.generatedVideo.create({
      data: {
        projectId,
        userId: user.id,
        videoUrl: `data:${composeData.data.mimeType};base64,${composeData.data.videoBase64}`,
        status: 'completed',
        duration: composeData.data.duration,
        metadata: JSON.stringify({
          format,
          quality,
          clipCount: composeData.data.clipCount,
          exportedAt: new Date().toISOString(),
        }),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        videoId: exportRecord.id,
        videoBase64: composeData.data.videoBase64,
        mimeType: composeData.data.mimeType,
        duration: composeData.data.duration,
        downloadUrl: `/api/videos/download/${exportRecord.id}`,
      },
    })
  } catch (error) {
    console.error('Export video error:', error)
    return NextResponse.json(
      { success: false, error: '导出视频失败' },
      { status: 500 }
    )
  }
}