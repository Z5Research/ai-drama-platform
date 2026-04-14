// 支付系统 - 微信支付
import crypto from 'crypto'
import axios from 'axios'
import { prisma } from '../db'
import { Payment } from '@prisma/client'

// 微信支付配置
const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APP_ID!,
  mchId: process.env.WECHAT_MCH_ID!,
  apiKey: process.env.WECHAT_API_KEY!,
  notifyUrl: process.env.WECHAT_NOTIFY_URL!,
}

// 生成订单号
export function generateOrderNo(): string {
  const now = new Date()
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0')
  
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ZW${timestamp}${random}`
}

// 创建微信支付订单
export async function createWechatPayment(options: {
  userId: string
  amount: number
  description: string
  packageId?: string
  packageType?: string
  creditsAmount?: number
}): Promise<{ orderNo: string; prepaidId: string; qrCode: string }> {
  const { userId, amount, description, packageId, packageType, creditsAmount } = options
  
  // 创建数据库订单
  const orderNo = generateOrderNo()
  const payment = await prisma.payment.create({
    data: {
      userId,
      orderNo,
      amount,
      paymentMethod: 'wechat',
      status: 'pending',
      packageId,
      packageType,
      creditsAmount,
    },
  })
  
  // 调用微信统一下单API
  // 注意：这里简化实现，实际需要使用微信支付SDK
  const params = {
    appid: WECHAT_CONFIG.appId,
    mch_id: WECHAT_CONFIG.mchId,
    nonce_str: crypto.randomBytes(16).toString('hex'),
    body: description,
    out_trade_no: orderNo,
    total_fee: Math.floor(amount * 100), // 分
    spbill_create_ip: '127.0.0.1',
    notify_url: WECHAT_CONFIG.notifyUrl,
    trade_type: 'NATIVE', // 扫码支付
  }
  
  // 签名
  const sign = generateWechatSign(params)
  
  // 调用微信API
  const xmlParams: Record<string, string> = {
    appid: params.appid,
    mch_id: params.mch_id,
    nonce_str: params.nonce_str,
    body: params.body,
    out_trade_no: params.out_trade_no,
    total_fee: String(params.total_fee),
    spbill_create_ip: params.spbill_create_ip,
    notify_url: params.notify_url,
    trade_type: params.trade_type,
    sign,
  }
  
  const response = await axios.post(
    'https://api.mch.weixin.qq.com/pay/unifiedorder',
    buildXml(xmlParams),
    { headers: { 'Content-Type': 'application/xml' } }
  )
  
  const result = parseXml(response.data)
  
  if (result.return_code !== 'SUCCESS' || result.result_code !== 'SUCCESS') {
    throw new Error(result.return_msg || 'Wechat payment failed')
  }
  
  // 更新订单
  await prisma.payment.update({
    where: { id: payment.id },
    data: { prepaidId: result.prepay_id },
  })
  
  return {
    orderNo,
    prepaidId: result.prepay_id,
    qrCode: result.code_url,
  }
}

// 微信支付回调处理
export async function handleWechatNotify(xmlData: string): Promise<string> {
  const data = parseXml(xmlData)
  
  // 验证签名
  const sign = data.sign
  delete data.sign
  const expectedSign = generateWechatSign(data)
  
  if (sign !== expectedSign) {
    return buildXml({ return_code: 'FAIL', return_msg: '签名验证失败' })
  }
  
  if (data.return_code !== 'SUCCESS' || data.result_code !== 'SUCCESS') {
    return buildXml({ return_code: 'FAIL', return_msg: '支付失败' })
  }
  
  const orderNo = data.out_trade_no
  const transactionId = data.transaction_id
  const paidFee = parseInt(data.total_fee) // 微信返回的是分
  const timeEnd = data.time_end // 支付完成时间 YYYYMMDDHHmmss
  
  // 验证时间戳，防止重放攻击 (5分钟内有效)
  if (timeEnd) {
    const payTime = parseWechatTime(timeEnd)
    const now = new Date()
    const diffMs = now.getTime() - payTime.getTime()
    if (diffMs > 5 * 60 * 1000) {
      return buildXml({ return_code: 'FAIL', return_msg: '回调已过期' })
    }
  }
  
  // 查找订单
  const payment = await prisma.payment.findUnique({
    where: { orderNo },
  })
  
  if (!payment) {
    return buildXml({ return_code: 'FAIL', return_msg: '订单不存在' })
  }
  
  // 验证金额（微信单位为分，数据库为元）
  const expectedFee = Math.floor(payment.amount * 100)
  if (Math.abs(expectedFee - paidFee) > 1) { // 允许1分误差
    console.error(`金额不一致: 订单 ${orderNo}, 期望 ${expectedFee}分, 实际 ${paidFee}分`)
    return buildXml({ return_code: 'FAIL', return_msg: '金额不一致' })
  }
  
  if (payment.status === 'paid') {
    return buildXml({ return_code: 'SUCCESS', return_msg: 'OK' })
  }
  
  // 使用事务更新订单和充值积分
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'paid',
        transactionId,
        paidAt: new Date(),
      },
    }),
    ...(payment.creditsAmount ? [
      prisma.user.update({
        where: { id: payment.userId },
        data: {
          credits: { increment: payment.creditsAmount },
          totalCredits: { increment: payment.creditsAmount },
        },
      }),
      prisma.creditLog.create({
        data: {
          userId: payment.userId,
          amount: payment.creditsAmount,
          balance: 0, // 将在事务后更新
          type: 'purchase',
          description: `购买积分 - 订单 ${orderNo}`,
        },
      }),
    ] : []),
  ])
  
  return buildXml({ return_code: 'SUCCESS', return_msg: 'OK' })
}

// 解析微信时间格式 YYYYMMDDHHmmss
function parseWechatTime(timeStr: string): Date {
  const year = parseInt(timeStr.substring(0, 4))
  const month = parseInt(timeStr.substring(4, 6)) - 1
  const day = parseInt(timeStr.substring(6, 8))
  const hour = parseInt(timeStr.substring(8, 10))
  const minute = parseInt(timeStr.substring(10, 12))
  const second = parseInt(timeStr.substring(12, 14))
  return new Date(year, month, day, hour, minute, second)
}

// 生成微信签名
function generateWechatSign(params: Record<string, any>): string {
  const sortedKeys = Object.keys(params).sort()
  const stringA = sortedKeys
    .filter(key => params[key] !== '' && key !== 'sign')
    .map(key => `${key}=${params[key]}`)
    .join('&')
  
  const stringSignTemp = `${stringA}&key=${WECHAT_CONFIG.apiKey}`
  return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase()
}

// 构建XML
function buildXml(data: Record<string, string>): string {
  let xml = '<xml>'
  for (const [key, value] of Object.entries(data)) {
    xml += `<${key}><![CDATA[${value}]]></${key}>`
  }
  xml += '</xml>'
  return xml
}

// 解析XML
function parseXml(xml: string): Record<string, string> {
  const result: Record<string, string> = {}
  const regex = /<(\w+)><!\[CDATA\[(.*?)\]\]><\/\1>|<(\w+)>(.*?)<\/\3>/g
  let match
  
  while ((match = regex.exec(xml)) !== null) {
    const key = match[1] || match[3]
    const value = match[2] || match[4]
    if (key) result[key] = value
  }
  
  return result
}

// 查询订单状态
export async function queryPaymentStatus(orderNo: string): Promise<Payment> {
  const payment = await prisma.payment.findUnique({
    where: { orderNo },
  })
  
  if (!payment) {
    throw new Error('Payment not found')
  }
  
  return payment
}
