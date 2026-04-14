import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// GET /api/characters - 获取角色列表
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const global = searchParams.get('global')

    // 构建查询条件
    const where: any = { userId: user.id }
    
    if (global === 'true') {
      // 只获取全局角色
      where.isGlobal = true
    } else if (projectId) {
      // 获取项目角色
      where.projectId = projectId
    } else {
      // 获取所有角色（全局 + 用户的所有项目角色）
      delete where.projectId
    }

    const characters = await prisma.character.findMany({
      where,
      include: {
        appearances: {
          orderBy: { appearanceIndex: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, characters })
  } catch (error) {
    console.error('Get characters error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/characters - 创建角色
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      aliases,
      profileData,
      traits,
      introduction,
      voiceId,
      voiceType,
      projectId,
      isGlobal = false
    } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // 创建角色
    const character = await prisma.character.create({
      data: {
        userId: user.id,
        projectId: isGlobal ? null : projectId,
        name: name.trim(),
        description: description?.trim() || null,
        aliases: aliases ? JSON.stringify(aliases) : null,
        profileData: profileData ? JSON.stringify(profileData) : null,
        traits: traits ? JSON.stringify(traits) : null,
        introduction: introduction?.trim() || null,
        voiceId: voiceId || null,
        voiceType: voiceType || null,
        isGlobal
      },
      include: {
        appearances: true
      }
    })

    // 创建初始外观
    const appearance = await prisma.characterAppearance.create({
      data: {
        characterId: character.id,
        appearanceIndex: 0,
        changeReason: '初始形象',
        description: description || `${name} 的角色设定`,
        descriptions: JSON.stringify([description || `${name} 的角色设定`])
      }
    })

    return NextResponse.json({
      success: true,
      character: {
        ...character,
        appearances: [appearance]
      }
    })
  } catch (error) {
    console.error('Create character error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
