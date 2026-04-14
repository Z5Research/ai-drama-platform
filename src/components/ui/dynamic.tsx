// Dynamic import wrappers for code splitting
import dynamic from 'next/dynamic'
import { LoadingSpinner } from './loading'

// Heavy components loaded on demand
export const DynamicStoryboardEditor = dynamic(
  () => import('@/components/storyboard/StoryboardEditor'),
  {
    loading: () => (
      <div className="min-h-[600px] flex items-center justify-center bg-night">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4 text-amber" />
          <p className="text-mist font-body">加载编辑器...</p>
        </div>
      </div>
    ),
    ssr: false, // Client-only component
  }
)

export const DynamicVoiceLineEditor = dynamic(
  () => import('@/components/voice/VoiceLineEditor').then(mod => ({ default: mod.VoiceLineEditor })),
  {
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="md" className="text-amber" />
      </div>
    ),
    ssr: false,
  }
)

export const DynamicLipSyncManager = dynamic(
  () => import('@/components/voice/LipSyncManager').then(mod => ({ default: mod.LipSyncManager })),
  {
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="md" className="text-amber" />
      </div>
    ),
    ssr: false,
  }
)
