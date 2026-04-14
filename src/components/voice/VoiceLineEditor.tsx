'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Play, 
  Pause, 
  Trash2, 
  Plus,
  Mic,
  Volume2,
  RefreshCw
} from 'lucide-react'

interface VoiceLine {
  id: string
  lineIndex: number
  speaker: string
  content: string
  voiceId?: string
  voiceType?: string
  emotionPrompt?: string
  emotionStrength?: number
  audioUrl?: string
  audioDuration?: number
  matchedPanelId?: string
  matchedPanelIndex?: number
  srtStart?: number
  srtEnd?: number
}

interface SpeakerStat {
  speaker: string
  count: number
}

interface VoiceLineEditorProps {
  episodeId: string
  projectId: string
}

export function VoiceLineEditor({ episodeId, projectId }: VoiceLineEditorProps) {
  const [voiceLines, setVoiceLines] = useState<VoiceLine[]>([])
  const [speakerStats, setSpeakerStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string[]>([])
  const [playing, setPlaying] = useState<string | null>(null)
  const [editingLine, setEditingLine] = useState<VoiceLine | null>(null)
  
  // 新增台词表单
  const [newLine, setNewLine] = useState({
    speaker: '',
    content: ''
  })

  useEffect(() => {
    fetchVoiceLines()
  }, [episodeId])

  const fetchVoiceLines = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/voice-lines?episodeId=${episodeId}`)
      if (!response.ok) throw new Error('Failed to fetch voice lines')
      
      const data = await response.json()
      setVoiceLines(data.voiceLines)
      setSpeakerStats(data.speakerStats)
    } catch (error) {
      console.error('Error fetching voice lines:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLine = async () => {
    if (!newLine.speaker.trim() || !newLine.content.trim()) return

    try {
      const response = await fetch('/api/voice-lines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeId,
          speaker: newLine.speaker,
          content: newLine.content
        })
      })

      if (!response.ok) throw new Error('Failed to add voice line')

      setNewLine({ speaker: '', content: '' })
      fetchVoiceLines()
    } catch (error) {
      console.error('Error adding voice line:', error)
    }
  }

  const handleUpdateLine = async (lineId: string, updates: Partial<VoiceLine>) => {
    try {
      const response = await fetch('/api/voice-lines', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineId, ...updates })
      })

      if (!response.ok) throw new Error('Failed to update voice line')

      fetchVoiceLines()
    } catch (error) {
      console.error('Error updating voice line:', error)
    }
  }

  const handleDeleteLine = async (lineId: string) => {
    try {
      const response = await fetch(`/api/voice-lines?lineId=${lineId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete voice line')

      fetchVoiceLines()
    } catch (error) {
      console.error('Error deleting voice line:', error)
    }
  }

  const handleGenerateVoice = async (lineId?: string) => {
    try {
      const targetLineIds = lineId ? [lineId] : voiceLines.filter(l => !l.audioUrl).map(l => l.id)
      setGenerating(targetLineIds)

      const response = await fetch('/api/voice-lines/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodeId,
          lineId: lineId || undefined,
          all: !lineId
        })
      })

      if (!response.ok) throw new Error('Failed to generate voice')

      fetchVoiceLines()
    } catch (error) {
      console.error('Error generating voice:', error)
    } finally {
      setGenerating([])
    }
  }

  const handlePlayAudio = (lineId: string, audioUrl: string) => {
    const audio = new Audio(audioUrl)
    if (playing === lineId) {
      audio.pause()
      setPlaying(null)
    } else {
      audio.play()
      setPlaying(lineId)
      audio.onended = () => setPlaying(null)
    }
  }

  const speakers = Object.keys(speakerStats)

  return (
    <div className="space-y-6">
      {/* 发言人统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            发言人统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {speakers.map(speaker => (
              <Badge key={speaker} variant="secondary">
                {speaker}: {speakerStats[speaker]} 条
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 添加新台词 */}
      <Card>
        <CardHeader>
          <CardTitle>添加台词</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="发言人"
              value={newLine.speaker}
              onChange={(e) => setNewLine({ ...newLine, speaker: e.target.value })}
              className="w-1/4"
            />
            <Input
              placeholder="台词内容"
              value={newLine.content}
              onChange={(e) => setNewLine({ ...newLine, content: e.target.value })}
              className="flex-1"
            />
            <Button onClick={handleAddLine}>
              <Plus className="w-4 h-4 mr-2" />
              添加
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 台词列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>台词列表 ({voiceLines.length} 条)</CardTitle>
            <Button 
              onClick={() => handleGenerateVoice()}
              disabled={generating.length > 0}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${generating.length > 0 ? 'animate-spin' : ''}`} />
              批量生成配音
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="w-1/4">发言人</TableHead>
                  <TableHead className="w-1/3">台词内容</TableHead>
                  <TableHead className="w-1/4">配音</TableHead>
                  <TableHead className="w-12">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voiceLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.lineIndex}</TableCell>
                    <TableCell>
                      {editingLine?.id === line.id ? (
                        <Input
                          value={editingLine.speaker}
                          onChange={(e) => setEditingLine({ ...editingLine, speaker: e.target.value })}
                          className="w-full"
                        />
                      ) : (
                        <Badge variant="outline">{line.speaker}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingLine?.id === line.id ? (
                        <Textarea
                          value={editingLine.content}
                          onChange={(e) => setEditingLine({ ...editingLine, content: e.target.value })}
                          className="w-full min-h-[60px]"
                        />
                      ) : (
                        <span className="text-sm">{line.content}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {line.audioUrl ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePlayAudio(line.id, line.audioUrl!)}
                          >
                            {playing === line.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          {line.audioDuration && (
                            <span className="text-xs text-muted-foreground">
                              {(line.audioDuration / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleGenerateVoice(line.id)}
                          disabled={generating.includes(line.id)}
                        >
                          {generating.includes(line.id) ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {editingLine?.id === line.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateLine(line.id, editingLine)}
                            >
                              保存
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingLine(null)}
                            >
                              取消
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingLine(line)}
                            >
                              编辑
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteLine(line.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 音色设置 */}
      <Card>
        <CardHeader>
          <CardTitle>发言人音色设置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {speakers.map(speaker => (
              <div key={speaker} className="flex items-center gap-4">
                <Badge>{speaker}</Badge>
                <Select defaultValue="default">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="选择音色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">默认音色</SelectItem>
                    <SelectItem value="warm">温暖</SelectItem>
                    <SelectItem value="energetic">活力</SelectItem>
                    <SelectItem value="calm">冷静</SelectItem>
                    <SelectItem value="custom">自定义音色</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="情绪提示词（可选）"
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}