// 微信支付回调
import { NextRequest, NextResponse } from 'next/server'
import { handleWechatNotify } from '@/lib/payments/wechat'

export async function POST(request: NextRequest) {
  try {
    const xmlData = await request.text()
    const result = await handleWechatNotify(xmlData)
    
    return new NextResponse(result, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('Wechat notify error:', error)
    return new NextResponse('<xml><return_code><![CDATA[FAIL]]></return_code></xml>', {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
}
