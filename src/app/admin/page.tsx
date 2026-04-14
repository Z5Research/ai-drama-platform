// Admin Dashboard Page - 简化版
'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageLoading } from '@/components/ui/loading'
import '@/styles/cinematic.css'

interface Stats {
  users: { total: number; active: number; vip: number }
  projects: { total: number; active: number; published: number }
  credits: { totalUsed: number; totalPurchased: number }
  ai: { imagesGenerated: number; videosGenerated: number }
}

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    // 先检查登录状态
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      const data = await res.json()

      if (!data.success || !data.user) {
        // 未登录，重定向到登录页
        router.push('/login?redirect=/admin')
        return
      }

      // 检查是否是管理员
      if (data.user.role !== 'admin') {
        setError('权限不足：需要管理员权限')
        setLoading(false)
        setCheckingAuth(false)
        return
      }

      // 已登录且是管理员，获取统计数据
      setCheckingAuth(false)
      fetchStats()
    } catch (err) {
      console.error('Auth check failed:', err)
      router.push('/login?redirect=/admin')
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        credentials: 'include',
      })

      const data = await res.json()

      if (res.status === 401 || res.status === 403) {
        router.push('/login?redirect=/admin')
        return
      }

      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.error || '加载失败')
      }
    } catch (err) {
      console.error('Fetch stats failed:', err)
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  // 权限检查中
  if (checkingAuth) {
    return <PageLoading message="验证权限..." />
  }

  // 加载数据中
  if (loading) {
    return <PageLoading message="加载数据..." />
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-error font-body text-lg mb-4">{error}</p>
          <button onClick={() => router.push('/dashboard')} className="btn btn-primary">
            返回控制台
          </button>
        </div>
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
            <span className="font-display text-lg font-semibold text-cream">后台管理</span>
          </Link>
        </div>
        
        <nav className="px-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-shadow text-amber rounded-sm">
            <span>📊</span>
            <span className="font-body text-sm">概览</span>
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-mist hover:bg-shadow/50 hover:text-cream rounded-sm transition-colors">
            <span>👥</span>
            <span className="font-body text-sm">用户管理</span>
          </Link>
          <Link href="/admin/projects" className="flex items-center gap-3 px-4 py-3 text-mist hover:bg-shadow/50 hover:text-cream rounded-sm transition-colors">
            <span>📁</span>
            <span className="font-body text-sm">项目管理</span>
          </Link>
          <Link href="/admin/config" className="flex items-center gap-3 px-4 py-3 text-mist hover:bg-shadow/50 hover:text-cream rounded-sm transition-colors">
            <span>⚙️</span>
            <span className="font-body text-sm">系统配置</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 bg-void/80 backdrop-blur-xl border-b border-obsidian z-30">
          <div className="px-8 py-4">
            <h1 className="font-display text-2xl font-semibold text-cream">系统概览</h1>
            <p className="text-sm text-fog font-body mt-1">智午AI漫剧管理后台</p>
          </div>
        </header>

        <div className="p-8">
          {stats && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-night border border-obsidian rounded-lg p-6">
                  <div className="text-fog font-body text-sm mb-1">总用户</div>
                  <div className="font-display text-3xl font-semibold text-cream">{stats.users.total}</div>
                  <div className="text-success font-body text-xs mt-2">活跃 {stats.users.active}</div>
                </div>
                
                <div className="bg-night border border-obsidian rounded-lg p-6">
                  <div className="text-fog font-body text-sm mb-1">总项目</div>
                  <div className="font-display text-3xl font-semibold text-cream">{stats.projects.total}</div>
                  <div className="text-amber font-body text-xs mt-2">进行中 {stats.projects.active}</div>
                </div>
                
                <div className="bg-night border border-obsidian rounded-lg p-6">
                  <div className="text-fog font-body text-sm mb-1">AI图像</div>
                  <div className="font-display text-3xl font-semibold text-cream">{stats.ai.imagesGenerated}</div>
                  <div className="text-fog font-body text-xs mt-2">累计生成</div>
                </div>
                
                <div className="bg-night border border-obsidian rounded-lg p-6">
                  <div className="text-fog font-body text-sm mb-1">AI视频</div>
                  <div className="font-display text-3xl font-semibold text-cream">{stats.ai.videosGenerated}</div>
                  <div className="text-fog font-body text-xs mt-2">累计生成</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-6">
                <Link href="/admin/users" className="bg-night border border-obsidian rounded-lg p-6 hover:border-amber/30 transition-colors">
                  <h3 className="font-display text-lg font-semibold text-cream mb-2">👥 用户管理</h3>
                  <p className="text-fog font-body text-sm">管理用户账号、权限和VIP状态</p>
                </Link>
                
                <Link href="/admin/projects" className="bg-night border border-obsidian rounded-lg p-6 hover:border-amber/30 transition-colors">
                  <h3 className="font-display text-lg font-semibold text-cream mb-2">📁 项目管理</h3>
                  <p className="text-fog font-body text-sm">查看和管理所有用户项目</p>
                </Link>
                
                <Link href="/admin/config" className="bg-night border border-obsidian rounded-lg p-6 hover:border-amber/30 transition-colors">
                  <h3 className="font-display text-lg font-semibold text-cream mb-2">⚙️ 系统配置</h3>
                  <p className="text-fog font-body text-sm">配置AI服务、积分系统和功能开关</p>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}