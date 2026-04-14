'use client'

import React from 'react'
import { useEditorState } from '../hooks/useEditorState'
import { useEditorActions } from '../hooks/useEditorActions'
import { VideoEditorProject } from '../types/editor.types'
import { calculateTimelineDuration, framesToTime } from '../utils/time-utils'
import { RemotionPreview } from './Preview'
import { Timeline } from './Timeline'
import { TransitionPicker, TransitionType } from './TransitionPicker'

interface VideoEditorStageProps {
  projectId: string
  episodeId: string
  initialProject?: VideoEditorProject
  onBack?: () => void
}

/**
 * 视频编辑器主页面
 * 
 * 布局:
 * ┌──────────────────────────────────────────────────────────┐
 * │ Toolbar (返回 | 保存 | 导出)                              │
 * ├──────────────┬───────────────────────────────────────────┤
 * │  素材库       │       Preview (Video Player)              │
 * │              │                                           │
 * │              ├───────────────────────────────────────────┤
 * │              │       Properties Panel                    │
 * ├──────────────┴───────────────────────────────────────────┤
 * │                      Timeline                            │
 * └──────────────────────────────────────────────────────────┘
 */
export function VideoEditorStage({
  projectId,
  episodeId,
  initialProject,
  onBack
}: VideoEditorStageProps) {
  const {
    project,
    timelineState,
    isDirty,
    removeClip,
    updateClip,
    reorderClips,
    play,
    pause,
    seek,
    selectClip,
    setZoom,
    markSaved
  } = useEditorState({ episodeId, initialProject })

  const { saveProject, startRender } = useEditorActions({ projectId, episodeId })

  const totalDuration = calculateTimelineDuration(project.timeline)
  const totalTime = framesToTime(totalDuration, project.config.fps)
  const currentTime = framesToTime(timelineState.currentFrame, project.config.fps)

  const handleSave = async () => {
    try {
      await saveProject(project)
      markSaved()
      alert('保存成功')
    } catch (error) {
      console.error('Save failed:', error)
      alert('保存失败')
    }
  }

  const handleExport = async () => {
    try {
      await startRender(project.id)
      alert('已开始导出')
    } catch (error) {
      console.error('Export failed:', error)
      alert('导出失败')
    }
  }

  const selectedClip = project.timeline.find(c => c.id === timelineState.selectedClipId)

  return (
    <div className="video-editor-stage" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--glass-bg-canvas, #0a0a0a)',
      color: 'var(--glass-text-primary, #fff)'
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderBottom: '1px solid var(--glass-stroke-base, #333)',
        background: 'var(--glass-bg-surface, #1e1e1e)'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            background: 'var(--glass-bg-surface-strong, #252525)',
            border: '1px solid var(--glass-stroke-base, #333)',
            borderRadius: '6px',
            color: 'var(--glass-text-primary, #fff)',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← 返回
        </button>

        <div style={{ flex: 1 }} />

        <span style={{ color: 'var(--glass-text-secondary, #999)', fontSize: '14px' }}>
          {currentTime} / {totalTime}
        </span>

        <button
          onClick={handleSave}
          style={{
            padding: '8px 16px',
            background: isDirty ? 'var(--glass-accent-from, #4F46E5)' : 'var(--glass-bg-surface-strong, #252525)',
            border: '1px solid var(--glass-stroke-base, #333)',
            borderRadius: '6px',
            color: isDirty ? 'white' : 'var(--glass-text-primary, #fff)',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {isDirty ? '保存*' : '已保存'}
        </button>

        <button
          onClick={handleExport}
          style={{
            padding: '8px 16px',
            background: 'var(--glass-tone-success-bg, #059669)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          导出视频
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Left Panel - Media Library */}
        <div style={{
          width: '200px',
          borderRight: '1px solid var(--glass-stroke-base, #333)',
          padding: '12px',
          background: 'var(--glass-bg-surface-strong, #252525)'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--glass-text-secondary, #999)' }}>
            素材库
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--glass-text-tertiary, #666)' }}>
            在此添加视频、音频和图片素材
          </p>
        </div>

        {/* Center - Preview + Properties */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Preview */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--glass-bg-muted, #2a2a2a)',
            padding: '20px'
          }}>
            <RemotionPreview
              project={project}
              currentFrame={timelineState.currentFrame}
              playing={timelineState.playing}
              onFrameChange={seek}
              onPlayingChange={(playing) => playing ? play() : pause()}
            />
          </div>

          {/* Playback Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '12px',
            background: 'var(--glass-bg-surface-strong, #252525)',
            borderTop: '1px solid var(--glass-stroke-base, #333)'
          }}>
            <button
              onClick={() => seek(0)}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--glass-text-secondary, #999)',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ⏮
            </button>
            <button
              onClick={() => timelineState.playing ? pause() : play()}
              style={{
                background: 'var(--glass-accent-from, #4F46E5)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                fontSize: '18px'
              }}
            >
              {timelineState.playing ? '⏸' : '▶'}
            </button>
            <button
              onClick={() => seek(totalDuration)}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--glass-text-secondary, #999)',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ⏭
            </button>
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div style={{
          width: '280px',
          borderLeft: '1px solid var(--glass-stroke-base, #333)',
          padding: '12px',
          background: 'var(--glass-bg-surface-strong, #252525)',
          overflowY: 'auto'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--glass-text-secondary, #999)' }}>
            属性面板
          </h3>
          {selectedClip ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 基础信息 */}
              <div style={{ fontSize: '12px' }}>
                <p style={{ margin: '0 0 8px 0' }}>
                  <span style={{ color: 'var(--glass-text-secondary, #999)' }}>片段：</span> 
                  {selectedClip.metadata?.description || `片段 ${project.timeline.findIndex(c => c.id === selectedClip.id) + 1}`}
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  <span style={{ color: 'var(--glass-text-secondary, #999)' }}>时长：</span> 
                  {framesToTime(selectedClip.durationInFrames, project.config.fps)}
                </p>
              </div>

              {/* 转场设置 */}
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--glass-text-secondary, #999)' }}>
                  转场效果
                </h4>
                <TransitionPicker
                  value={(selectedClip.transition?.type as TransitionType) || 'none'}
                  duration={selectedClip.transition?.durationInFrames || 15}
                  onChange={(type, duration) => {
                    updateClip(selectedClip.id, {
                      transition: type === 'none' ? undefined : { type, durationInFrames: duration }
                    })
                  }}
                />
              </div>

              {/* 删除按钮 */}
              <button
                onClick={() => {
                  if (confirm('确定删除此片段吗？')) {
                    removeClip(selectedClip.id)
                    selectClip(null)
                  }
                }}
                style={{
                  padding: '8px 12px',
                  background: 'var(--glass-tone-danger-bg, #DC2626)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                  marginTop: '8px'
                }}
              >
                删除片段
              </button>
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--glass-text-tertiary, #666)' }}>
              选择一个片段以编辑其属性
            </p>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div style={{
        height: '220px',
        borderTop: '1px solid var(--glass-stroke-base, #333)'
      }}>
        <Timeline
          clips={project.timeline}
          timelineState={timelineState}
          config={project.config}
          onReorder={reorderClips}
          onSelectClip={selectClip}
          onZoomChange={setZoom}
          onSeek={seek}
        />
      </div>
    </div>
  )
}

export default VideoEditorStage
