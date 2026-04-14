// 管理员 API 路由 - 统计数据
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/admin/stats - 系统统计
export async function GET(request: NextRequest) {
  try {
    // 强制管理员权限验证
    await requireAdmin()
    
    // 获取统计数据
    const [users, projects, episodes, panels, voiceLines] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.episode.count(),
      prisma.panel.count(),
      prisma.voiceLine.count(),
    ])
    
    // 获取最近7天的数据
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const [newUsers, newProjects, imageGenerations, videoGenerations] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.project.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.panel.count({
        where: {
          createdAt: { gte: sevenDaysAgo },
          imageStatus: 'completed',
        },
      }),
      prisma.panel.count({
        where: {
          createdAt: { gte: sevenDaysAgo },
          videoStatus: 'completed',
        },
      }),
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        totals: { users, projects, episodes, panels, voiceLines },
        weekly: { newUsers, newProjects, imageGenerations, videoGenerations },
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}