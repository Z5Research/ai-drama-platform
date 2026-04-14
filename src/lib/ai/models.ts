// AI 模型路由与管理
import axios from 'axios'

// 模型配置
export const AI_MODELS = {
  // 百炼 (优先)
  'glm-5': {
    provider: 'bailian',
    type: 'text',
    inputPrice: 0.001,
    outputPrice: 0.001,
    maxTokens: 4096,
  },
  'glm-4': {
    provider: 'bailian',
    type: 'text',
    inputPrice: 0.1,
    outputPrice: 0.1,
    maxTokens: 128000,
  },
  'qwen-plus': {
    provider: 'bailian',
    type: 'text',
    inputPrice: 0.004,
    outputPrice: 0.012,
    maxTokens: 32000,
  },
  'qwen-max': {
    provider: 'bailian',
    type: 'text',
    inputPrice: 0.04,
    outputPrice: 0.12,
    maxTokens: 32000,
  },
  
  // OpenAI
  'gpt-4': {
    provider: 'openai',
    type: 'text',
    inputPrice: 0.03,  // per 1K tokens
    outputPrice: 0.06,
    maxTokens: 4096,
  },
  'gpt-4-turbo': {
    provider: 'openai',
    type: 'text',
    inputPrice: 0.01,
    outputPrice: 0.03,
    maxTokens: 128000,
  },
  'gpt-3.5-turbo': {
    provider: 'openai',
    type: 'text',
    inputPrice: 0.0005,
    outputPrice: 0.0015,
    maxTokens: 16385,
  },
  'dall-e-3': {
    provider: 'openai',
    type: 'image',
    price: 0.04, // per image
    sizes: ['1024x1024', '1792x1024', '1024x1792'],
  },
  
  // Anthropic
  'claude-3-5-sonnet-20241022': {
    provider: 'anthropic',
    type: 'text',
    inputPrice: 0.003,
    outputPrice: 0.015,
    maxTokens: 200000,
  },
  'claude-3-opus-20240229': {
    provider: 'anthropic',
    type: 'text',
    inputPrice: 0.015,
    outputPrice: 0.075,
    maxTokens: 200000,
  },
} as const

export type ModelId = keyof typeof AI_MODELS

// 模型降级链
const FALLBACK_CHAINS: Record<string, ModelId[]> = {
  'gpt-4': ['gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-5-sonnet-20241022'],
  'claude-3-opus-20240229': ['claude-3-5-sonnet-20241022', 'gpt-4-turbo'],
  'glm-4': ['qwen-max', 'gpt-3.5-turbo'],
}

// 获取降级模型
export function getFallbackModel(modelId: ModelId): ModelId | null {
  const chain = FALLBACK_CHAINS[modelId]
  if (!chain || chain.length === 0) return null
  return chain[0]
}

// 计算 token 成本（积分）
export function calculateCredits(
  modelId: ModelId,
  inputTokens: number,
  outputTokens: number
): number {
  const model = AI_MODELS[modelId]
  if (!model || model.type !== 'text') return 0
  
  // 1积分 = 0.01元
  const inputCost = (model.inputPrice * inputTokens) / 1000
  const outputCost = (model.outputPrice * outputTokens) / 1000
  const totalCost = inputCost + outputCost
  
  // 转换为积分，向上取整
  return Math.ceil(totalCost * 100)
}

// AI 客户端类
export class AIClient {
  private modelId: ModelId
  
  constructor(modelId: ModelId = 'gpt-4') {
    this.modelId = modelId
  }
  
  // 文本生成
  async generateText(prompt: string, options: {
    system?: string
    maxTokens?: number
    temperature?: number
  } = {}): Promise<{
    text: string
    inputTokens: number
    outputTokens: number
    credits: number
  }> {
    const model = AI_MODELS[this.modelId] as typeof AI_MODELS[ModelId]
    
    if (!model || model.type !== 'text') {
      throw new Error(`Invalid text model: ${this.modelId}`)
    }
    
    const provider = model.provider
    
    try {
      // 根据 provider 调用不同 API
      switch (provider) {
        case 'bailian':
          return await this.callBailian(prompt, options)
        case 'openai':
          return await this.callOpenAI(prompt, options)
        case 'anthropic':
          return await this.callAnthropic(prompt, options)
        default:
          throw new Error(`Unknown provider: ${provider}`)
      }
    } catch (error) {
      // 降级处理
      const fallback = getFallbackModel(this.modelId)
      if (fallback) {
        console.warn(`Model ${this.modelId} failed, falling back to ${fallback}`)
        const fallbackClient = new AIClient(fallback)
        return fallbackClient.generateText(prompt, options)
      }
      throw error
    }
  }
  
  // 百炼 API (优先)
  private async callBailian(prompt: string, options: any) {
    const response = await axios.post(
      (process.env.BAILIAN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1') + '/chat/completions',
      {
        model: this.modelId,
        messages: [
          ...(options.system ? [{ role: 'system', content: options.system }] : []),
          { role: 'user', content: prompt },
        ],
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.BAILIAN_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const inputTokens = response.data.usage?.prompt_tokens || 0
    const outputTokens = response.data.usage?.completion_tokens || 0
    const text = response.data.choices[0]?.message?.content || ''

    return {
      text,
      inputTokens,
      outputTokens,
      credits: calculateCredits(this.modelId, inputTokens, outputTokens),
    }
  }

  // OpenAI API
  private async callOpenAI(prompt: string, options: any) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: this.modelId,
        messages: [
          ...(options.system ? [{ role: 'system', content: options.system }] : []),
          { role: 'user', content: prompt },
        ],
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    const inputTokens = response.data.usage?.prompt_tokens || 0
    const outputTokens = response.data.usage?.completion_tokens || 0
    const text = response.data.choices[0]?.message?.content || ''
    
    return {
      text,
      inputTokens,
      outputTokens,
      credits: calculateCredits(this.modelId, inputTokens, outputTokens),
    }
  }
  
  // Anthropic API
  private async callAnthropic(prompt: string, options: any) {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: this.modelId,
        messages: [{ role: 'user', content: prompt }],
        system: options.system,
        max_tokens: options.maxTokens || 4096,
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    )
    
    const inputTokens = response.data.usage?.input_tokens || 0
    const outputTokens = response.data.usage?.output_tokens || 0
    const text = response.data.content[0]?.text || ''
    
    return {
      text,
      inputTokens,
      outputTokens,
      credits: calculateCredits(this.modelId, inputTokens, outputTokens),
    }
  }
  
  // 智谱 API
  private async callZhipu(prompt: string, options: any) {
    const response = await axios.post(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      {
        model: this.modelId,
        messages: [
          ...(options.system ? [{ role: 'system', content: options.system }] : []),
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.ZHIPU_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    const inputTokens = response.data.usage?.prompt_tokens || 0
    const outputTokens = response.data.usage?.completion_tokens || 0
    const text = response.data.choices[0]?.message?.content || ''
    
    return {
      text,
      inputTokens,
      outputTokens,
      credits: calculateCredits(this.modelId, inputTokens, outputTokens),
    }
  }
  
  // 通义 API
  private async callAlibaba(prompt: string, options: any) {
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: this.modelId,
        input: {
          messages: [
            ...(options.system ? [{ role: 'system', content: options.system }] : []),
            { role: 'user', content: prompt },
          ],
        },
        parameters: {
          max_tokens: options.maxTokens || 4096,
          temperature: options.temperature || 0.7,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.ALIBABA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    const usage = response.data.usage || {}
    const inputTokens = usage.input_tokens || 0
    const outputTokens = usage.output_tokens || 0
    const text = response.data.output?.text || ''
    
    return {
      text,
      inputTokens,
      outputTokens,
      credits: calculateCredits(this.modelId, inputTokens, outputTokens),
    }
  }
}

// 导出单例
export const aiClient = new AIClient()
