'use client'

import { useState, useCallback } from 'react'
import { Storyboard, Panel } from '@/types'
import PanelCard from './PanelCard'

interface StoryboardEditorProps {
  storyboard: Storyboard
  videoRatio?: string
  onGenerateAllImages?: () => void
  onGenerateAllVideos?: () => void
  onUpdatePanel?: (panelId: string, data: Partial<Panel>) => void
  generatingPanelIds?: Set<string>
  videoGeneratingPanelIds?: Set<string>
}

export default function StoryboardEditor({
  storyboard,
  videoRatio = '9:16',
  onGenerateAllImages,
  onGenerateAllVideos,
  onUpdatePanel,
  generatingPanelIds = new Set(),
  videoGeneratingPanelIds = new Set(),
}: StoryboardEditorProps) {
  const [selectedPanels, setSelectedPanels] = useState<Set<string>>(new Set())

  // 获取面板列表
  const panels = storyboard.panels || []
  const pendingImageCount = panels.filter(p => !p.imageUrl && p.imageStatus !== 'processing').length
  const pendingVideoCount = panels.filter(p => p.imageUrl && !p.videoUrl && p.videoStatus !== 'processing').length

  // 切换面板选择
  const togglePanel = useCallback((panelId: string) => {
    setSelectedPanels(prev => {
      const next = new Set(prev)
      if (next.has(panelId)) {
        next.delete(panelId)
      } else {
        next.add(panelId)
      }
      return next
    })
  }, [])

  // 全选/取消全选
  const toggleSelectAll = useCallback(() => {
    if (selectedPanels.size === panels.length) {
      setSelectedPanels(new Set())
    } else {
      setSelectedPanels(new Set(panels.map(p => p.id)))
    }
  }, [panels, selectedPanels.size])

  // 批量生成图像
  const handleGenerateSelectedImages = useCallback(() => {
    // TODO: 批量生成选中面板的图像
    selectedPanels.forEach(panelId => {
      // 调用单个生成
    })
  }, [selectedPanels])

  // 动态网格列数（根据面板数量调整）
  const getGridCols = () => {
    const count = panels.length
    if (count <= 3) return 'grid-cols-1 md:grid-cols-3'
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3'
    if (count <= 9) return 'grid-cols-3'
    return 'grid-cols-3 md:grid-cols-4'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-lg">
            分镜 #{storyboard.clip?.clipNumber || '未命名'}
          </h3>
          <span className="text-sm text-gray-500">
            {panels.length} 个镜头
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 批量操作 */}
          {selectedPanels.size > 0 && (
            <span className="text-sm text-gray-500">
              已选择 {selectedPanels.size} 个
            </span>
          )}
          
          <button
            onClick={toggleSelectAll}
            className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded border"
          >
            {selectedPanels.size === panels.length ? '取消全选' : '全选'}
          </button>

          <button
            onClick={onGenerateAllImages}
            disabled={pendingImageCount === 0}
            className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded disabled:opacity-50 hover:bg-indigo-700"
          >
            生成全部图像 ({pendingImageCount})
          </button>

          <button
            onClick={onGenerateAllVideos}
            disabled={pendingVideoCount === 0}
            className="text-sm bg-purple-600 text-white px-4 py-1.5 rounded disabled:opacity-50 hover:bg-purple-700"
          >
            生成全部视频 ({pendingVideoCount})
          </button>
        </div>
      </div>

      {/* 分镜信息 */}
      {storyboard.photographyPlan && (
        <div className="bg-gray-50 p-4 border-b">
          <h4 className="font-medium text-gray-700 mb-2">摄影计划</h4>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {storyboard.photographyPlan}
          </p>
        </div>
      )}

      {/* 面板网格 */}
      <div className={`grid ${getGridCols()} gap-4 p-4`}>
        {panels.map((panel) => (
          <div
            key={panel.id}
            className={`relative ${selectedPanels.has(panel.id) ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
            onClick={(e) => {
              if (e.shiftKey) {
                togglePanel(panel.id)
              }
            }}
          >
            {/* 选择复选框 */}
            <div className="absolute top-2 left-2 z-10">
              <input
                type="checkbox"
                checked={selectedPanels.has(panel.id)}
                onChange={() => togglePanel(panel.id)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <PanelCard
              panel={panel}
              videoRatio={videoRatio}
              onUpdate={onUpdatePanel}
              isGeneratingImage={generatingPanelIds.has(panel.id)}
              isGeneratingVideo={videoGeneratingPanelIds.has(panel.id)}
            />
          </div>
        ))}

        {/* 空状态 */}
        {panels.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-4xl mb-4">🎬</div>
            <p className="text-gray-500">暂无分镜面板</p>
            <p className="text-sm text-gray-400 mt-1">
              请先生成剧本并解析分镜
            </p>
          </div>
        )}
      </div>

      {/* 底部统计 */}
      <div className="border-t px-4 py-3 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span>
            图像: {panels.filter(p => p.imageStatus === 'completed').length}/{panels.length} 完成
          </span>
          <span>
            视频: {panels.filter(p => p.videoStatus === 'completed').length}/{panels.filter(p => p.imageUrl).length} 完成
          </span>
        </div>
        <div>
          创建于 {new Date(storyboard.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}