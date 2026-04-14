import { useState } from 'react'
import { Card, Button, Space, Empty } from 'antd'
import { PictureOutlined, VideoCameraOutlined, ReloadOutlined } from '@ant-design/icons'
import PanelCard from './PanelCard'
import { api } from '../api'

interface Panel {
  id: string
  panelNumber: number
  description: string
  imagePrompt?: string
  imageUrl?: string
  imageStatus?: string
  videoUrl?: string
  videoStatus?: string
}

interface StoryboardEditorProps {
  panels: Panel[]
  onRefresh?: () => void
}

export default function StoryboardEditor({ panels, onRefresh }: StoryboardEditorProps) {
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set())
  const [videoGeneratingIds, setVideoGeneratingIds] = useState<Set<string>>(new Set())

  // 生成单个图像
  const handleGenerateImage = async (panelId: string) => {
    setGeneratingIds(prev => new Set(prev).add(panelId))
    
    try {
      await api.post(`/panels/${panelId}/generate-image`, {})
      onRefresh?.()
    } catch (error) {
      console.error('图像生成失败:', error)
    } finally {
      setGeneratingIds(prev => {
        const next = new Set(prev)
        next.delete(panelId)
        return next
      })
    }
  }

  // 生成单个视频
  const handleGenerateVideo = async (panelId: string) => {
    setVideoGeneratingIds(prev => new Set(prev).add(panelId))
    
    try {
      await api.post(`/panels/${panelId}/generate-video`, {})
      onRefresh?.()
    } catch (error) {
      console.error('视频生成失败:', error)
    } finally {
      setVideoGeneratingIds(prev => {
        const next = new Set(prev)
        next.delete(panelId)
        return next
      })
    }
  }

  // 批量生成所有图像
  const handleGenerateAllImages = async () => {
    const pendingPanels = panels.filter(p => !p.imageUrl && p.imageStatus !== 'completed')
    
    for (const panel of pendingPanels) {
      await handleGenerateImage(panel.id)
      // 避免并发限制
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  // 批量生成所有视频
  const handleGenerateAllVideos = async () => {
    const readyPanels = panels.filter(p => p.imageUrl && !p.videoUrl && p.videoStatus !== 'completed')
    
    for (const panel of readyPanels) {
      await handleGenerateVideo(panel.id)
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }

  const pendingImageCount = panels.filter(p => !p.imageUrl).length
  const pendingVideoCount = panels.filter(p => p.imageUrl && !p.videoUrl).length

  if (panels.length === 0) {
    return (
      <Empty 
        description="还没有分镜，请先生成剧本" 
        style={{ padding: 60 }}
      />
    )
  }

  return (
    <div>
      {/* 工具栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <span>{panels.length} 个镜头</span>
          
          {pendingImageCount > 0 && (
            <Button 
              type="primary"
              icon={<PictureOutlined />}
              onClick={handleGenerateAllImages}
            >
              批量生成图像 ({pendingImageCount})
            </Button>
          )}
          
          {pendingVideoCount > 0 && (
            <Button 
              icon={<VideoCameraOutlined />}
              onClick={handleGenerateAllVideos}
            >
              批量生成视频 ({pendingVideoCount})
            </Button>
          )}
          
          <Button 
            icon={<ReloadOutlined />}
            onClick={onRefresh}
          >
            刷新
          </Button>
        </Space>
      </Card>

      {/* 面板网格 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16
      }}>
        {panels.map(panel => (
          <PanelCard
            key={panel.id}
            panel={panel}
            onGenerateImage={() => handleGenerateImage(panel.id)}
            onGenerateVideo={() => handleGenerateVideo(panel.id)}
            generating={generatingIds.has(panel.id)}
            videoGenerating={videoGeneratingIds.has(panel.id)}
          />
        ))}
      </div>
    </div>
  )
}