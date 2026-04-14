// Episode API - CRUD Operations
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const createEpisodeSchema = z.object({
  projectId: z.string(),
  episodeNumber: z.number().int().positive().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  novelText: z.string().optional(),
})

const updateEpisodeSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  novelText: z.string().optional(),
  audioUrl: z.string().optional(),
  srtContent: z.string().optional(),
  speakerVoices: z.string().optional(),
  status: z.enum(['draft', 'processing', 'completed']).optional(),
})

// 获取剧集列表
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    
    const projectId = searchParams.get('projectId')
    const episodeId = searchParams.get('id')
    
    // 获取单个剧集
    if (episodeId) {
      const episode = await prisma.episode.findFirst({
        where: { id: episodeId },
        include: {
          clips: { orderBy: { clipNumber: 'asc' } },
          project: { select: { userId: true, title: true } },
        },
      })
      
      if (!episode) {
        return NextResponse.json({ success: false, error: '剧集不存在' }, { status: 404 })
      }
      
      if (episode.project.userId !== user.id) {
        return NextResponse.json({ success: false, error: '无权访问' }, { status: 403 })
      }
      
      return NextResponse.json({ success: true, data: episode })
    }
    
    // 获取项目下所有剧集
    if (!projectId) {
      return NextResponse.json({ success: false, error: '缺少 projectId 参数' }, { status: 400 })
    }
    
    // 验证项目所有权
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
    })
    
    if (!project) {
      return NextResponse.json({ success: false, error: '项目不存在或无权访问' }, { status: 404 })
    }
    
    const episodes = await prisma.episode.findMany({
      where: { projectId },
      include: {
        _count: { select: { clips: true } },
      },
      orderBy: { episodeNumber: 'asc' },
    })
    
    return NextResponse.json({
      success: true,
      data: episodes,
      workflowStage: project.workflowStage,
    })
  } catch (error) {
    console.error('Get episodes error:', error)
    return NextResponse.json({ success: false, error: '获取剧集失败' }, { status: 500 })
  }
}

// 创建剧集
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const data = createEpisodeSchema.parse(body)
    
    // 验证项目所有权
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId: user.id },
    })
    
    if (!project) {
      return NextResponse.json({ success: false, error: '项目不存在或无权访问' }, { status: 404 })
    }
    
    // 确定剧集编号
    let episodeNumber = data.episodeNumber
    if (!episodeNumber) {
      const lastEpisode = await prisma.episode.findFirst({
        where: { projectId: data.projectId },
        orderBy: { episodeNumber: 'desc' },
      })
      episodeNumber = lastEpisode ? lastEpisode.episodeNumber + 1 : 1
    }
    
    // 创建剧集
    const episode = await prisma.episode.create({
      data: {
        projectId: data.projectId,
        episodeNumber,
        title: data.title || `第${episodeNumber}集`,
        description: data.description,
        novelText: data.novelText,
      },
    })
    
    return NextResponse.json({ success: true, data: episode })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 })
    }
    console.error('Create episode error:', error)
    return NextResponse.json({ success: false, error: '创建剧集失败' }, { status: 500 })
  }
}

// 更新剧集
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { id, ...data } = body
    
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少剧集ID' }, { status: 400 })
    }
    
    const updateData = updateEpisodeSchema.parse(data)
    
    // 验证所有权
    const episode = await prisma.episode.findFirst({
      where: { id },
      include: { project: { select: { userId: true } } },
    })
    
    if (!episode) {
      return NextResponse.json({ success: false, error: '剧集不存在' }, { status: 404 })
    }
    
    if (episode.project.userId !== user.id) {
      return NextResponse.json({ success: false, error: '无权修改' }, { status: 403 })
    }
    
    const updated = await prisma.episode.update({
      where: { id },
      data: updateData,
    })
    
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 })
    }
    console.error('Update episode error:', error)
    return NextResponse.json({ success: false, error: '更新剧集失败' }, { status: 500 })
  }
}

// 删除剧集
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少剧集ID' }, { status: 400 })
    }
    
    // 验证所有权
    const episode = await prisma.episode.findFirst({
      where: { id },
      include: { project: { select: { userId: true } } },
    })
    
    if (!episode) {
      return NextResponse.json({ success: false, error: '剧集不存在' }, { status: 404 })
    }
    
    if (episode.project.userId !== user.id) {
      return NextResponse.json({ success: false, error: '无权删除' }, { status: 403 })
    }
    
    // 删除剧集及其所有片段
    await prisma.$transaction([
      prisma.clip.deleteMany({ where: { episodeId: id } }),
      prisma.episode.delete({ where: { id } }),
    ])
    
    return NextResponse.json({ success: true, message: '剧集已删除' })
  } catch (error) {
    console.error('Delete episode error:', error)
    return NextResponse.json({ success: false, error: '删除剧集失败' }, { status: 500 })
  }
}