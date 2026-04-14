import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { validateProjectData, migrateProjectData } from '@/features/video-editor'

const prisma = new PrismaClient()

/**
 * GET /api/editor/projects/[episodeId]
 * 获取编辑器项目
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const { episodeId } = await params

    const editorProject = await prisma.videoEditorProject.findUnique({
      where: { episodeId }
    })

    if (!editorProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // 解析项目数据
    const projectData = JSON.parse(editorProject.projectData)
    
    // 迁移数据（确保兼容性）
    const migratedData = migrateProjectData(projectData)

    return NextResponse.json({
      id: editorProject.id,
      episodeId: editorProject.episodeId,
      projectData: migratedData,
      renderStatus: editorProject.renderStatus,
      outputUrl: editorProject.outputUrl,
      createdAt: editorProject.createdAt,
      updatedAt: editorProject.updatedAt
    })
  } catch (error) {
    console.error('Failed to get editor project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/editor/projects/[episodeId]
 * 保存编辑器项目
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const { episodeId } = await params
    const body = await request.json()
    const { projectData } = body

    // 验证数据
    const validation = validateProjectData(projectData)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid project data', details: validation.errors },
        { status: 400 }
      )
    }

    // 检查是否已存在
    const existing = await prisma.videoEditorProject.findUnique({
      where: { episodeId }
    })

    let result
    if (existing) {
      // 更新
      result = await prisma.videoEditorProject.update({
        where: { episodeId },
        data: {
          projectData: JSON.stringify(projectData),
          updatedAt: new Date()
        }
      })
    } else {
      // 创建
      result = await prisma.videoEditorProject.create({
        data: {
          episodeId,
          projectData: JSON.stringify(projectData)
        }
      })
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      updatedAt: result.updatedAt
    })
  } catch (error) {
    console.error('Failed to save editor project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/editor/projects/[episodeId]
 * 删除编辑器项目
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const { episodeId } = await params

    await prisma.videoEditorProject.delete({
      where: { episodeId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete editor project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
