// 视频合成API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'

const execAsync = promisify(exec)

// POST /api/videos/compose - 合成视频
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { projectId, options = {} } = body

    // 获取项目的所有视频片段
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
      include: {
        episodes: {
          include: {
            clips: {
              include: {
                storyboard: {
                  include: {
                    panels: {
                      where: {
                        videoUrl: { not: null },
                        videoStatus: 'completed',
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

    // 收集所有视频片段URL
    const videoUrls: string[] = []
    for (const episode of project.episodes || []) {
      for (const clip of episode.clips || []) {
        if (clip.storyboard?.panels) {
          for (const panel of clip.storyboard.panels) {
            if (panel.videoUrl) {
              videoUrls.push(panel.videoUrl)
            }
          }
        }
      }
    }

    if (videoUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有可合成的视频片段' },
        { status: 400 }
      )
    }

    // 创建临时目录
    const tempDir = path.join('/tmp', `video-compose-${projectId}`)
    await fs.mkdir(tempDir, { recursive: true })

    // 下载所有视频片段
    const downloadPromises = videoUrls.map(async (url, index) => {
      const videoPath = path.join(tempDir, `clip_${index}.mp4`)
      const response = await fetch(url)
      const buffer = await response.arrayBuffer()
      await fs.writeFile(videoPath, Buffer.from(buffer))
      return videoPath
    })

    const videoPaths = await Promise.all(downloadPromises)

    // 创建视频列表文件
    const listPath = path.join(tempDir, 'videos.txt')
    const listContent = videoPaths.map((p) => `file '${p}'`).join('\n')
    await fs.writeFile(listPath, listContent)

    // 输出文件路径
    const outputPath = path.join(tempDir, 'final_video.mp4')

    // 使用FFmpeg合成视频
    const ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`
    
    try {
      await execAsync(ffmpegCmd, { timeout: 300000 }) // 5分钟超时
    } catch (ffmpegError) {
      console.error('FFmpeg error:', ffmpegError)
      return NextResponse.json(
        { success: false, error: '视频合成失败' },
        { status: 500 }
      )
    }

    // 检查输出文件
    const stats = await fs.stat(outputPath)
    if (stats.size === 0) {
      return NextResponse.json(
        { success: false, error: '合成视频文件为空' },
        { status: 500 }
      )
    }

    // 读取视频文件并转为base64
    const videoBuffer = await fs.readFile(outputPath)
    const videoBase64 = videoBuffer.toString('base64')

    // 清理临时文件
    await fs.rm(tempDir, { recursive: true, force: true })

    return NextResponse.json({
      success: true,
      data: {
        videoBase64,
        mimeType: 'video/mp4',
        clipCount: videoUrls.length,
        duration: videoUrls.length * 5, // 估算总时长
      },
    })
  } catch (error) {
    console.error('Video composition error:', error)
    return NextResponse.json(
      { success: false, error: '视频合成失败' },
      { status: 500 }
    )
  }
}