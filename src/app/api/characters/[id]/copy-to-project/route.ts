import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

// POST /api/characters/[id]/copy-to-project - 复制全局角色到项目
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: sourceCharacterId } = await params
    const body = await request.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    // 验证源角色存在
    const sourceCharacter = await prisma.character.findFirst({
      where: { id: sourceCharacterId, userId: user.id },
      include: {
        appearances: { orderBy: { appearanceIndex: 'asc' } }
      }
    })

    if (!sourceCharacter) {
      return NextResponse.json({ error: 'Source character not found' }, { status: 404 })
    }

    // 验证项目存在
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // 检查是否已经复制过
    const existingCopy = await prisma.character.findFirst({
      where: {
        projectId,
        sourceGlobalCharacterId: sourceCharacterId
      }
    })

    if (existingCopy) {
      return NextResponse.json({
        success: true,
        character: existingCopy,
        message: 'Character already copied to this project'
      })
    }

    // 创建项目角色副本
    const newCharacter = await prisma.character.create({
      data: {
        userId: user.id,
        projectId,
        name: sourceCharacter.name,
        description: sourceCharacter.description,
        aliases: sourceCharacter.aliases,
        profileData: sourceCharacter.profileData,
        traits: sourceCharacter.traits,
        introduction: sourceCharacter.introduction,
        voiceId: sourceCharacter.voiceId,
        voiceType: sourceCharacter.voiceType,
        isGlobal: false,
        sourceGlobalCharacterId: sourceCharacterId
      }
    })

    // 复制所有外观
    for (const appearance of sourceCharacter.appearances) {
      await prisma.characterAppearance.create({
        data: {
          characterId: newCharacter.id,
          appearanceIndex: appearance.appearanceIndex,
          changeReason: appearance.changeReason,
          description: appearance.description,
          descriptions: appearance.descriptions,
          imageUrl: appearance.imageUrl,
          imageUrls: appearance.imageUrls,
          selectedIndex: appearance.selectedIndex
        }
      })
    }

    // 获取完整的角色数据
    const characterWithAppearances = await prisma.character.findUnique({
      where: { id: newCharacter.id },
      include: {
        appearances: { orderBy: { appearanceIndex: 'asc' } }
      }
    })

    return NextResponse.json({
      success: true,
      character: characterWithAppearances
    })
  } catch (error) {
    console.error('Copy to project error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
