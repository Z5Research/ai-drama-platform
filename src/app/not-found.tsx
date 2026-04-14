import Link from 'next/link'
import '@/styles/cinematic.css'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold text-amber mb-4">404</h1>
        <h2 className="font-display text-2xl font-semibold text-cream mb-4">
          页面未找到
        </h2>
        <p className="text-fog font-body mb-8">
          您访问的页面不存在或已被移除
        </p>
        <Link href="/" className="btn btn-primary">
          返回首页
        </Link>
      </div>
    </div>
  )
}
