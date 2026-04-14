import { VideoEditorProject } from '../types/editor.types'

/**
 * 数据迁移工具
 * 确保旧版本数据能正确加载
 */
export function migrateProjectData(data: any): VideoEditorProject {
  const currentVersion = '1.0'
  
  // 如果已经是最新版本，直接返回
  if (data.schemaVersion === currentVersion) {
    return data
  }
  
  // 迁移到 1.0
  if (!data.schemaVersion) {
    return migrateToV1(data)
  }
  
  return data
}

/**
 * 迁移到 1.0 版本
 */
function migrateToV1(data: any): VideoEditorProject {
  return {
    ...data,
    schemaVersion: '1.0',
    // 确保必要字段存在
    config: data.config || {
      fps: 30,
      width: 1920,
      height: 1080
    },
    timeline: data.timeline || [],
    bgmTrack: data.bgmTrack || []
  }
}

/**
 * 验证项目数据
 */
export function validateProjectData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data.id) errors.push('Missing project id')
  if (!data.episodeId) errors.push('Missing episodeId')
  if (!data.config) errors.push('Missing config')
  if (!Array.isArray(data.timeline)) errors.push('Timeline must be an array')
  
  // 验证 config
  if (data.config) {
    if (typeof data.config.fps !== 'number') errors.push('Config.fps must be a number')
    if (typeof data.config.width !== 'number') errors.push('Config.width must be a number')
    if (typeof data.config.height !== 'number') errors.push('Config.height must be a number')
  }
  
  // 验证 timeline
  if (Array.isArray(data.timeline)) {
    data.timeline.forEach((clip: any, index: number) => {
      if (!clip.id) errors.push(`Clip ${index}: missing id`)
      if (!clip.src) errors.push(`Clip ${index}: missing src`)
      if (typeof clip.durationInFrames !== 'number') errors.push(`Clip ${index}: missing durationInFrames`)
    })
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
