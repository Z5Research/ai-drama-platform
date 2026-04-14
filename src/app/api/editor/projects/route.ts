import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const createProjectSchema = z.object({
  episodeId: z.string(),
  projectData: z.any()
})

/**
 * POST /api/editor/projects
 * 创建新的编辑器项目
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { episodeId, projectData } = createProjectSchema.parse(body)

    // 检查是否已存在
    const existing = await prisma.videoEditorProject.findUnique({
      where: { episodeId }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Project already exists for this episode' },
        { status: 400 }
      )
    }

    // 创建项目
    const editorProject = await prisma.videoEditorProject.create({
      data: {
        episodeId,
        projectData: JSON.stringify(projectData)
      }
    })

    return NextResponse.json({
      success: true,
      id: editorProject.id,
      episodeId: editorProject.episodeId,
      createdAt: editorProject.createdAt
    })
  } catch (error) {
    console.error('Failed to create editor project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/editor/projects
 * 获取项目列表（支持按状态筛选）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = status ? { renderStatus: status } : {}

    const [projects, total] = await Promise.all([
      prisma.videoEditorProject.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { updatedAt: 'desc' },
        include: {
          episode: {
            select: {
              id: true,
              episodeNumber: true,
              title: true,
              project: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
        }
      }),
      prisma.videoEditorProject.count({ where })
    ])

    return NextResponse.json({
      projects: projects.map(p => ({
        id: p.id,
        episodeId: p.episodeId,
        episode: p.episode,
        renderStatus: p.renderStatus,
        outputUrl: p.outputUrl,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      })),
      total,
      limit,
      offset
    })
  } catch (error) {
    console.error('Failed to list editor projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
