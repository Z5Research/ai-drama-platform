import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// GET /api/characters/[id]/appearances - 获取角色外观列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: characterId } = await params

    // 验证角色存在
    const character = await prisma.character.findFirst({
      where: { id: characterId, userId: user.id }
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    const appearances = await prisma.characterAppearance.findMany({
      where: { characterId },
      orderBy: { appearanceIndex: 'asc' }
    })

    return NextResponse.json({ success: true, appearances })
  } catch (error) {
    console.error('Get appearances error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/characters/[id]/appearances - 添加新外观
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: characterId } = await params
    const body = await request.json()
    const { changeReason, description } = body

    if (!changeReason || !description) {
      return NextResponse.json({ error: 'changeReason and description are required' }, { status: 400 })
    }

    // 验证角色存在
    const character = await prisma.character.findFirst({
      where: { id: characterId, userId: user.id },
      include: {
        appearances: { orderBy: { appearanceIndex: 'asc' } }
      }
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // 计算新的 appearanceIndex
    const maxIndex = character.appearances.reduce(
      (max, app) => Math.max(max, app.appearanceIndex),
      0
    )
    const newIndex = maxIndex + 1

    // 创建新外观
    const appearance = await prisma.characterAppearance.create({
      data: {
        characterId,
        appearanceIndex: newIndex,
        changeReason: changeReason.trim(),
        description: description.trim(),
        descriptions: JSON.stringify([description.trim()])
      }
    })

    return NextResponse.json({ success: true, appearance })
  } catch (error) {
    console.error('Create appearance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/characters/[id]/appearances - 更新外观
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: characterId } = await params
    const body = await request.json()
    const { appearanceId, description, imageUrl, imageUrls, selectedIndex } = body

    if (!appearanceId) {
      return NextResponse.json({ error: 'appearanceId is required' }, { status: 400 })
    }

    // 验证角色存在
    const character = await prisma.character.findFirst({
      where: { id: characterId, userId: user.id }
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // 验证外观存在
    const appearance = await prisma.characterAppearance.findUnique({
      where: { id: appearanceId }
    })

    if (!appearance || appearance.characterId !== characterId) {
      return NextResponse.json({ error: 'Appearance not found' }, { status: 404 })
    }

    // 构建更新数据
    const updateData: any = {}
    
    if (description !== undefined) {
      updateData.description = description.trim()
      // 更新 descriptions 数组
      let descriptions: string[] = []
      try {
        descriptions = appearance.descriptions ? JSON.parse(appearance.descriptions) : []
      } catch {
        descriptions = []
      }
      if (descriptions.length > 0) {
        descriptions[0] = description.trim()
      } else {
        descriptions.push(description.trim())
      }
      updateData.descriptions = JSON.stringify(descriptions)
    }
    
    if (imageUrl !== undefined) {
      // 保存旧值用于撤回
      updateData.previousImageUrl = appearance.imageUrl
      updateData.imageUrl = imageUrl
    }
    
    if (imageUrls !== undefined) {
      // 保存旧值用于撤回
      updateData.previousImageUrls = appearance.imageUrls
      updateData.imageUrls = imageUrls ? JSON.stringify(imageUrls) : null
    }
    
    if (selectedIndex !== undefined) {
      updateData.selectedIndex = selectedIndex
    }

    const updatedAppearance = await prisma.characterAppearance.update({
      where: { id: appearanceId },
      data: updateData
    })

    return NextResponse.json({ success: true, appearance: updatedAppearance })
  } catch (error) {
    console.error('Update appearance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/characters/[id]/appearances - 删除外观
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: characterId } = await params
    const { searchParams } = new URL(request.url)
    const appearanceId = searchParams.get('appearanceId')

    if (!appearanceId) {
      return NextResponse.json({ error: 'appearanceId is required' }, { status: 400 })
    }

    // 验证角色存在
    const character = await prisma.character.findFirst({
      where: { id: characterId, userId: user.id }
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // 检查是否是最后一个外观
    const appearanceCount = await prisma.characterAppearance.count({
      where: { characterId }
    })

    if (appearanceCount <= 1) {
      return NextResponse.json({ error: 'Cannot delete the last appearance' }, { status: 400 })
    }

    // 删除外观
    await prisma.characterAppearance.delete({
      where: { id: appearanceId }
    })

    // 重新排序剩余外观的索引
    const remainingAppearances = await prisma.characterAppearance.findMany({
      where: { characterId },
      orderBy: { appearanceIndex: 'asc' }
    })

    for (let i = 0; i < remainingAppearances.length; i++) {
      if (remainingAppearances[i].appearanceIndex !== i) {
        await prisma.characterAppearance.update({
          where: { id: remainingAppearances[i].id },
          data: { appearanceIndex: i }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete appearance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
