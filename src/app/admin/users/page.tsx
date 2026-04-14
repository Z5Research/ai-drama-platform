'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import '@/styles/cinematic.css'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  status: string
  credits: number
  vipLevel: number
  createdAt: string
  lastLoginAt: string | null
  _count: {
    projects: number
    payments: number
  }
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [page, roleFilter])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: '20',
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      })

      const res = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include',
      })

      const data = await res.json()

      if (data.success) {
        setUsers(data.data.users)
        setTotal(data.data.total)
      } else if (res.status === 401 || res.status === 403) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include',
      })

      const data = await res.json()

      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u))
        setEditingUser(null)
      } else {
        alert(data.error || '更新失败')
      }
    } catch (error) {
      console.error('Update failed:', error)
      alert('更新失败')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要禁用此用户吗？')) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await res.json()

      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: 'deleted' } : u))
      } else {
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('Delete failed:', error)
      alert('操作失败')
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
            <span className="font-display text-lg font-semibold text-cream">后台管理</span>
          </Link>
        </div>
        
        <nav className="px-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-mist hover:bg-shadow/50 hover:text-cream rounded-sm transition-colors">
            <span>📊</span>
            <span className="font-body text-sm">概览</span>
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 bg-shadow text-amber rounded-sm">
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
            <h1 className="font-display text-2xl font-semibold text-cream">用户管理</h1>
            <p className="text-sm text-fog font-body mt-1">管理所有用户账号和权限</p>
          </div>
        </header>

        <div className="p-8">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <input
              type="text"
              placeholder="搜索用户..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              className="flex-1 bg-shadow border border-obsidian rounded-sm px-4 py-2 text-cream font-body"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-shadow border border-obsidian rounded-sm px-4 py-2 text-cream font-body"
            >
              <option value="">所有角色</option>
              <option value="user">普通用户</option>
              <option value="vip">VIP用户</option>
              <option value="admin">管理员</option>
            </select>
            <button
              onClick={fetchUsers}
              className="btn btn-primary px-6 py-2"
            >
              搜索
            </button>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="text-center py-12 text-fog font-body">加载中...</div>
          ) : (
            <div className="bg-night border border-obsidian rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-obsidian">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-body font-medium text-fog">用户</th>
                    <th className="px-6 py-3 text-left text-sm font-body font-medium text-fog">角色</th>
                    <th className="px-6 py-3 text-left text-sm font-body font-medium text-fog">积分</th>
                    <th className="px-6 py-3 text-left text-sm font-body font-medium text-fog">项目数</th>
                    <th className="px-6 py-3 text-left text-sm font-body font-medium text-fog">状态</th>
                    <th className="px-6 py-3 text-left text-sm font-body font-medium text-fog">注册时间</th>
                    <th className="px-6 py-3 text-left text-sm font-body font-medium text-fog">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-obsidian">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-shadow/50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-cream font-body">{user.name || user.email}</div>
                          <div className="text-xs text-fog font-body">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                          className="bg-shadow border border-obsidian rounded px-2 py-1 text-sm text-cream font-body"
                        >
                          <option value="user">用户</option>
                          <option value="vip">VIP</option>
                          <option value="admin">管理员</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-cream font-body">{user.credits}</td>
                      <td className="px-6 py-4 text-cream font-body">{user._count.projects}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-body ${
                          user.status === 'active' ? 'bg-success/20 text-success' :
                          user.status === 'suspended' ? 'bg-warning/20 text-warning' :
                          'bg-error/20 text-error'
                        }`}>
                          {user.status === 'active' ? '正常' : user.status === 'suspended' ? '暂停' : '已删除'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-fog font-body text-sm">
                        {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-amber hover:text-honey text-sm font-body"
                          >
                            编辑
                          </button>
                          {user.status !== 'deleted' && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-error hover:text-error/80 text-sm font-body"
                            >
                              禁用
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

        {/* Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-night border border-obsidian rounded-lg p-6 w-full max-w-md">
              <h2 className="font-display text-xl font-semibold text-cream mb-4">编辑用户</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-fog font-body mb-1">积分</label>
                  <input
                    type="number"
                    value={editingUser.credits}
                    onChange={(e) => setEditingUser({ ...editingUser, credits: parseInt(e.target.value) })}
                    className="w-full bg-shadow border border-obsidian rounded-sm px-4 py-2 text-cream font-body"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-fog font-body mb-1">VIP等级</label>
                  <select
                    value={editingUser.vipLevel}
                    onChange={(e) => setEditingUser({ ...editingUser, vipLevel: parseInt(e.target.value) })}
                    className="w-full bg-shadow border border-obsidian rounded-sm px-4 py-2 text-cream font-body"
                  >
                    <option value={0}>普通用户</option>
                    <option value={1}>月卡会员</option>
                    <option value={2}>季卡会员</option>
                    <option value={3}>年卡会员</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingUser(null)}
                  className="btn btn-secondary px-4 py-2"
                >
                  取消
                </button>
                <button
                  onClick={() => handleUpdateUser(editingUser.id, {
                    credits: editingUser.credits,
                    vipLevel: editingUser.vipLevel,
                  })}
                  className="btn btn-primary px-4 py-2"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}