'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-api'
import { PageLoading } from '@/components/ui/loading'
import { useRouter } from 'next/navigation'
import '@/styles/cinematic.css'

export default function ProjectsPage() {
  const router = useRouter()
  const { data: authData, isLoading: authLoading } = useAuth()
  
  const user = authData?.user
  const isLoggedIn = authData?.success && user

  // Redirect if not logged in
  if (!authLoading && !isLoggedIn) {
    router.push('/login')
    return null
  }

  if (authLoading) {
    return <PageLoading message="加载中..." />
  }

  // Mock projects for now
  const projects = [
    { id: '1', name: '示例项目 1', description: '分镜阶段', updatedAt: '2小时前' },
    { id: '2', name: '示例项目 2', description: '分镜阶段', updatedAt: '2小时前' },
    { id: '3', name: '示例项目 3', description: '分镜阶段', updatedAt: '2小时前' },
  ]

  return (
    <div className="min-h-screen bg-void">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-night border-r border-obsidian z-40">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber to-gold rounded-sm flex items-center justify-center">
              <span className="font-display text-lg font-bold text-void">智</span>
            </div>
            <span className="font-display text-lg font-semibold text-cream">工作台</span>
          </Link>
        </div>
        
        <nav className="px-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-mist hover:bg-shadow/50 hover:text-cream rounded-sm transition-colors">
            <span>📊</span>
            <span className="font-body text-sm">概览</span>
          </Link>
          <Link href="/projects" className="flex items-center gap-3 px-4 py-3 bg-shadow text-amber rounded-sm">
            <span>📁</span>
            <span className="font-body text-sm">项目管理</span>
          </Link>
          <Link href="/characters" className="flex items-center gap-3 px-4 py-3 text-mist hover:bg-shadow/50 hover:text-cream rounded-sm transition-colors">
            <span>👤</span>
            <span className="font-body text-sm">角色库</span>
          </Link>
          <Link href="/templates" className="flex items-center gap-3 px-4 py-3 text-mist hover:bg-shadow/50 hover:text-cream rounded-sm transition-colors">
            <span>📦</span>
            <span className="font-body text-sm">模板市场</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 bg-void/80 backdrop-blur-xl border-b border-obsidian z-30">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="font-display text-2xl font-semibold text-cream">项目管理</h1>
              <p className="text-sm text-fog font-body mt-1">管理你的所有漫剧项目</p>
            </div>
            <Link
              href="/projects/new"
              className="btn btn-primary px-6 py-2 text-sm font-medium"
            >
              新建项目
            </Link>
          </div>
        </header>

        <div className="p-8">
          {projects.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🎬</div>
              <h2 className="font-display text-xl font-semibold text-cream mb-3">还没有项目</h2>
              <p className="text-fog font-body mb-6">创建你的第一个漫剧项目，开始创作之旅</p>
              <Link href="/projects/new" className="btn btn-primary px-8 py-3">
                创建项目
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="card group cursor-pointer hover:border-amber/30 transition-all"
                >
                  <div className="aspect-video bg-shadow rounded-sm mb-4 flex items-center justify-center">
                    <div className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity">🎬</div>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-cream mb-2 group-hover:text-amber transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-fog font-body">
                    <span>{project.description}</span>
                    <span>•</span>
                    <span>{project.updatedAt}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
