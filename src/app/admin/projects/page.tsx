'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import '@/styles/cinematic.css'

interface Project {
  id: string
  title: string
  status: string
  visibility: string
  workflowStage: string
  viewCount: number
  createdAt: string
  user: {
    id: string
    email: string
    name: string | null
  }
  _count: {
    episodes: number
    characters: number
  }
}

export default function AdminProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [page, statusFilter])

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: '20',
        ...(statusFilter && { status: statusFilter }),
      })

      const res = await fetch(`/api/admin/projects?${params}`, {
        credentials: 'include',
      })

      const data = await res.json()

      if (data.success) {
        setProjects(data.data.projects)
        setTotal(data.data.total)
      } else if (res.status === 401 || res.status === 403) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('确定要删除此项目吗？此操作不可恢复。')) return

    try {
      const res = await fetch(`/api/admin/projects?id=${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await res.json()

      if (data.success) {
        setProjects(projects.filter(p => p.id !== projectId))
      } else {
        alert(data.error || '删除失败')
      }
    } catch (error) {
      console.error('Delete failed:', error)
      alert('删除失败')
    }
  }

  const getWorkflowLabel = (stage: string) => {
    const labels: Record<string, string> = {
      script: '剧本',
      characters: '角色',
      storyboard: '分镜',
      production: '制作',
      publish: '发布',
    }
    return labels[stage] || stage
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
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-mist hover:bg-shadow/50 hover:text-cream rounded-sm transition-colors">
            <span>📊</span>
            <span className="font-body text-sm">概览</span>
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-mist hover:bg-shadow/50 hover:text-cream rounded-sm transition-colors">
            <span>👥</span>
            <span className="font-body text-sm">用户管理</span>
          </Link>
          <Link href="/admin/projects" className="flex items-center gap-3 px-4 py-3 bg-shadow text-amber rounded-sm">
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
            <h1 className="font-display text-2xl font-semibold text-cream">项目管理</h1>
            <p className="text-sm text-fog font-body mt-1">管理所有用户项目</p>
          </div>
        </header>

        <div className="p-8">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-shadow border border-obsidian rounded-sm px-4 py-2 text-cream font-body"
            >
              <option value="">所有状态</option>
              <option value="draft">草稿</option>
              <option value="active">进行中</option>
              <option value="completed">已完成</option>
              <option value="archived">已归档</option>
            </select>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="text-center py-12 text-fog font-body">加载中...</div>
          ) : (
            <div className="grid gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-night border border-obsidian rounded-lg p-6 hover:border-amber/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-semibold text-cream mb-2">{project.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-fog font-body mb-3">
                        <span>创建者: {project.user.name || project.user.email}</span>
                        <span>•</span>
                        <span>{new Date(project.createdAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-body ${
                          project.status === 'active' ? 'bg-success/20 text-success' :
                          project.status === 'completed' ? 'bg-info/20 text-info' :
                          'bg-fog/20 text-fog'
                        }`}>
                          {project.status === 'active' ? '进行中' : project.status === 'completed' ? '已完成' : '草稿'}
                        </span>
                        <span className="text-xs px-2 py-1 bg-amber/20 text-amber rounded font-body">
                          {getWorkflowLabel(project.workflowStage)}
                        </span>
                        <span className="text-xs text-fog font-body">
                          {project._count.episodes} 集 · {project._count.characters} 角色
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/project/${project.id}`}
                        className="text-sm text-amber hover:text-honey font-body"
                      >
                        查看
                      </Link>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-sm text-error hover:text-error/80 font-body"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary px-4 py-2 disabled:opacity-50"
              >
                上一页
              </button>
              <span className="text-fog font-body">
                第 {page} / {Math.ceil(total / 20)} 页
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="btn btn-secondary px-4 py-2 disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}