import { VoiceManagementPage } from '@/components/voice'
import { notFound } from 'next/navigation'

interface EpisodeVoicePageProps {
  params: Promise<{
    projectId: string
    episodeId: string
  }>
}

export default async function EpisodeVoicePage({ params }: EpisodeVoicePageProps) {
  const { projectId, episodeId } = await params

  // 这里可以添加数据验证
  if (!projectId || !episodeId) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <VoiceManagementPage 
        episodeId={episodeId}
        projectId={projectId}
      />
    </div>
  )
}
