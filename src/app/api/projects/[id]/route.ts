// 项目详情/更新/删除 API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed', 'archived']).optional(),
  visibility: z.enum(['private', 'public']).optional(),
  aiModel: z.string().optional(),
})

// 获取项目详情
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await context.params
    
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        scripts: {
          orderBy: { createdAt: 'desc' },
        },
        characters: true,
        images: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        videos: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        episodes: {
          include: {
            clips: {
              include: {
                storyboard: {
                  include: {
                    panels: {
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
      return NextResponse.json(
        { success: false, error: '项目不存在' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: project,
    })
  } catch (error) {
    console.error('Get project error:', error)
    return NextResponse.json(
      { success: false, error: '获取项目详情失败' },
      { status: 500 }
    )
  }
}

// 更新项目
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await context.params
    const body = await request.json()
    const data = updateProjectSchema.parse(body)
    
    // 检查项目所有权
    const existing = await prisma.project.findFirst({
      where: { id, userId: user.id },
    })
    
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '项目不存在' },
        { status: 404 }
      )
    }
    
    const project = await prisma.project.update({
      where: { id },
      data,
    })
    
    return NextResponse.json({
      success: true,
      data: project,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      )
    }
    
    console.error('Update project error:', error)
    return NextResponse.json(
      { success: false, error: '更新项目失败' },
      { status: 500 }
    )
  }
}

// 删除项目
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await context.params
    
    // 检查项目所有权
    const existing = await prisma.project.findFirst({
      where: { id, userId: user.id },
    })
    
    if (!existing) {
      return NextResponse.json(
        { success: false, error: '项目不存在' },
        { status: 404 }
      )
    }
    
    // 删除项目及关联数据
    await prisma.$transaction([
      prisma.script.deleteMany({ where: { projectId: id } }),
      prisma.character.deleteMany({ where: { projectId: id } }),
      prisma.generatedImage.deleteMany({ where: { projectId: id } }),
      prisma.generatedVideo.deleteMany({ where: { projectId: id } }),
      // 删除剧集相关数据
      prisma.voiceLine.deleteMany({
        where: { episode: { projectId: id } },
      }),
      prisma.clip.deleteMany({
        where: { episode: { projectId: id } },
      }),
      prisma.storyboard.deleteMany({
        where: { episode: { projectId: id } },
      }),
      prisma.episode.deleteMany({ where: { projectId: id } }),
      prisma.project.delete({ where: { id } }),
    ])
    
    return NextResponse.json({
      success: true,
      message: '项目已删除',
    })
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { success: false, error: '删除项目失败' },
      { status: 500 }
    )
  }
}
