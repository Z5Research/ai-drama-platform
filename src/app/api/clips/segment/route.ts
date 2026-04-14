// AI Script Segmentation API - 自动分割剧本为Clips
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { getDefaultAiService } from '@/lib/ai'
import { z } from 'zod'

const segmentScriptSchema = z.object({
  episodeId: z.string(),
  scriptContent: z.string().min(50, '剧本内容至少50字符'),
  aiModel: z.enum(['gpt-4', 'gpt-4o', 'claude-3', 'qwen', 'glm-4', 'glm-5', 'qwen-plus', 'qwen-max']).optional(),
})

// AI分割提示词模板
const SEGMENTATION_PROMPT = `你是一个专业的影视分镜师。请将以下剧本内容分割为多个独立的分镜片段。

每个分镜片段应包含：
1. 场景信息：地点、时间、氛围
2. 角色信息：出场角色列表
3. 视觉指导：镜头类型、镜头运动
4. 剧本内容：该片段的原始剧本文本

请以JSON格式输出，结构如下：
{
  "clips": [
    {
      "title": "分镜标题",
      "content": "原始剧本内容",
      "summary": "简要摘要",
      "location": "场景地点",
      "timeOfDay": "时间",
      "mood": "氛围",
      "characters": ["角色1", "角色2"],
      "shotType": "镜头类型",
      "cameraMovement": "镜头运动",
      "visualPrompt": "AI图像生成提示词"
    }
  ]
}

剧本内容：
`

// 调用AI进行分割
async function callAiSegmentation(scriptContent: string, aiModel: string): Promise<any[]> {
  try {
    const aiService = getDefaultAiService()
    const clips = await aiService.segmentScript({
      script: scriptContent,
      model: aiModel,
    })
    
    return clips
  } catch (error) {
    console.error('AI分割失败，使用备用方案:', error)
    
    // 备用方案：按自然段落分割
    const paragraphs = scriptContent.split(/\n\n+/).filter(p => p.trim().length > 20)
    
    return paragraphs.map((para, index) => ({
      title: `分镜 ${index + 1}`,
      content: para.trim(),
      summary: para.slice(0, 50) + '...',
      location: '默认场景',
      timeOfDay: '白天',
      mood: '正常',
      characters: [],
      shotType: '中景',
      cameraMovement: '固定',
      visualPrompt: `场景描述：${para.slice(0, 100)}`,
    }))
  }
}

// POST - AI分割剧本
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const data = segmentScriptSchema.parse(body)
    
    // 验证剧集所有权
    const episode = await prisma.episode.findFirst({
      where: { id: data.episodeId },
      include: { project: { select: { userId: true, aiModel: true } } },
    })
    
    if (!episode) {
      return NextResponse.json({ success: false, error: '剧集不存在' }, { status: 404 })
    }
    
    if (episode.project.userId !== user.id) {
      return NextResponse.json({ success: false, error: '无权访问' }, { status: 403 })
    }
    
    // 使用指定的模型或项目的默认模型
    const aiModel = data.aiModel || episode.project.aiModel
    
    // 调用AI分割
    const clipsData = await callAiSegmentation(data.scriptContent, aiModel)
    
    // 删除现有的分镜（如果有的话）
    await prisma.clip.deleteMany({ where: { episodeId: data.episodeId } })
    
    // 创建新的分镜
    const clips = await prisma.$transaction(
      clipsData.map((clip, index) =>
        prisma.clip.create({
          data: {
            episodeId: data.episodeId,
            clipNumber: index + 1,
            content: clip.content,
            summary: clip.summary,
            location: clip.location,
            characters: JSON.stringify(clip.characters),
            props: '',
          },
        })
      )
    )
    
    // 更新剧集状态
    await prisma.episode.update({
      where: { id: data.episodeId },
      data: {
        novelText: data.scriptContent,
        status: 'completed',
      },
    })
    
    return NextResponse.json({
      success: true,
      data: {
        clips,
        episode: {
          id: episode.id,
          clipCount: clips.length,
          status: 'script_done',
        },
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues[0].message }, { status: 400 })
    }
    console.error('Segment script error:', error)
    return NextResponse.json({ success: false, error: '分割剧本失败' }, { status: 500 })
  }
}
