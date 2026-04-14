/**
 * AI 服务统一抽象层
 * 支持多提供商：阿里云百炼、火山方舟、OpenAI 等
 */

// ========================================
// 类型定义
// ========================================

export type AiProvider = 'bailian' | 'volcengine' | 'openai' | 'anthropic' | 'zhipu' | 'alibaba' | 'custom'

export interface AiConfig {
  provider: AiProvider
  apiKey: string
  baseUrl?: string
  model?: string
}

export interface GenerateImageOptions {
  prompt: string
  negativePrompt?: string
  size?: '1024x1024' | '1024x1792' | '1792x1024' | '512x896' | '896x512'
  count?: number
  style?: 'realistic' | 'anime' | '3d' | 'sketch'
}

export interface GenerateVideoOptions {
  prompt: string
  imageUrl?: string
  duration?: number // 秒
  aspectRatio?: '16:9' | '9:16' | '1:1'
  quality?: 'standard' | 'high'
}

export interface GenerateAudioOptions {
  text: string
  voiceId?: string
  speed?: number
  emotion?: string
  emotionStrength?: number
}

export interface SegmentScriptOptions {
  script: string
  model?: string
}

export interface ClipData {
  title: string
  content: string
  summary: string
  location: string
  timeOfDay: string
  mood: string
  characters: string[]
  shotType: string
  cameraMovement: string
  visualPrompt: string
}

// ========================================
// 提供商配置
// ========================================

export const PROVIDER_CONFIGS = {
  bailian: {
    name: '阿里云百炼',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: {
      text: ['glm-5', 'qwen-plus', 'qwen-max', 'qwen3.5-plus'],
      image: ['wanx2.1-t2i-plus', 'wanx2.1-t2i-turbo', 'wanx-v1'],
      video: ['wan2.6-i2v', 'wan2.5-i2v'],
      audio: ['cosyvoice-v1'],
    },
  },
  volcengine: {
    name: '火山方舟',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    models: {
      text: ['doubao-pro-32k', 'doubao-pro-128k', 'doubao-lite-32k'],
      image: ['seedream-3.0', 'flux-dev'],
      video: ['seedance-1.0-pro', 'seedance-1.0-lite'],
      audio: ['doubao-tts'],
    },
  },
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    models: {
      text: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      image: ['dall-e-3', 'dall-e-2'],
      audio: ['tts-1', 'tts-1-hd'],
    },
  },
}

// ========================================
// AI 服务基类
// ========================================

export abstract class AiService {
  protected config: AiConfig

  constructor(config: AiConfig) {
    this.config = config
  }

  abstract generateImage(options: GenerateImageOptions): Promise<string[]>
  abstract generateVideo(options: GenerateVideoOptions): Promise<string>
  abstract generateAudio(options: GenerateAudioOptions): Promise<string>
  abstract segmentScript(options: SegmentScriptOptions): Promise<ClipData[]>
}

// ========================================
// 百炼服务实现
// ========================================

export class BailianService extends AiService {
  private client: any
  private readonly timeout = 120000 // 2分钟超时

  constructor(config: AiConfig) {
    super(config)
    // 动态导入 OpenAI SDK
  }

  /**
   * 带超时的 fetch 请求
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs: number = this.timeout
  ): Promise<Response> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      return response
    } finally {
      clearTimeout(timeout)
    }
  }

  async generateImage(options: GenerateImageOptions): Promise<string[]> {
    const { prompt, size = '1024x1792', count = 1, style = 'cinematic' } = options

    // 百炼图像生成 - 异步任务模式
    // 解析尺寸
    const sizeMap: Record<string, string> = {
      '1024x1792': '720*1280',
      '1792x1024': '1280*720',
      '1024x1024': '1024*1024',
      '512x896': '512*896',
      '896x512': '896*512',
    }

    // 提交异步任务
    const response = await this.fetchWithTimeout(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable',
        },
        body: JSON.stringify({
          model: 'wanx2.1-t2i-plus',
          input: {
            prompt,
          },
          parameters: {
            size: sizeMap[size] || '720*1280',
            n: count,
            style,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`百炼图像生成失败: ${errorData.message || response.statusText}`)
    }

    const taskData = await response.json()
    const taskId = taskData.output.task_id

    // 轮询任务状态
    const maxWaitTime = 120000 // 最多等待2分钟
    const pollInterval = 3000 // 每3秒查询一次
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      const taskResponse = await this.fetchWithTimeout(
        `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      )

      if (!taskResponse.ok) {
        throw new Error('查询图像任务失败')
      }

      const taskResult = await taskResponse.json()
      const status = taskResult.output.task_status

      if (status === 'SUCCEEDED') {
        return taskResult.output.results.map((r: any) => r.url)
      } else if (status === 'FAILED') {
        throw new Error(`图像生成失败: ${taskResult.output.message || '未知错误'}`)
      }

      // 继续等待
      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }

    throw new Error('图像生成超时')
  }

  async generateVideo(options: GenerateVideoOptions): Promise<string> {
    const { prompt, imageUrl, duration = 5, aspectRatio = '9:16' } = options
    
    // 百炼视频生成 - wan2.6-i2v
    if (!imageUrl) {
      throw new Error('百炼视频生成需要提供图片URL')
    }
    
    // 解析尺寸
    const sizeMap = {
      '16:9': '1280*720',
      '9:16': '720*1280',
      '1:1': '1024*1024',
    }
    
    // 提交异步任务
    const response = await this.fetchWithTimeout(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable',
        },
        body: JSON.stringify({
          model: 'wan2.6-i2v',
          input: {
            img_url: imageUrl, // 注意：必须是 img_url 不是 image_url
            prompt,
          },
          parameters: {
            size: sizeMap[aspectRatio] || '720*1280',
            duration,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`百炼视频生成失败: ${errorData.message || response.statusText}`)
    }

    const taskData = await response.json()
    const taskId = taskData.output.task_id
    
    // 轮询任务状态
    const maxWaitTime = 120000 // 最多等待2分钟
    const pollInterval = 3000 // 每3秒查询一次
    const startTime = Date.now()
    
    while (Date.now() - startTime < maxWaitTime) {
      const taskResponse = await this.fetchWithTimeout(
        `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      )
      
      if (!taskResponse.ok) {
        throw new Error('查询视频任务失败')
      }
      
      const taskResult = await taskResponse.json()
      const status = taskResult.output.task_status
      
      if (status === 'SUCCEEDED') {
        return taskResult.output.video_url
      } else if (status === 'FAILED') {
        throw new Error(`视频生成失败: ${taskResult.output.message || '未知错误'}`)
      }
      
      // 继续等待
      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }
    
    throw new Error('视频生成超时')
  }

  async generateAudio(options: GenerateAudioOptions): Promise<string> {
    const { text, voiceId = 'longxiaochun', speed = 1.0, emotion, emotionStrength } = options

    const response = await fetch(`${this.config.baseUrl || PROVIDER_CONFIGS.bailian.baseUrl}/audio/speech`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'cosyvoice-v1',
        input: text,
        voice: voiceId,
        speed,
      }),
    })

    if (!response.ok) {
      throw new Error(`百炼语音生成失败: ${response.statusText}`)
    }

    // TODO: 生产环境应上传到OSS并返回URL，避免内存问题
    // 当前返回base64仅适用于开发环境和小文件
    const buffer = await response.arrayBuffer()
    
    // 限制音频大小（10MB）
    const MAX_AUDIO_SIZE = 10 * 1024 * 1024
    if (buffer.byteLength > MAX_AUDIO_SIZE) {
      throw new Error('音频文件过大，请使用更短的文本或联系管理员配置OSS存储')
    }
    
    return `data:audio/mp3;base64,${Buffer.from(buffer).toString('base64')}`
  }

  async segmentScript(options: SegmentScriptOptions): Promise<ClipData[]> {
    const { script, model = 'glm-5' } = options

    const systemPrompt = `你是一个专业的影视分镜师。请将以下剧本内容分割为多个独立的分镜片段。

每个分镜片段应包含：
1. 场景信息：地点、时间、氛围
2. 角色信息：出场角色列表
3. 视觉指导：镜头类型、镜头运动
4. 剧本内容：该片段的原始剧本文本

请以JSON格式输出。`

    const response = await fetch(`${this.config.baseUrl || PROVIDER_CONFIGS.bailian.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: script },
        ],
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      throw new Error(`百炼文本生成失败: ${response.statusText}`)
    }

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)
    return result.clips || []
  }
}

// ========================================
// 火山方舟服务实现
// ========================================

export class VolcengineService extends AiService {
  private endpointId?: string

  constructor(config: AiConfig & { endpointId?: string }) {
    super(config)
    this.endpointId = config.endpointId
  }

  async generateImage(options: GenerateImageOptions): Promise<string[]> {
    const { prompt, size = '1024x1792', count = 1, style = 'realistic' } = options

    // 解析尺寸
    const [width, height] = size.split('x').map(Number)

    const response = await fetch(`${this.config.baseUrl || PROVIDER_CONFIGS.volcengine.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'seedream-3.0',
        prompt,
        size: { width, height },
        n: count,
        style,
      }),
    })

    if (!response.ok) {
      throw new Error(`火山方舟图像生成失败: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data.map((item: any) => item.url)
  }

  async generateVideo(options: GenerateVideoOptions): Promise<string> {
    const { prompt, imageUrl, duration = 5, aspectRatio = '9:16', quality = 'standard' } = options

    const requestBody: any = {
      model: this.config.model || 'seedance-1.0-pro',
      prompt,
      duration,
      aspect_ratio: aspectRatio,
      quality,
    }

    // 图生视频
    if (imageUrl) {
      requestBody.image_url = imageUrl
    }

    const response = await fetch(`${this.config.baseUrl || PROVIDER_CONFIGS.volcengine.baseUrl}/videos/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`火山方舟视频生成失败: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data[0].url
  }

  async generateAudio(options: GenerateAudioOptions): Promise<string> {
    const { text, voiceId, speed = 1.0, emotion, emotionStrength } = options

    const response = await fetch(`${this.config.baseUrl || PROVIDER_CONFIGS.volcengine.baseUrl}/audio/speech`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'doubao-tts',
        input: text,
        voice: voiceId || 'zh_female_shuangkuaisisi_moon_bigtts',
        speed,
        emotion_type: emotion,
        emotion_intensity: emotionStrength,
      }),
    })

    if (!response.ok) {
      throw new Error(`火山方舟语音生成失败: ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()
    return `data:audio/mp3;base64,${Buffer.from(buffer).toString('base64')}`
  }

  async segmentScript(options: SegmentScriptOptions): Promise<ClipData[]> {
    const { script, model = 'doubao-pro-32k' } = options

    const systemPrompt = `你是一个专业的影视分镜师。请将以下剧本内容分割为多个独立的分镜片段，以JSON格式输出。`

    const response = await fetch(`${this.config.baseUrl || PROVIDER_CONFIGS.volcengine.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: script },
        ],
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      throw new Error(`火山方舟文本生成失败: ${response.statusText}`)
    }

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)
    return result.clips || []
  }
}

// ========================================
// 服务工厂
// ========================================

export function createAiService(config: AiConfig): AiService {
  switch (config.provider) {
    case 'bailian':
      return new BailianService(config)
    case 'volcengine':
      return new VolcengineService(config as any)
    default:
      throw new Error(`不支持的AI提供商: ${config.provider}`)
  }
}

// ========================================
// 默认服务实例（从环境变量读取配置）
// ========================================

let defaultService: AiService | null = null

export function getDefaultAiService(): AiService {
  if (!defaultService) {
    const provider = (process.env.AI_PROVIDER || 'bailian') as AiProvider
    const apiKey = process.env.BAILIAN_API_KEY || process.env.AI_API_KEY || ''

    if (!apiKey) {
      throw new Error('请配置 BAILIAN_API_KEY 环境变量')
    }

    defaultService = createAiService({
      provider,
      apiKey,
      baseUrl: process.env.BAILIAN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: process.env.BAILIAN_MODEL_TEXT || 'glm-5',
    })
  }

  return defaultService
}

export function setDefaultAiService(service: AiService) {
  defaultService = service
}
