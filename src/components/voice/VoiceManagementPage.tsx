'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, Video, Settings, Volume2 } from 'lucide-react'
import { VoiceLineEditor } from './VoiceLineEditor'
import { LipSyncManager } from './LipSyncManager'

interface VoiceManagementPageProps {
  episodeId: string
  projectId: string
}

export function VoiceManagementPage({ episodeId, projectId }: VoiceManagementPageProps) {
  const [activeTab, setActiveTab] = useState('voice-lines')

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">配音与口型同步</h2>
          <p className="text-muted-foreground">
            管理台词、配音和口型同步
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            <Volume2 className="w-3 h-3 mr-1" />
            配音管理
          </Badge>
          <Badge variant="outline">
            <Video className="w-3 h-3 mr-1" />
            口型同步
          </Badge>
        </div>
      </div>

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="voice-lines" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            台词管理
          </TabsTrigger>
          <TabsTrigger value="lip-sync" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            口型同步
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            音色设置
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voice-lines" className="mt-6">
          <VoiceLineEditor episodeId={episodeId} projectId={projectId} />
        </TabsContent>

        <TabsContent value="lip-sync" className="mt-6">
          <LipSyncManager episodeId={episodeId} projectId={projectId} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>全局音色设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 默认配音模型 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">默认配音模型</label>
                <select className="w-full p-2 border rounded">
                  <option value="volc-tts">火山引擎 TTS</option>
                  <option value="ali-tts">阿里云 TTS</option>
                  <option value="azure-tts">Azure TTS</option>
                </select>
              </div>

              {/* 默认口型同步模型 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">默认口型同步模型</label>
                <select className="w-full p-2 border rounded">
                  <option value="fal-kling">FAL Kling</option>
                  <option value="heygen">HeyGen</option>
                  <option value="d-id">D-ID</option>
                </select>
              </div>

              {/* 音色库 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">音色库管理</label>
                <div className="grid grid-cols-3 gap-4">
                  {/* 这里可以展示可用的音色 */}
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-4xl mb-2">🎙️</div>
                    <div className="font-medium">温暖男声</div>
                    <div className="text-sm text-muted-foreground">标准音色</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-4xl mb-2">🎙️</div>
                    <div className="font-medium">活力女声</div>
                    <div className="text-sm text-muted-foreground">标准音色</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center border-dashed cursor-pointer hover:bg-gray-50">
                    <div className="text-4xl mb-2">➕</div>
                    <div className="font-medium">添加自定义音色</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}