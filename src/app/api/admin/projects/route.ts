// 管理员 API - 项目管理
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/admin/projects - 获取所有项目
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (userId) where.userId = userId

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          visibility: true,
          workflowStage: true,
          viewCount: true,
          likeCount: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            }
          },
          _count: {
            select: {
              episodes: true,
              characters: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        projects,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Admin projects error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/admin/projects - 删除项目
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '缺少项目ID' }, { status: 400 })
    }

    // 删除项目及关联数据
    await prisma.$transaction([
      prisma.voiceLine.deleteMany({ where: { episode: { projectId: id } } }),
      prisma.panel.deleteMany({ where: { storyboard: { episode: { projectId: id } } } }),
      prisma.storyboard.deleteMany({ where: { episode: { projectId: id } } }),
      prisma.clip.deleteMany({ where: { episode: { projectId: id } } }),
      prisma.episode.deleteMany({ where: { projectId: id } }),
      prisma.character.deleteMany({ where: { projectId: id } }),
      prisma.script.deleteMany({ where: { projectId: id } }),
      prisma.project.delete({ where: { id } }),
    ])

    return NextResponse.json({ success: true, message: '项目已删除' })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Delete project error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}