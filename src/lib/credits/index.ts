// 积分系统核心逻辑
import { prisma } from '../db'
import { CreditLog, CreditPackage, User } from '@prisma/client'

// 积分套餐配置
export const DEFAULT_PACKAGES: Omit<CreditPackage, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: '入门包', credits: 100, price: 10, bonus: 0, validity: 30, isActive: true, sortOrder: 1 },
  { name: '基础包', credits: 500, price: 45, bonus: 50, validity: 90, isActive: true, sortOrder: 2 },
  { name: '标准包', credits: 1000, price: 80, bonus: 150, validity: 180, isActive: true, sortOrder: 3 },
  { name: '专业包', credits: 3000, price: 200, bonus: 600, validity: 365, isActive: true, sortOrder: 4 },
  { name: '企业包', credits: 10000, price: 600, bonus: 3000, validity: 365, isActive: true, sortOrder: 5 },
]

// VIP 套餐配置
export const VIP_PACKAGES = [
  { level: 1, name: '月卡会员', price: 99, duration: 30, credits: 500, features: ['无限制AI对话', '高清图像生成', '优先技术支持'] },
  { level: 2, name: '季卡会员', price: 249, duration: 90, credits: 2000, features: ['无限制AI对话', '高清图像生成', '视频生成', '专属客服'] },
  { level: 3, name: '年卡会员', price: 799, duration: 365, credits: 10000, features: ['全部功能无限制', 'API调用额度', '专属技术顾问', '定制化服务'] },
]

// 积分操作类型
export enum CreditActionType {
  RECHARGE = 'recharge',      // 充值
  CONSUME = 'consume',        // 消费
  GIFT = 'gift',              // 赠送
  REFUND = 'refund',          // 退款
  EXPIRE = 'expire',          // 过期
  VIP_BONUS = 'vip_bonus',    // VIP赠送
}

// 积分来源
export enum CreditSource {
  PAYMENT = 'payment',        // 支付购买
  AI_SCRIPT = 'ai_script',    // 剧本生成
  AI_IMAGE = 'ai_image',      // 图像生成
  AI_VIDEO = 'ai_video',      // 视频生成
  SYSTEM = 'system',          // 系统赠送
  VIP = 'vip',                // VIP权益
}

// 初始化积分套餐
export async function initCreditPackages() {
  const existing = await prisma.creditPackage.count()
  if (existing > 0) return
  
  await prisma.creditPackage.createMany({
    data: DEFAULT_PACKAGES,
  })
}

// 获取所有套餐
export async function getCreditPackages(): Promise<CreditPackage[]> {
  return prisma.creditPackage.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
}

// 充值积分
export async function rechargeCredits(
  userId: string,
  amount: number,
  options: {
    source: CreditSource
    sourceId?: string
    description?: string
    packageType?: string
    validity?: number
  }
): Promise<CreditLog> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')
  
  const newBalance = user.credits + amount
  const expiredAt = options.validity
    ? new Date(Date.now() + options.validity * 24 * 60 * 60 * 1000)
    : null
  
  return prisma.creditLog.create({
    data: {
      userId,
      amount,
      balance: newBalance,
      type: CreditActionType.RECHARGE,
      source: options.source,
      sourceId: options.sourceId,
      description: options.description,
      packageType: options.packageType,
      expiredAt,
    },
  })
}

// 消费积分
export async function consumeCredits(
  userId: string,
  amount: number,
  options: {
    source: CreditSource
    sourceId?: string
    description?: string
  }
): Promise<CreditLog> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')
  
  if (user.credits < amount) {
    throw new Error('Insufficient credits')
  }
  
  const newBalance = user.credits - amount
  
  // 使用事务更新用户余额和创建日志
  const [log] = await prisma.$transaction([
    prisma.creditLog.create({
      data: {
        userId,
        amount: -amount,
        balance: newBalance,
        type: CreditActionType.CONSUME,
        source: options.source,
        sourceId: options.sourceId,
        description: options.description,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { credits: newBalance },
    }),
  ])
  
  return log
}

// 检查积分余额
export async function checkCredits(userId: string, requiredAmount: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  })
  
  return user ? user.credits >= requiredAmount : false
}

// 获取积分明细
export async function getCreditLogs(
  userId: string,
  options: {
    type?: CreditActionType
    limit?: number
    offset?: number
  } = {}
) {
  const { type, limit = 20, offset = 0 } = options
  
  return prisma.creditLog.findMany({
    where: {
      userId,
      ...(type && { type }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })
}

// 获取积分统计
export async function getCreditStats(userId: string) {
  const [totalRecharged, totalConsumed, totalGift, logs] = await Promise.all([
    prisma.creditLog.aggregate({
      where: { userId, type: CreditActionType.RECHARGE },
      _sum: { amount: true },
    }),
    prisma.creditLog.aggregate({
      where: { userId, type: CreditActionType.CONSUME },
      _sum: { amount: true },
    }),
    prisma.creditLog.aggregate({
      where: { userId, type: CreditActionType.GIFT },
      _sum: { amount: true },
    }),
    prisma.creditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true, totalCredits: true },
  })
  
  return {
    balance: user?.credits || 0,
    totalRecharged: totalRecharged._sum.amount || 0,
    totalConsumed: Math.abs(totalConsumed._sum.amount || 0),
    totalGift: totalGift._sum.amount || 0,
    recentLogs: logs,
  }
}

// 过期积分处理（定时任务调用）
export async function expireCredits() {
  const now = new Date()
  
  const expiredLogs = await prisma.creditLog.findMany({
    where: {
      type: CreditActionType.RECHARGE,
      expiredAt: { lt: now },
      // 已过期的积分通过 balance 和 amount 计算
    },
  })
  
  // 这里简化处理，实际需要更复杂的逻辑来追踪每笔积分的使用情况
  console.log(`Found ${expiredLogs.length} expired credit logs`)
}

// VIP 相关
export async function activateVIP(
  userId: string,
  level: number,
  duration: number,
  bonusCredits: number
) {
  const expiredAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
  
  // 先获取用户当前余额
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  })
  const currentBalance = user?.credits || 0
  const newBalance = currentBalance + bonusCredits
  
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        vipLevel: level,
        vipExpiredAt: expiredAt,
        credits: { increment: bonusCredits },
        totalCredits: { increment: bonusCredits },
      },
    }),
    prisma.creditLog.create({
      data: {
        userId,
        amount: bonusCredits,
        balance: newBalance,
        type: CreditActionType.VIP_BONUS,
        source: CreditSource.VIP,
        description: `VIP ${level} 升级赠送`,
      },
    }),
  ])
}

// 检查VIP状态
export async function checkVIPStatus(userId: string): Promise<{
  isVIP: boolean
  level: number
  expiredAt: Date | null
  daysLeft: number
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { vipLevel: true, vipExpiredAt: true },
  })
  
  if (!user || user.vipLevel === 0) {
    return { isVIP: false, level: 0, expiredAt: null, daysLeft: 0 }
  }
  
  const now = new Date()
  const expiredAt = user.vipExpiredAt
  
  if (!expiredAt || expiredAt < now) {
    // VIP已过期，更新状态
    await prisma.user.update({
      where: { id: userId },
      data: { vipLevel: 0, vipExpiredAt: null },
    })
    return { isVIP: false, level: 0, expiredAt: null, daysLeft: 0 }
  }
  
  const daysLeft = Math.ceil((expiredAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  
  return {
    isVIP: true,
    level: user.vipLevel,
    expiredAt,
    daysLeft,
  }
}
