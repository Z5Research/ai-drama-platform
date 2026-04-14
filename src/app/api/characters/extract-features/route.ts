// 角色特征提取和一致性提示词生成API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { getDefaultAiService } from '@/lib/ai'

// POST /api/characters/extract-features - 提取角色特征
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { projectId } = body

    // 获取项目的剧本和角色
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
      include: {
        scripts: { orderBy: { createdAt: 'desc' }, take: 1 },
        characters: true,
      },
    })

    if (!project || !project.scripts[0]) {
      return NextResponse.json(
        { success: false, error: '项目或剧本不存在' },
        { status: 404 }
      )
    }

    const script = project.scripts[0]
    const aiService = getDefaultAiService()

    // 使用AI提取角色特征
    const extractPrompt = `分析以下剧本，提取每个角色的外貌特征和性格特点。请以JSON格式返回。

剧本标题：${script.title}
剧本内容：
${script.content}

要求：
1. 为每个角色提取：姓名、性别、年龄范围、外貌描述、性格特点、服装风格
2. 生成用于图像生成的一致性提示词
3. 确保描述具体、可视觉化

返回格式：
{
  "characters": [
    {
      "name": "角色名",
      "gender": "男/女",
      "age": "年龄段（如：25-30岁）",
      "appearance": "详细的外貌描述",
      "personality": "性格特点",
      "clothing": "服装风格",
      "consistencyPrompt": "用于图像生成的一致性提示词，包含所有外貌特征"
    }
  ]
}`

    const result = await aiService.generateText(extractPrompt, {
      system: '你是一个专业的影视角色设计师，擅长从剧本中提取角色特征并生成视觉化描述。',
      maxTokens: 2048,
      temperature: 0.7,
    })

    // 解析结果
    let characterFeatures
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        characterFeatures = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('无法解析AI返回的角色特征')
      }
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: '解析角色特征失败' },
        { status: 500 }
      )
    }

    // 更新角色信息
    const updatedCharacters = []
    for (const feature of characterFeatures.characters || []) {
      const existingChar = project.characters.find(
        (c) => c.name === feature.name || c.name.includes(feature.name)
      )

      if (existingChar) {
        const updated = await prisma.character.update({
          where: { id: existingChar.id },
          data: {
            description: feature.appearance,
            traits: `${feature.personality}；服装：${feature.clothing}`,
            profileData: JSON.stringify({
              gender: feature.gender,
              age: feature.age,
              consistencyPrompt: feature.consistencyPrompt,
            }),
          },
        })
        updatedCharacters.push(updated)
      } else {
        // 创建新角色
        const newChar = await prisma.character.create({
          data: {
            projectId,
            userId: user.id,
            name: feature.name,
            description: feature.appearance,
            traits: `${feature.personality}；服装：${feature.clothing}`,
            profileData: JSON.stringify({
              gender: feature.gender,
              age: feature.age,
              consistencyPrompt: feature.consistencyPrompt,
            }),
          },
        })
        updatedCharacters.push(newChar)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        characters: updatedCharacters,
        features: characterFeatures.characters,
      },
    })
  } catch (error) {
    console.error('Extract character features error:', error)
    return NextResponse.json(
      { success: false, error: '提取角色特征失败' },
      { status: 500 }
    )
  }
}