'use client'

import React from 'react'
import { VideoEditorProject } from '../../types/editor.types'
import { computeClipPositions } from '../../utils/time-utils'

interface RemotionPreviewProps {
  project: VideoEditorProject
  currentFrame: number
  playing: boolean
  onFrameChange: (frame: number) => void
  onPlayingChange: (playing: boolean) => void
}

/**
 * 视频预览组件
 * 使用原生 video 元素进行视频播放
 * 支持多片段时间线预览
 */
export const RemotionPreview: React.FC<RemotionPreviewProps> = ({
  project,
  currentFrame,
  playing,
  onFrameChange,
  onPlayingChange
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const computedClips = computeClipPositions(project.timeline)
  
  // 找到当前帧对应的片段
  const currentClip = computedClips.find(
    clip => currentFrame >= clip.startFrame && currentFrame < clip.endFrame
  )

  // 计算当前片段内的相对时间
  const getCurrentClipTime = () => {
    if (!currentClip) return 0
    const frameOffset = currentFrame - currentClip.startFrame
    return frameOffset / project.config.fps
  }

  // 同步播放状态
  React.useEffect(() => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
      }
    }
  }, [playing])

  // 同步时间
  React.useEffect(() => {
    if (videoRef.current && currentClip) {
      const targetTime = getCurrentClipTime()
      if (Math.abs(videoRef.current.currentTime - targetTime) > 0.1) {
        videoRef.current.currentTime = targetTime
      }
    }
  }, [currentFrame, currentClip])

  const handleTimeUpdate = () => {
    if (!currentClip || !videoRef.current) return
    
    // 将播放时间转换为帧数
    const frames = Math.round(videoRef.current.currentTime * project.config.fps)
    const absoluteFrame = currentClip.startFrame + frames
    onFrameChange(absoluteFrame)
  }

  if (!currentClip) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        borderRadius: '8px',
        color: '#666'
      }}>
        {project.timeline.length === 0 ? '暂无片段' : '正在加载...'}
      </div>
    )
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div style={{
        width: '100%',
        maxWidth: `${project.config.width}px`,
        aspectRatio: `${project.config.width} / ${project.config.height}`
      }}>
        <video
          ref={videoRef}
          src={currentClip.src}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => onPlayingChange(true)}
          onPause={() => onPlayingChange(false)}
          muted={false}
        />
      </div>
    </div>
  )
}

export default RemotionPreview
