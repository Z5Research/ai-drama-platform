// AI 剧本生成 API
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { AIClient, calculateCredits } from '@/lib/ai/models'
import { consumeCredits, checkCredits, CreditSource } from '@/lib/credits'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const generateScriptSchema = z.object({
  projectId: z.string(),
  prompt: z.string().min(10, '提示词至少10个字符'),
  genre: z.string().optional(),
  style: z.string().optional(),
  model: z.string().default('gpt-4'),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { projectId, prompt, genre, style, model } = generateScriptSchema.parse(body)
    
    // 验证项目所有权
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
    })
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: '项目不存在' },
        { status: 404 }
      )
    }
    
    // 预估积分消耗（粗略估算：prompt + 输出）
    const estimatedInputTokens = Math.ceil(prompt.length / 4) // 中文约4字符/token
    const estimatedOutputTokens = 2000 // 预估输出
    const estimatedCredits = calculateCredits(
      model as any,
      estimatedInputTokens,
      estimatedOutputTokens
    )
    
    // 检查积分余额
    const hasCredits = await checkCredits(user.id, estimatedCredits)
    if (!hasCredits) {
      return NextResponse.json(
        { success: false, error: '积分不足，请充值' },
        { status: 402 }
      )
    }
    
    // 构建系统提示
    const systemPrompt = `你是一个专业的剧本创作助手。请根据用户的提示创作剧本内容。
要求：
1. 结构清晰，包含场景描述、角色对话、动作说明
2. 对话自然，符合角色性格
3. 情节紧凑，有戏剧冲突
4. 控制在60秒时长（约150-200字对话）
${genre ? `5. 类型：${genre}` : ''}
${style ? `6. 风格：${style}` : ''}

请用JSON格式返回：
{
  "title": "剧本标题",
  "content": "完整剧本内容（使用Markdown格式）",
  "characters": ["角色1", "角色2"],
  "scenes": ["场景1", "场景2"]
}`
    
    // 调用 AI
    const client = new AIClient(model as any)
    const startTime = Date.now()
    
    const result = await client.generateText(prompt, {
      system: systemPrompt,
      maxTokens: 2048, // 减少token以加快响应
      temperature: 0.8,
    })
    
    const latency = Date.now() - startTime
    
    // 解析结果
    let scriptData
    try {
      // 尝试提取JSON
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        scriptData = JSON.parse(jsonMatch[0])
      } else {
        scriptData = {
          title: 'AI生成剧本',
          content: result.text,
          characters: [],
          scenes: [],
        }
      }
    } catch {
      scriptData = {
        title: 'AI生成剧本',
        content: result.text,
        characters: [],
        scenes: [],
      }
    }
    
    // 消费积分
    await consumeCredits(user.id, result.credits, {
      source: CreditSource.AI_SCRIPT,
      sourceId: projectId,
      description: `剧本生成 - ${model}`,
    })
    
    // 保存剧本
    const script = await prisma.script.create({
      data: {
        projectId,
        userId: user.id,
        title: scriptData.title,
        content: scriptData.content,
        genre,
        style,
        isAiGenerated: true,
        aiModel: model,
        prompt,
        creditsCost: result.credits,
      },
    })
    
    // 自动创建角色
    const createdCharacters = []
    if (scriptData.characters && scriptData.characters.length > 0) {
      for (const charName of scriptData.characters) {
        const character = await prisma.character.create({
          data: {
            projectId,
            userId: user.id,
            name: charName,
            description: `剧本角色：${charName}`,
          },
        })
        createdCharacters.push(character)
      }
    }
    
    // 自动创建分镜（通过Episode -> Clip -> Storyboard -> Panel）
    const createdPanels = []
    if (scriptData.scenes && scriptData.scenes.length > 0) {
      // 创建剧集
      const episode = await prisma.episode.create({
        data: {
          projectId,
          episodeNumber: 1,
          title: scriptData.title,
        },
      })
      
      // 创建片段
      const clip = await prisma.clip.create({
        data: {
          episodeId: episode.id,
          clipNumber: 1,
          content: 'AI生成的分镜内容',
          duration: 0,
        },
      })
      
      // 创建分镜板
      const storyboard = await prisma.storyboard.create({
        data: {
          episodeId: episode.id,
          clipId: clip.id,
        },
      })
      
      // 创建面板
      for (let i = 0; i < scriptData.scenes.length; i++) {
        const panel = await prisma.panel.create({
          data: {
            storyboardId: storyboard.id,
            panelIndex: i,
            panelNumber: i + 1,
            description: scriptData.scenes[i],
            imagePrompt: scriptData.scenes[i],
          },
        })
        createdPanels.push(panel)
      }
    }
    
    // 记录AI使用日志
    await prisma.aiUsageLog.create({
      data: {
        userId: user.id,
        model,
        type: 'text',
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        totalTokens: result.inputTokens + result.outputTokens,
        creditsCost: result.credits,
        projectId,
        latency,
        status: 'success',
      },
    })
    
    return NextResponse.json({
      success: true,
      data: {
        script,
        characters: createdCharacters,
        panels: createdPanels,
        credits: result.credits,
      },
    })
  } catch (error) {
    console.error('Generate script error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, error: `生成失败: ${errorMessage}` },
      { status: 500 }
    )
  }
}
