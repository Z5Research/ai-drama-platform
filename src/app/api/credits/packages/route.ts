// 积分套餐 API
import { NextResponse } from 'next/server'
import { getCreditPackages } from '@/lib/credits'

export async function GET() {
  try {
    const packages = await getCreditPackages()
    
    return NextResponse.json({
      success: true,
      data: packages,
    })
  } catch (error) {
    console.error('Get packages error:', error)
    return NextResponse.json(
      { success: false, error: '获取套餐失败' },
      { status: 500 }
    )
  }
}
