'use client'

import { useState, useCallback } from 'react'
import { Panel, Storyboard } from '@/types'

interface UseBatchGenerationOptions {
  onPanelUpdate?: (panelId: string, data: Partial<Panel>) => void
  concurrency?: number
}

export function useBatchGeneration(options: UseBatchGenerationOptions = {}) {
  const { onPanelUpdate, concurrency = 3 } = options
  
  const [generatingPanelIds, setGeneratingPanelIds] = useState<Set<string>>(new Set())
  const [videoGeneratingPanelIds, setVideoGeneratingPanelIds] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  // 生成单个面板图像
  const generatePanelImage = useCallback(async (panelId: string, count = 4) => {
    try {
      setGeneratingPanelIds(prev => new Set(prev).add(panelId))
      
      const res = await fetch(`/api/panels/${panelId}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count })
      })
      
      const data = await res.json()
      
      if (data.panel) {
        onPanelUpdate?.(panelId, data.panel)
      }
      
      return data
    } catch (error) {
      console.error('生成图像失败:', error)
      throw error
    } finally {
      setGeneratingPanelIds(prev => {
        const next = new Set(prev)
        next.delete(panelId)
        return next
      })
    }
  }, [onPanelUpdate])

  // 生成单个面板视频
  const generatePanelVideo = useCallback(async (
    panelId: string, 
    mode: 'normal' | 'firstlastframe' = 'normal',
    duration = 4
  ) => {
    try {
      setVideoGeneratingPanelIds(prev => new Set(prev).add(panelId))
      
      const res = await fetch(`/api/panels/${panelId}/generate-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, duration })
      })
      
      const data = await res.json()
      
      if (data.panel) {
        onPanelUpdate?.(panelId, data.panel)
      }
      
      return data
    } catch (error) {
      console.error('生成视频失败:', error)
      throw error
    } finally {
      setVideoGeneratingPanelIds(prev => {
        const next = new Set(prev)
        next.delete(panelId)
        return next
      })
    }
  }, [onPanelUpdate])

  // 批量生成图像（带并发控制）
  const batchGenerateImages = useCallback(async (panels: Panel[]) => {
    const pendingPanels = panels.filter(p => !p.imageUrl && p.imageStatus !== 'processing')
    
    if (pendingPanels.length === 0) return
    
    setProgress({ current: 0, total: pendingPanels.length })
    
    // 分批处理
    for (let i = 0; i < pendingPanels.length; i += concurrency) {
      const batch = pendingPanels.slice(i, i + concurrency)
      
      await Promise.allSettled(
        batch.map(async (panel) => {
          try {
            await generatePanelImage(panel.id)
          } catch (error) {
            console.error(`Panel ${panel.id} 生成失败:`, error)
          } finally {
            setProgress(prev => ({ ...prev, current: prev.current + 1 }))
          }
        })
      )
    }
    
    setProgress({ current: 0, total: 0 })
  }, [concurrency, generatePanelImage])

  // 批量生成视频（带并发控制）
  const batchGenerateVideos = useCallback(async (panels: Panel[]) => {
    const pendingPanels = panels.filter(p => p.imageUrl && !p.videoUrl && p.videoStatus !== 'processing')
    
    if (pendingPanels.length === 0) return
    
    setProgress({ current: 0, total: pendingPanels.length })
    
    // 分批处理
    for (let i = 0; i < pendingPanels.length; i += concurrency) {
      const batch = pendingPanels.slice(i, i + concurrency)
      
      await Promise.allSettled(
        batch.map(async (panel) => {
          try {
            await generatePanelVideo(panel.id)
          } catch (error) {
            console.error(`Panel ${panel.id} 视频生成失败:`, error)
          } finally {
            setProgress(prev => ({ ...prev, current: prev.current + 1 }))
          }
        })
      )
    }
    
    setProgress({ current: 0, total: 0 })
  }, [concurrency, generatePanelVideo])

  return {
    generatingPanelIds,
    videoGeneratingPanelIds,
    progress,
    generatePanelImage,
    generatePanelVideo,
    batchGenerateImages,
    batchGenerateVideos,
  }
}
