'use client'

import { useState, useEffect } from 'react'
import { StoryboardEditor } from '@/components/storyboard'
import { useParams } from 'next/navigation'
import { Storyboard, Panel } from '@/types'

export default function StoryboardPage() {
  const params = useParams()
  const clipId = params.clipId as string
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (clipId) {
      fetchStoryboard()
    }
  }, [clipId])

  const fetchStoryboard = async () => {
    try {
      setLoading(true)
      // 通过 clipId 获取 storyboard
      const res = await fetch(`/api/storyboards?clipId=${clipId}`)
      const data = await res.json()
      
      if (data.success && data.data) {
        setStoryboard(data.data)
      } else if (data.error) {
        setError(data.error)
      }
    } catch (err) {
      setError('加载分镜失败')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAllImages = async () => {
    if (!storyboard?.panels) return
    
    // 批量生成所有面板的图像
    for (const panel of storyboard.panels) {
      if (!panel.imageUrl) {
        try {
          await fetch(`/api/panels/${panel.id}/generate-image`, { method: 'POST' })
        } catch (err) {
          console.error(`Failed to generate image for panel ${panel.id}:`, err)
        }
      }
    }
  }

  const handleGenerateAllVideos = async () => {
    if (!storyboard?.panels) return
    
    // 批量生成所有面板的视频
    for (const panel of storyboard.panels) {
      if (panel.imageUrl && !panel.videoUrl) {
        try {
          await fetch(`/api/panels/${panel.id}/generate-video`, { method: 'POST' })
        } catch (err) {
          console.error(`Failed to generate video for panel ${panel.id}:`, err)
        }
      }
    }
  }

  const handleUpdatePanel = async (panelId: string, data: Partial<Panel>) => {
    try {
      await fetch(`/api/panels/${panelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      // 刷新数据
      fetchStoryboard()
    } catch (err) {
      console.error('Failed to update panel:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!storyboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">分镜不存在</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <StoryboardEditor
        storyboard={storyboard}
        onGenerateAllImages={handleGenerateAllImages}
        onGenerateAllVideos={handleGenerateAllVideos}
        onUpdatePanel={handleUpdatePanel}
      />
    </div>
  )
}

export const dynamic = 'force-dynamic'