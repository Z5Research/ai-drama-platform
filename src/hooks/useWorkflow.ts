/**
 * 工作流状态机 Hooks
 * 管理5阶段工作流状态转换
 */

import { useState, useCallback, useMemo } from 'react'

// 工作流阶段定义
export type WorkflowStage = 
  | 'script'       // 剧本阶段
  | 'characters'   // 角色阶段
  | 'storyboard'   // 分镜阶段
  | 'production'   // 制作阶段
  | 'publish'      // 发布阶段

export interface WorkflowStageConfig {
  id: WorkflowStage
  label: string
  description: string
  icon: string
  requiredStatus: string // 进入该阶段需要的上一阶段状态
}

// 阶段配置
export const WORKFLOW_STAGES: WorkflowStageConfig[] = [
  {
    id: 'script',
    label: '剧本创作',
    description: '编写和导入剧本内容',
    icon: '📝',
    requiredStatus: '',
  },
  {
    id: 'characters',
    label: '角色设定',
    description: '定义角色形象和性格',
    icon: '👥',
    requiredStatus: 'script_done',
  },
  {
    id: 'storyboard',
    label: '分镜设计',
    description: '划分分镜和视觉设计',
    icon: '🎬',
    requiredStatus: 'characters_done',
  },
  {
    id: 'production',
    label: '内容制作',
    description: '生成图片和视频',
    icon: '🎥',
    requiredStatus: 'storyboard_done',
  },
  {
    id: 'publish',
    label: '发布导出',
    description: '导出和发布成品',
    icon: '🚀',
    requiredStatus: 'production_done',
  },
]

// 阶段状态映射
export const STAGE_STATUS_MAP: Record<WorkflowStage, string> = {
  script: 'script_done',
  characters: 'characters_done',
  storyboard: 'storyboard_done',
  production: 'production_done',
  publish: 'published',
}

// 工作流状态机 Hook
export function useWorkflowStateMachine(
  currentStage: WorkflowStage,
  episodeStatus: string,
  onStageChange?: (stage: WorkflowStage) => void
) {
  // 计算当前阶段索引
  const currentIndex = useMemo(
    () => WORKFLOW_STAGES.findIndex(s => s.id === currentStage),
    [currentStage]
  )

  // 计算可访问的阶段
  const accessibleStages = useMemo(() => {
    const stages: WorkflowStage[] = ['script'] // 剧本阶段始终可访问
    
    // 根据剧集状态判断可访问阶段
    if (episodeStatus === 'script_done' || episodeStatus === 'characters_done' || 
        episodeStatus === 'storyboard_done' || episodeStatus === 'production_done' || 
        episodeStatus === 'published') {
      stages.push('characters')
    }
    
    if (episodeStatus === 'characters_done' || episodeStatus === 'storyboard_done' || 
        episodeStatus === 'production_done' || episodeStatus === 'published') {
      stages.push('storyboard')
    }
    
    if (episodeStatus === 'storyboard_done' || episodeStatus === 'production_done' || 
        episodeStatus === 'published') {
      stages.push('production')
    }
    
    if (episodeStatus === 'production_done' || episodeStatus === 'published') {
      stages.push('publish')
    }
    
    return stages
  }, [episodeStatus])

  // 检查阶段是否可访问
  const canAccessStage = useCallback(
    (stage: WorkflowStage) => accessibleStages.includes(stage),
    [accessibleStages]
  )

  // 检查阶段是否已完成
  const isStageCompleted = useCallback(
    (stage: WorkflowStage) => {
      const stageIndex = WORKFLOW_STAGES.findIndex(s => s.id === stage)
      const stageStatus = WORKFLOW_STAGES[stageIndex + 1]?.requiredStatus
      return stageStatus ? episodeStatus === stageStatus || 
             accessibleStages.includes(WORKFLOW_STAGES[stageIndex + 1]?.id) : false
    },
    [episodeStatus, accessibleStages]
  )

  // 切换阶段
  const goToStage = useCallback(
    (stage: WorkflowStage) => {
      if (canAccessStage(stage)) {
        onStageChange?.(stage)
        return true
      }
      return false
    },
    [canAccessStage, onStageChange]
  )

  // 下一个阶段
  const nextStage = useCallback(() => {
    if (currentIndex < WORKFLOW_STAGES.length - 1) {
      const next = WORKFLOW_STAGES[currentIndex + 1]
      return goToStage(next.id)
    }
    return false
  }, [currentIndex, goToStage])

  // 上一个阶段
  const prevStage = useCallback(() => {
    if (currentIndex > 0) {
      const prev = WORKFLOW_STAGES[currentIndex - 1]
      return goToStage(prev.id)
    }
    return false
  }, [currentIndex, goToStage])

  return {
    currentStage,
    currentIndex,
    stages: WORKFLOW_STAGES,
    accessibleStages,
    canAccessStage,
    isStageCompleted,
    goToStage,
    nextStage,
    prevStage,
  }
}

// 工作流进度 Hook
export function useWorkflowProgress(
  currentStage: WorkflowStage,
  episodeStatus: string
) {
  const progress = useMemo(() => {
    const stageIndex = WORKFLOW_STAGES.findIndex(s => s.id === currentStage)
    const totalStages = WORKFLOW_STAGES.length
    
    // 计算进度百分比
    let completedStages = 0
    const statusOrder = [
      'draft', 'script_done', 'characters_done', 
      'storyboard_done', 'production_done', 'published'
    ]
    const statusIndex = statusOrder.indexOf(episodeStatus)
    completedStages = Math.max(0, statusIndex - 1)
    
    return {
      currentStage,
      stageIndex,
      totalStages,
      completedStages,
      percentage: Math.round((completedStages / (totalStages - 1)) * 100),
      isComplete: episodeStatus === 'published',
    }
  }, [currentStage, episodeStatus])

  return progress
}