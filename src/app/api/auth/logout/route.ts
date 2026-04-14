// 用户登出
import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: '登出成功',
  })
  
  response.headers.set('Set-Cookie', clearAuthCookie())
  
  return response
}
