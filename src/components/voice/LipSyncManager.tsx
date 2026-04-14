'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Video, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react'

interface Panel {
  id: string
  panelIndex: number
  description?: string
  imageUrl?: string
  videoUrl?: string
  lipSyncTaskId?: string
  lipSyncVideoUrl?: string
  lipSyncStatus?: string
}

interface VoiceLine {
  id: string
  lineIndex: number
  speaker: string
  content: string
  audioUrl?: string
  matchedPanelId?: string
}

interface LipSyncManagerProps {
  episodeId: string
  projectId: string
}

export function LipSyncManager({ episodeId, projectId }: LipSyncManagerProps) {
  const [panels, setPanels] = useState<Panel[]>([])
  const [voiceLines, setVoiceLines] = useState<VoiceLine[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string[]>([])
  const [selectedVoiceLines, setSelectedVoiceLines] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchData()
  }, [episodeId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 获取 Panels
      const panelsResponse = await fetch(`/api/panels?episodeId=${episodeId}`)
      if (panelsResponse.ok) {
        const panelsData = await panelsResponse.json()
        setPanels(panelsData.panels || [])
      }

      // 获取 VoiceLines
      const voiceLinesResponse = await fetch(`/api/voice-lines?episodeId=${episodeId}`)
      if (voiceLinesResponse.ok) {
        const voiceLinesData = await voiceLinesResponse.json()
        setVoiceLines(voiceLinesData.voiceLines || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLipSync = async (panelId: string, voiceLineId: string) => {
    if (!voiceLineId) return

    try {
      setProcessing([...processing, panelId])

      const response = await fetch(`/api/panels/${panelId}/lip-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceLineId })
      })

      if (!response.ok) throw new Error('Failed to create lip-sync task')

      fetchData()
    } catch (error) {
      console.error('Error creating lip-sync task:', error)
    } finally {
      setProcessing(processing.filter(id => id !== panelId))
    }
  }

  const handleBatchLipSync = async () => {
    // 批量处理所有有视频和配音的 Panels
    const readyPanels = panels.filter(p => 
      p.videoUrl && 
      !p.lipSyncVideoUrl
    )

    for (const panel of readyPanels) {
      const voiceLineId = selectedVoiceLines[panel.id] || 
        voiceLines.find(v => v.matchedPanelId === panel.id)?.id
      
      if (voiceLineId) {
        await handleLipSync(panel.id, voiceLineId)
      }
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">已完成</Badge>
      case 'failed':
        return <Badge variant="destructive">失败</Badge>
      case 'processing':
        return <Badge variant="default">处理中</Badge>
      default:
        return <Badge variant="secondary">待处理</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              口型同步管理
            </CardTitle>
            <Button
              onClick={handleBatchLipSync}
              disabled={processing.length > 0}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${processing.length > 0 ? 'animate-spin' : ''}`} />
              批量处理
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : (
            <div className="space-y-4">
              {panels.map((panel) => {
                const matchedVoiceLine = voiceLines.find(v => v.matchedPanelId === panel.id)
                const isProcessing = processing.includes(panel.id)

                return (
                  <div
                    key={panel.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    {/* 预览图 */}
                    <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden">
                      {panel.imageUrl && (
                        <img
                          src={panel.imageUrl}
                          alt={`Panel ${panel.panelIndex}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">分镜 {panel.panelIndex + 1}</span>
                        {getStatusIcon(panel.lipSyncStatus)}
                        {getStatusBadge(panel.lipSyncStatus)}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {panel.description || '无描述'}
                      </p>

                      {/* 配音选择 */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm">配音:</span>
                        <Select
                          value={selectedVoiceLines[panel.id] || matchedVoiceLine?.id || ''}
                          onValueChange={(value) => 
                            setSelectedVoiceLines({ 
                              ...selectedVoiceLines, 
                              [panel.id]: value 
                            })
                          }
                        >
                          <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="选择配音" />
                          </SelectTrigger>
                          <SelectContent>
                            {voiceLines.map((vl) => (
                              <SelectItem key={vl.id} value={vl.id}>
                                #{vl.lineIndex} {vl.speaker}: {vl.content.substring(0, 20)}...
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* 操作 */}
                    <div className="flex flex-col gap-2">
                      {panel.videoUrl && (
                        <>
                          {panel.lipSyncVideoUrl ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(panel.lipSyncVideoUrl, '_blank')}
                            >
                              查看结果
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => {
                                const voiceLineId = selectedVoiceLines[panel.id] || matchedVoiceLine?.id
                                if (voiceLineId) handleLipSync(panel.id, voiceLineId)
                              }}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  处理中
                                </>
                              ) : (
                                <>
                                  <Video className="w-4 h-4 mr-2" />
                                  生成口型
                                </>
                              )}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}

              {panels.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  暂无分镜数据
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{panels.length}</div>
            <p className="text-sm text-muted-foreground">总分镜数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {panels.filter(p => p.videoUrl).length}
            </div>
            <p className="text-sm text-muted-foreground">已生成视频</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {panels.filter(p => p.lipSyncStatus === 'completed').length}
            </div>
            <p className="text-sm text-muted-foreground">口型同步完成</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {panels.filter(p => p.videoUrl && !p.lipSyncVideoUrl).length}
            </div>
            <p className="text-sm text-muted-foreground">待处理</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}