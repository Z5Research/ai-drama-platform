import Queue from 'bull'
import IORedis from 'ioredis'

// Redis 连接配置
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null
}

// 创建 Redis 连接
const redis = new IORedis(redisConfig)

// 视频渲染队列
export const renderQueue = new Queue('video-render', {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 100, // 保留最近 100 个完成的任务
    removeOnFail: 200,     // 保留最近 200 个失败的任务
    attempts: 3,           // 重试 3 次
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
})

// 任务类型
export interface RenderJobData {
  editorProjectId: string
  episodeId: string
  format: 'mp4' | 'webm'
  quality: 'draft' | 'high' | '720p' | '1080p' | '4K'
  projectData: any
}

// 导出队列状态更新器
export async function updateRenderStatus(
  episodeId: string,
  status: 'pending' | 'rendering' | 'completed' | 'failed',
  outputUrl?: string
) {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()

  await prisma.videoEditorProject.update({
    where: { episodeId },
    data: {
      renderStatus: status,
      outputUrl,
      updatedAt: new Date()
    }
  })
}

// 队列事件处理
renderQueue.on('completed', (job) => {
  console.log(`Render job ${job.id} completed`)
})

renderQueue.on('failed', (job, err) => {
  console.error(`Render job ${job?.id} failed:`, err)
})

renderQueue.on('error', (error) => {
  console.error('Queue error:', error)
})

export default renderQueue
