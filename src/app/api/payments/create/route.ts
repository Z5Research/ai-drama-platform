// 创建支付订单 API
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createWechatPayment, generateOrderNo } from '@/lib/payments/wechat'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createPaymentSchema = z.object({
  amount: z.number().min(1),
  paymentMethod: z.enum(['wechat', 'alipay']),
  packageId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { amount, paymentMethod, packageId } = createPaymentSchema.parse(body)
    
    // 获取套餐信息
    let creditsAmount = Math.floor(amount * 10) // 默认 1元=10积分
    let packageType = 'custom'
    
    if (packageId) {
      const pkg = await prisma.creditPackage.findUnique({
        where: { id: packageId },
      })
      
      if (pkg) {
        creditsAmount = pkg.credits + pkg.bonus
        packageType = pkg.name
      }
    }
    
    // 创建订单
    const orderNo = generateOrderNo()
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        orderNo,
        amount,
        paymentMethod,
        status: 'pending',
        packageId,
        packageType,
        creditsAmount,
      },
    })
    
    // 微信支付
    if (paymentMethod === 'wechat') {
      const result = await createWechatPayment({
        userId: user.id,
        amount,
        description: `智午AI漫剧 - ${packageType}`,
        packageId,
        packageType,
        creditsAmount,
      })
      
      return NextResponse.json({
        success: true,
        data: {
          orderNo: result.orderNo,
          qrCode: result.qrCode,
        },
      })
    }
    
    // 支付宝（暂未实现）
    return NextResponse.json(
      { success: false, error: '支付宝支付暂未开放' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { success: false, error: '创建订单失败' },
      { status: 500 }
    )
  }
}
