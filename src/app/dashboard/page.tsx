// Optimized Dashboard Page with React Query
'use client'

import { useAuth } from '@/hooks/use-api'
import { useMounted } from '@/hooks/use-common'
import { PageLoading } from '@/components/ui/loading'
import { DashboardStatsSkeleton, ProjectCardSkeleton } from '@/components/ui/skeleton'
import { ErrorAlert } from '@/components/ui/error-boundary'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import '@/styles/cinematic.css'

export default function DashboardPage() {
  const router = useRouter()
  const mounted = useMounted()
  
  const { data: authData, isLoading: authLoading, error: authError, refetch } = useAuth()
  
  const user = authData?.user
  const isLoggedIn = authData?.success && user

  // Redirect if not logged in
  if (!authLoading && !isLoggedIn) {
    router.push('/login')
    return null
  }

  if (authLoading) {
    return <PageLoading message="加载用户信息..." />
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <ErrorAlert 
          message="加载用户信息失败，请重试" 
          onRetry={() => refetch()}
        />
      </div>
    )
  }

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
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-shadow text-amber rounded-sm">
            <span>📊</span>
            <span className="font-body text-sm">概览</span>
          </Link>
          <Link href="/projects" className="flex items-center gap-3 px-4 py-3 text-mist hover:bg-shadow/50 hover:text-cream rounded-sm transition-colors">
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
          <Link href="/export" className="flex items-center gap-3 px-4 py-3 text-mist hover:bg-shadow/50 hover:text-cream rounded-sm transition-colors">
            <span>📤</span>
            <span className="font-body text-sm">导出中心</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-obsidian">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 bg-gradient-to-br from-amber to-gold rounded-full flex items-center justify-center">
              <span className="font-display text-sm font-bold text-void">
                {user?.name?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-cream font-body truncate">{user?.name || user?.email}</div>
              <div className="text-xs text-fog font-body truncate">{user?.role || '用户'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 bg-void/80 backdrop-blur-xl border-b border-obsidian z-30">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="font-display text-2xl font-semibold text-cream">控制台</h1>
              <p className="text-sm text-fog font-body mt-1">欢迎回来，{user?.name || '创作者'}</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/projects/new')}
                className="btn btn-primary px-6 py-2 text-sm font-medium"
              >
                新建项目
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Quick Stats */}
          <div className={`grid grid-cols-4 gap-6 mb-8 ${mounted ? 'stagger animate-fade-in' : 'opacity-0'}`}>
            {[
              { label: '项目总数', value: '12', icon: '📁', trend: '+2' },
              { label: '生成图片', value: '847', icon: '🖼️', trend: '+126' },
              { label: '生成视频', value: '156', icon: '🎬', trend: '+38' },
              { label: '剩余积分', value: user?.credits?.toLocaleString() || '0', icon: '💎', trend: '' },
            ].map((stat, i) => (
              <div key={i} className="card">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  {stat.trend && (
                    <span className="text-xs text-success font-body bg-success/10 px-2 py-1 rounded">
                      {stat.trend}
                    </span>
                  )}
                </div>
                <div className="font-display text-3xl font-semibold text-cream mb-1">{stat.value}</div>
                <div className="text-sm text-fog font-body">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Projects */}
          <div className={`mb-8 ${mounted ? 'animate-fade-in-slow' : 'opacity-0'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold text-cream">最近项目</h2>
              <Link href="/projects" className="text-sm text-amber font-body hover:text-honey">
                查看全部 →
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="card group cursor-pointer hover:border-amber/30 transition-all">
                  <div className="aspect-video bg-shadow rounded-sm mb-4 flex items-center justify-center">
                    <div className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity">🎬</div>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-cream mb-2 group-hover:text-amber transition-colors">
                    示例项目 {i}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-fog font-body">
                    <span>分镜阶段</span>
                    <span>•</span>
                    <span>2小时前</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`grid md:grid-cols-3 gap-6 ${mounted ? 'animate-fade-in-slow' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
            <div className="card hover:border-amber/30 transition-all">
              <div className="flex items-start gap-4">
                <div className="text-3xl">📝</div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-cream mb-2">导入剧本</h3>
                  <p className="text-sm text-fog font-body mb-3">上传剧本文件，AI 自动分析并创建分镜</p>
                  <button className="text-sm text-amber font-body hover:text-honey">开始导入 →</button>
                </div>
              </div>
            </div>

            <div className="card hover:border-amber/30 transition-all">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🎨</div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-cream mb-2">创建角色</h3>
                  <p className="text-sm text-fog font-body mb-3">定义角色形象，确保全片一致性</p>
                  <Link href="/characters" className="text-sm text-amber font-body hover:text-honey">创建角色 →</Link>
                </div>
              </div>
            </div>

            <div className="card hover:border-amber/30 transition-all">
              <div className="flex items-start gap-4">
                <div className="text-3xl">📚</div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-cream mb-2">使用模板</h3>
                  <p className="text-sm text-fog font-body mb-3">从模板快速开始，节省创作时间</p>
                  <Link href="/templates" className="text-sm text-amber font-body hover:text-honey">浏览模板 →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
