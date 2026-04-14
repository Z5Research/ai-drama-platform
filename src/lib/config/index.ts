// 环境变量配置验证
import { z } from 'zod'

const configSchema = z.object({
  // 数据库
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // JWT认证（生产环境必须）
  JWT_SECRET: z.string()
    .refine(
      (val) => process.env.NODE_ENV !== 'production' || val.length >= 32,
      'JWT_SECRET must be at least 32 characters in production'
    )
    .optional(),
  
  // AI服务配置
  AI_PROVIDER: z.enum(['bailian', 'volcengine', 'openai']).optional(),
  AI_API_KEY: z.string().optional(),
  AI_BASE_URL: z.string().url().optional(),
  AI_MODEL: z.string().optional(),
  
  // NextAuth配置
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // 应用配置
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).optional(),
})

// 验证并导出配置
function loadConfig() {
  try {
    return configSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ 环境变量配置错误:')
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
      })
      
      // 生产环境严格模式
      if (process.env.NODE_ENV === 'production') {
        process.exit(1)
      }
    }
    return process.env
  }
}

export const config = loadConfig()

// 类型导出
export type Config = z.infer<typeof configSchema>
