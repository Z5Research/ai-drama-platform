import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// GET /api/characters/[id] - 获取角色详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const character = await prisma.character.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        appearances: {
          orderBy: { appearanceIndex: 'asc' }
        }
      }
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, character })
  } catch (error) {
    console.error('Get character error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/characters/[id] - 更新角色
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // 验证角色存在
    const existing = await prisma.character.findFirst({
      where: { id, userId: user.id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // 构建更新数据
    const updateData: any = {}
    
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.description !== undefined) updateData.description = body.description?.trim() || null
    if (body.aliases !== undefined) updateData.aliases = body.aliases ? JSON.stringify(body.aliases) : null
    if (body.profileData !== undefined) updateData.profileData = body.profileData ? JSON.stringify(body.profileData) : null
    if (body.traits !== undefined) updateData.traits = body.traits ? JSON.stringify(body.traits) : null
    if (body.introduction !== undefined) updateData.introduction = body.introduction?.trim() || null
    if (body.voiceId !== undefined) updateData.voiceId = body.voiceId || null
    if (body.voiceType !== undefined) updateData.voiceType = body.voiceType || null

    const character = await prisma.character.update({
      where: { id },
      data: updateData,
      include: {
        appearances: {
          orderBy: { appearanceIndex: 'asc' }
        }
      }
    })

    return NextResponse.json({ success: true, character })
  } catch (error) {
    console.error('Update character error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/characters/[id] - 删除角色
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // 验证角色存在
    const character = await prisma.character.findFirst({
      where: { id, userId: user.id }
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // 删除角色（级联删除 appearances）
    await prisma.character.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete character error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
