/**
 * 5阶段工作流导航组件
 */

'use client'

import React from 'react'
import { WorkflowStage, WORKFLOW_STAGES } from '@/hooks/useWorkflow'

interface StageNavigationProps {
  projectId: string
  currentStage: WorkflowStage
  episodeStatus: string
  accessibleStages: WorkflowStage[]
  onStageClick: (stage: WorkflowStage) => void
  className?: string
}

export function StageNavigation({
  projectId,
  currentStage,
  episodeStatus,
  accessibleStages,
  onStageClick,
  className = '',
}: StageNavigationProps) {
  return (
    <div className={`flex items-center justify-center space-x-3 text-sm ${className}`}>
      {WORKFLOW_STAGES.map((stage, index) => {
        const isEnabled = accessibleStages.includes(stage.id)
        const isCurrent = currentStage === stage.id
        const isCompleted = WORKFLOW_STAGES.findIndex(s => s.id === currentStage) > index

        const baseClasses = 'px-5 py-2.5 rounded-xl transition-all font-medium inline-block'
        
        let statusClasses = ''
        if (isCurrent) {
          statusClasses = 'bg-blue-500 text-white shadow-md'
        } else if (isCompleted) {
          statusClasses = 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
        } else if (isEnabled) {
          statusClasses = 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer'
        } else {
          statusClasses = 'bg-gray-50 text-gray-300 cursor-not-allowed pointer-events-none'
        }

        return (
          <div key={stage.id} className="flex items-center space-x-3">
            <button
              onClick={() => isEnabled && onStageClick(stage.id)}
              disabled={!isEnabled}
              className={`${baseClasses} ${statusClasses}`}
              title={stage.description}
            >
              <span className="flex items-center gap-2">
                <span>{stage.icon}</span>
                <span>{stage.label}</span>
                {isCompleted && <span className="text-xs">✓</span>}
              </span>
            </button>
            {index < WORKFLOW_STAGES.length - 1 && (
              <span className="text-gray-300">→</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// 简化版阶段指示器
export function StageIndicator({
  currentStage,
  episodeStatus,
}: {
  currentStage: WorkflowStage
  episodeStatus: string
}) {
  const currentIndex = WORKFLOW_STAGES.findIndex(s => s.id === currentStage)
  
  return (
    <div className="flex items-center gap-2">
      {WORKFLOW_STAGES.map((stage, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex
        
        return (
          <React.Fragment key={stage.id}>
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${isCompleted ? 'bg-green-500 text-white' : ''}
                ${isCurrent ? 'bg-blue-500 text-white ring-2 ring-blue-300' : ''}
                ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-500' : ''}
              `}
              title={stage.label}
            >
              {isCompleted ? '✓' : index + 1}
            </div>
            {index < WORKFLOW_STAGES.length - 1 && (
              <div className={`w-8 h-0.5 ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// 工作流进度条
export function WorkflowProgressBar({
  currentStage,
  episodeStatus,
}: {
  currentStage: WorkflowStage
  episodeStatus: string
}) {
  const currentIndex = WORKFLOW_STAGES.findIndex(s => s.id === currentStage)
  const progress = ((currentIndex + 1) / WORKFLOW_STAGES.length) * 100

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-600">
          {WORKFLOW_STAGES[currentIndex]?.label || '工作流'}
        </span>
        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default StageNavigation