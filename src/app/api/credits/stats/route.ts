// 积分统计 API
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getCreditStats } from '@/lib/credits'

export async function GET() {
  try {
    const user = await requireAuth()
    const stats = await getCreditStats(user.id)
    
    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('Get credit stats error:', error)
    return NextResponse.json(
      { success: false, error: '获取积分统计失败' },
      { status: 500 }
    )
  }
}
