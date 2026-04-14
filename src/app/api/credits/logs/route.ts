// 积分明细 API
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getCreditLogs, CreditActionType } from '@/lib/credits'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    
    const type = searchParams.get('type') as CreditActionType | null
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    
    const logs = await getCreditLogs(user.id, {
      type: type || undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })
    
    return NextResponse.json({
      success: true,
      data: logs,
    })
  } catch (error) {
    console.error('Get credit logs error:', error)
    return NextResponse.json(
      { success: false, error: '获取积分明细失败' },
      { status: 500 }
    )
  }
}
