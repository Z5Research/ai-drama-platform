// 管理员 API - 更新用户
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().optional(),
  role: z.enum(['user', 'vip', 'admin']).optional(),
  status: z.enum(['active', 'suspended', 'deleted']).optional(),
  credits: z.number().int().optional(),
  vipLevel: z.number().int().min(0).max(3).optional(),
  vipExpiredAt: z.string().nullable().optional(),
})

// PUT /api/admin/users/[id] - 更新用户
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const data = updateUserSchema.parse(body)

    // 防止管理员降级自己
    if (id === admin.id && data.role && data.role !== 'admin') {
      return NextResponse.json({ error: '不能修改自己的管理员角色' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        vipExpiredAt: data.vipExpiredAt ? new Date(data.vipExpiredAt) : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        credits: true,
        vipLevel: true,
        vipExpiredAt: true,
      }
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params

    // 防止删除自己
    if (id === admin.id) {
      return NextResponse.json({ error: '不能删除自己的账号' }, { status: 400 })
    }

    // 软删除：更新状态为 deleted
    const user = await prisma.user.update({
      where: { id },
      data: { status: 'deleted' },
    })

    return NextResponse.json({ success: true, message: '用户已禁用' })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}