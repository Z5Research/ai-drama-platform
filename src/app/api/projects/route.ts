// 项目 API - Optimized
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const createProjectSchema = z.object({
  title: z.string().min(1, '项目名称不能为空'),
  description: z.string().optional(),
  aiModel: z.string().default('gpt-4'),
  visibility: z.enum(['private', 'public']).default('private'),
})

// 获取项目列表 - Optimized query
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Add limit param, max 50
    const status = searchParams.get('status')
    
    const where: any = { userId: user.id }
    if (status) where.status = status
    
    // Optimized: Use select instead of include, reduce data transfer
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          workflowStage: true,
          coverImage: true,
          createdAt: true,
          updatedAt: true,
          // Include only essential counts
          _count: {
            select: {
              episodes: true,
              characters: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ])
    
    return NextResponse.json(
      {
        success: true,
        projects,
        total,
        page,
        pageSize: limit,
        hasMore: page * limit < total,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        },
      }
    )
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { success: false, error: '获取项目列表失败' },
      { status: 500 }
    )
  }
}

// 创建项目
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const data = createProjectSchema.parse(body)
    
    const project = await prisma.project.create({
      data: {
        ...data,
        userId: user.id,
      },
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
    
    console.error('Create project error:', error)
    return NextResponse.json(
      { success: false, error: '创建项目失败: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
