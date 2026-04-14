// Clip API - CRUD Operations
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const createClipSchema = z.object({
  episodeId: z.string(),
  clipNumber: z.number().int().positive().optional(),
  content: z.string().min(1, '分镜内容不能为空'),
  summary: z.string().optional(),
  screenplay: z.string().optional(),
  location: z.string().optional(),
  characters: z.string().optional(),
  props: z.string().optional(),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  duration: z.number().optional(),
})

const updateClipSchema = z.object({
  content: z.string().optional(),
  summary: z.string().optional(),
  screenplay: z.string().optional(),
  location: z.string().optional(),
  characters: z.string().optional(),
  props: z.string().optional(),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  duration: z.number().optional(),
})

// 获取分镜列表
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    
    const episodeId = searchParams.get('episodeId')
    const clipId = searchParams.get('id')
    
    // 获取单个分镜
    if (clipId) {
      const clip = await prisma.clip.findFirst({
        where: { id: clipId },
        include: { 
          episode: { 
            include: { 
              project: { select: { userId: true } } 
            } 
          },
          storyboard: {
            include: {
              panels: {
                orderBy: { panelIndex: 'asc' }
              }
            }
          }
        },
      })
      
      if (!clip) {
        return NextResponse.json({ success: false, error: '分镜不存在' }, { status: 404 })
      }
      
      if (clip.episode.project.userId !== user.id) {
        return NextResponse.json({ success: false, error: '无权访问' }, { status: 403 })
      }
      
      return NextResponse.json({ success: true, data: clip })
    }
    
    // 获取剧集下所有分镜
    if (!episodeId) {
      return NextResponse.json({ success: false, error: '缺少 episodeId 参数' }, { status: 400 })
    }
    
    // 验证所有权
    const episode = await prisma.episode.findFirst({
      where: { id: episodeId },
      include: { project: { select: { userId: true } } },
    })
    
    if (!episode) {
      return NextResponse.json({ success: false, error: '剧集不存在' }, { status: 404 })
    }
    
    if (episode.project.userId !== user.id) {
      return NextResponse.json({ success: false, error: '无权访问' }, { status: 403 })
    }
    
    const clips = await prisma.clip.findMany({
      where: { episodeId },
      orderBy: { clipNumber: 'asc' },
      include: {
        storyboard: {
          include: {
            panels: {
              orderBy: { panelIndex: 'asc' }
            }
          }
        }
      }
    })
    
    return NextResponse.json({ success: true, data: clips })
  } catch (error) {
    console.error('Get clips error:', error)
    return NextResponse.json({ success: false, error: '获取分镜失败' }, { status: 500 })
  }
}

// 创建分镜
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const data = createClipSchema.parse(body)
    
    // 验证剧集所有权
    const episode = await prisma.episode.findFirst({
      where: { id: data.episodeId },
      include: { project: { select: { userId: true } } },
    })
    
    if (!episode) {
      return NextResponse.json({ success: false, error: '剧集不存在' }, { status: 404 })
    }
    
    if (episode.project.userId !== user.id) {
      return NextResponse.json({ success: false, error: '无权访问' }, { status: 403 })
    }
    
    // 确定分镜编号
    let clipNumber = data.clipNumber
    if (!clipNumber) {
      const lastClip = await prisma.clip.findFirst({
        where: { episodeId: data.episodeId },
        orderBy: { clipNumber: 'desc' },
      })
      clipNumber = lastClip ? lastClip.clipNumber + 1 : 1
    }
    
    // 创建分镜
    const clip = await prisma.clip.create({
      data: {
        episodeId: data.episodeId,
        clipNumber,
        content: data.content,
        summary: data.summary,
        screenplay: data.screenplay,
        location: data.location,
        characters: data.characters,
        props: data.props,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
      },
    })
    
    return NextResponse.json({ success: true, data: clip })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 })
    }
    console.error('Create clip error:', error)
    return NextResponse.json({ success: false, error: '创建分镜失败' }, { status: 500 })
  }
}

// 更新分镜
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { id, ...data } = body
    
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少分镜ID' }, { status: 400 })
    }
    
    const updateData = updateClipSchema.parse(data)
    
    // 验证所有权
    const clip = await prisma.clip.findFirst({
      where: { id },
      include: { episode: { include: { project: { select: { userId: true } } } } },
    })
    
    if (!clip) {
      return NextResponse.json({ success: false, error: '分镜不存在' }, { status: 404 })
    }
    
    if (clip.episode.project.userId !== user.id) {
      return NextResponse.json({ success: false, error: '无权修改' }, { status: 403 })
    }
    
    const updated = await prisma.clip.update({
      where: { id },
      data: updateData,
    })
    
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 })
    }
    console.error('Update clip error:', error)
    return NextResponse.json({ success: false, error: '更新分镜失败' }, { status: 500 })
  }
}

// 删除分镜
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少分镜ID' }, { status: 400 })
    }
    
    // 验证所有权
    const clip = await prisma.clip.findFirst({
      where: { id },
      include: { episode: { include: { project: { select: { userId: true } } } } },
    })
    
    if (!clip) {
      return NextResponse.json({ success: false, error: '分镜不存在' }, { status: 404 })
    }
    
    if (clip.episode.project.userId !== user.id) {
      return NextResponse.json({ success: false, error: '无权删除' }, { status: 403 })
    }
    
    // 删除分镜（会级联删除 storyboard 和 panels）
    await prisma.clip.delete({ where: { id } })
    
    return NextResponse.json({ success: true, message: '分镜已删除' })
  } catch (error) {
    console.error('Delete clip error:', error)
    return NextResponse.json({ success: false, error: '删除分镜失败' }, { status: 500 })
  }
}