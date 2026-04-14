'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-api'
import { PageLoading } from '@/components/ui/loading'
import { ErrorAlert } from '@/components/ui/error-boundary'
import '@/styles/cinematic.css'

export default function NewProjectPage() {
  const router = useRouter()
  const { data: authData, isLoading: authLoading } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('=== 创建项目表单提交 ===')
    console.log('项目名称:', name)
    console.log('项目描述:', description)
    
    if (!name.trim()) {
      setError('请输入项目名称')
      return
    }
    
    setIsCreating(true)
    setError('')
    
    try {
      console.log('发送API请求...')
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: name.trim(),
          description: description.trim() || `${name.trim()} 的项目描述`,
        }),
      })
      
      console.log('响应状态:', response.status)
      const data = await response.json()
      console.log('响应数据:', data)
      
      if (data.success && data.data) {
        console.log('创建成功，跳转到:', `/project/${data.data.id}`)
        router.push(`/project/${data.data.id}`)
      } else {
        console.error('创建失败:', data.error)
        setError(data.error || '创建项目失败')
      }
    } catch (err) {
      console.error('网络错误:', err)
      setError('网络错误，请重试')
    } finally {
      setIsCreating(false)
    }
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
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-mist hover:bg-shadow/50 hover:text-cream rounded-sm transition-colors">
            <span>📊</span>
            <span className="font-body text-sm">概览</span>
          </Link>
          <Link href="/projects" className="flex items-center gap-3 px-4 py-3 bg-shadow text-amber rounded-sm">
            <span>📁</span>
            <span className="font-body text-sm">项目管理</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 bg-void/80 backdrop-blur-xl border-b border-obsidian z-30">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="font-display text-2xl font-semibold text-cream">新建项目</h1>
              <p className="text-sm text-fog font-body mt-1">创建一个新的漫剧项目</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-2xl">
          <form onSubmit={handleCreate} className="card">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-sm">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            
            <div className="mb-6">
              <label className="block text-sm text-cream font-body mb-2">项目名称 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入项目名称"
                className="w-full px-4 py-3 bg-shadow border border-obsidian rounded-sm text-cream placeholder:text-fog focus:outline-none focus:border-amber"
                disabled={isCreating}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-cream font-body mb-2">项目描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="简单描述你的项目（可选）"
                rows={4}
                className="w-full px-4 py-3 bg-shadow border border-obsidian rounded-sm text-cream placeholder:text-fog focus:outline-none focus:border-amber resize-none"
                disabled={isCreating}
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={isCreating}
                className="btn btn-primary px-8 py-3 text-sm font-medium disabled:opacity-50"
              >
                {isCreating ? '创建中...' : '创建项目'}
              </button>
              <Link
                href="/projects"
                className="text-sm text-fog font-body hover:text-cream transition-colors"
              >
                取消
              </Link>
            </div>
          </form>

          {/* Quick Tips */}
          <div className="mt-8 p-6 bg-shadow/50 rounded-sm border border-obsidian">
            <h3 className="font-display text-lg font-semibold text-cream mb-4">💡 快速开始提示</h3>
            <ul className="space-y-3 text-sm text-fog font-body">
              <li>• 项目创建后，你可以添加剧本、角色和分镜</li>
              <li>• AI 将帮助你自动生成视觉内容和视频片段</li>
              <li>• 建议先创建角色，确保全片一致性</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
