// 全局布局
import type { Metadata } from 'next'
import { QueryProvider } from '@/lib/query-provider'
import { TopProgressBar } from '@/components/ui/progress-bar'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import '@/styles/cinematic.css'
import './globals.css'

export const metadata: Metadata = {
  title: '智午AI漫剧',
  description: '工业级全流程 AI 影视生产平台',
  keywords: ['AI', '剧本创作', '视频生成', '影视制作'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <QueryProvider>
          <TopProgressBar />
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </QueryProvider>
      </body>
    </html>
  )
}
