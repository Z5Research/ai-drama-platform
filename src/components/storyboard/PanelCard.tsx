'use client'

import { useState } from 'react'
import { Panel } from '@/types'

interface PanelCardProps {
  panel: Panel
  videoRatio?: string
  onGenerateImage?: (panelId: string, count?: number) => void
  onGenerateVideo?: (panelId: string, mode?: 'normal' | 'firstlastframe') => void
  onUpdate?: (panelId: string, data: Partial<Panel>) => void
  onSelectImage?: (panelId: string, imageUrl: string) => void
  isGeneratingImage?: boolean
  isGeneratingVideo?: boolean
}

export default function PanelCard({
  panel,
  videoRatio = '9:16',
  onGenerateImage,
  onGenerateVideo,
  onUpdate,
  onSelectImage,
  isGeneratingImage = false,
  isGeneratingVideo = false,
}: PanelCardProps) {
  const [showCandidates, setShowCandidates] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({
    description: panel.description || '',
    imagePrompt: panel.imagePrompt || '',
    videoPrompt: panel.videoPrompt || '',
    notes: panel.notes || '',
  })

  // 计算卡片尺寸
  const aspectRatio = videoRatio === '9:16' ? 9 / 16 : videoRatio === '16:9' ? 16 / 9 : 1
  const cardWidth = '100%'
  const cardHeight = `calc(100% * ${1 / aspectRatio})`

  // 获取候选图片列表
  const candidateUrls = panel.candidateUrls ? JSON.parse(panel.candidateUrls) : []

  // 处理保存编辑
  const handleSaveEdit = () => {
    onUpdate?.(panel.id, editData)
    setEditMode(false)
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      style={{ aspectRatio: aspectRatio.toString() }}
    >
      {/* 顶部编号 */}
      <div className="bg-gray-100 px-3 py-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          #{panel.panelNumber || panel.panelIndex + 1}
        </span>
        <div className="flex items-center gap-2">
          {panel.shotType && (
            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded">
              {panel.shotType}
            </span>
          )}
          {panel.cameraMove && (
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">
              {panel.cameraMove}
            </span>
          )}
        </div>
      </div>

      {/* 图像区域 */}
      <div className="relative bg-gray-50" style={{ paddingTop: `${100 / aspectRatio}%` }}>
        {panel.imageUrl ? (
          <img
            src={panel.imageUrl}
            alt={`Panel ${panel.panelNumber}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {panel.imageStatus === 'processing' || isGeneratingImage ? (
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm text-gray-500">生成中...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-2">🖼️</div>
                <p className="text-sm text-gray-500">暂无图像</p>
              </div>
            )}
          </div>
        )}

        {/* 视频状态标识 */}
        {panel.videoUrl && (
          <div className="absolute top-2 right-2">
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              ▶ 视频
            </span>
          </div>
        )}

        {/* 图像状态标识 */}
        {panel.imageStatus === 'completed' && (
          <div className="absolute bottom-2 right-2">
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              ✓ 已生成
            </span>
          </div>
        )}
      </div>

      {/* 信息区域 */}
      <div className="p-3">
        {editMode ? (
          <div className="space-y-2">
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              placeholder="分镜描述"
              className="w-full text-sm border rounded p-2"
              rows={2}
            />
            <textarea
              value={editData.imagePrompt}
              onChange={(e) => setEditData({ ...editData, imagePrompt: e.target.value })}
              placeholder="图像提示词"
              className="w-full text-sm border rounded p-2"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-indigo-600 text-white text-sm py-1 rounded hover:bg-indigo-700"
              >
                保存
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="flex-1 border text-gray-600 text-sm py-1 rounded hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 描述 */}
            {panel.description && (
              <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                {panel.description}
              </p>
            )}

            {/* 字幕片段 */}
            {panel.srtSegment && (
              <p className="text-xs text-gray-500 italic mb-2 line-clamp-1">
                "{panel.srtSegment}"
              </p>
            )}

            {/* 角色和场景 */}
            <div className="flex flex-wrap gap-1 mb-2">
              {panel.location && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                  📍 {panel.location}
                </span>
              )}
              {panel.characters && (
                <span className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded">
                  👤 {panel.characters}
                </span>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <button
                onClick={() => onGenerateImage?.(panel.id, 4)}
                disabled={isGeneratingImage || panel.imageStatus === 'processing'}
                className="flex-1 text-xs bg-indigo-50 text-indigo-600 py-1.5 rounded hover:bg-indigo-100 disabled:opacity-50"
              >
                {isGeneratingImage || panel.imageStatus === 'processing' ? '生成中...' : '生成图像'}
              </button>
              {panel.imageUrl && (
                <button
                  onClick={() => onGenerateVideo?.(panel.id, 'normal')}
                  disabled={isGeneratingVideo || panel.videoStatus === 'processing'}
                  className="flex-1 text-xs bg-purple-50 text-purple-600 py-1.5 rounded hover:bg-purple-100 disabled:opacity-50"
                >
                  {isGeneratingVideo || panel.videoStatus === 'processing' ? '生成中...' : '生成视频'}
                </button>
              )}
            </div>

            {/* 候选图片 */}
            {candidateUrls.length > 1 && (
              <button
                onClick={() => setShowCandidates(!showCandidates)}
                className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700"
              >
                查看候选 ({candidateUrls.length})
              </button>
            )}
          </>
        )}
      </div>

      {/* 候选图片弹窗 */}
      {showCandidates && candidateUrls.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">选择图像</h3>
              <button
                onClick={() => setShowCandidates(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {candidateUrls.map((url: string, index: number) => (
                <div
                  key={index}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                    url === panel.imageUrl ? 'border-indigo-600' : 'border-transparent'
                  }`}
                  onClick={() => {
                    onSelectImage?.(panel.id, url)
                    setShowCandidates(false)
                  }}
                >
                  <img src={url} alt={`Candidate ${index + 1}`} className="w-full" />
                  {url === panel.imageUrl && (
                    <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                      <span className="bg-indigo-600 text-white px-2 py-1 rounded text-sm">
                        当前
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
