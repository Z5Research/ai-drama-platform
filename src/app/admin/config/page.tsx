'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import '@/styles/cinematic.css'

interface SystemConfig {
  aiProvider: string
  aiModel: string
  defaultCredits: number
  vipMonthlyPrice: number
  vipQuarterlyPrice: number
  vipYearlyPrice: number
  enableRegistration: boolean
  enableAiImage: boolean
  enableAiVideo: boolean
  rateLimitAuth: number
  rateLimitAi: number
}

export default function AdminConfigPage() {
  const router = useRouter()
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/config', {
        credentials: 'include',
      })

      const data = await res.json()

      if (data.success) {
        setConfig(data.config)
      } else if (res.status === 401 || res.status === 403) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Failed to fetch config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return

    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
        credentials: 'include',
      })

      const data = await res.json()

      if (data.success) {
        setMessage('✅ 配置已保存')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('❌ 保存失败: ' + (data.error || '未知错误'))
      }
    } catch (error) {
      console.error('Save failed:', error)
      setMessage('❌ 保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-fog font-body">加载中...</div>
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
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-mist hover:bg-shadow/50 hover:text-cream rounded-sm transition-colors">
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
          <Link href="/admin/config" className="flex items-center gap-3 px-4 py-3 bg-shadow text-amber rounded-sm">
            <span>⚙️</span>
            <span className="font-body text-sm">系统配置</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 bg-void/80 backdrop-blur-xl border-b border-obsidian z-30">
          <div className="px-8 py-4">
            <h1 className="font-display text-2xl font-semibold text-cream">系统配置</h1>
            <p className="text-sm text-fog font-body mt-1">配置系统参数和功能开关</p>
          </div>
        </header>

        <div className="p-8 max-w-4xl">
          {message && (
            <div className="mb-6 px-4 py-3 bg-shadow border border-obsidian rounded-lg text-cream font-body">
              {message}
            </div>
          )}

          {config && (
            <div className="space-y-8">
              {/* AI 配置 */}
              <section className="bg-night border border-obsidian rounded-lg p-6">
                <h2 className="font-display text-lg font-semibold text-cream mb-4">🤖 AI 服务配置</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-fog font-body mb-2">AI 提供商</label>
                    <select
                      value={config.aiProvider}
                      onChange={(e) => setConfig({ ...config, aiProvider: e.target.value })}
                      className="w-full bg-shadow border border-obsidian rounded-sm px-4 py-2 text-cream font-body"
                    >
                      <option value="bailian">阿里云百炼</option>
                      <option value="volcengine">火山方舟</option>
                      <option value="openai">OpenAI</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-fog font-body mb-2">默认模型</label>
                    <input
                      type="text"
                      value={config.aiModel}
                      onChange={(e) => setConfig({ ...config, aiModel: e.target.value })}
                      className="w-full bg-shadow border border-obsidian rounded-sm px-4 py-2 text-cream font-body"
                    />
                  </div>
                </div>
              </section>

              {/* 积分配置 */}
              <section className="bg-night border border-obsidian rounded-lg p-6">
                <h2 className="font-display text-lg font-semibold text-cream mb-4">💎 积分配置</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-fog font-body mb-2">新用户默认积分</label>
                    <input
                      type="number"
                      value={config.defaultCredits}
                      onChange={(e) => setConfig({ ...config, defaultCredits: parseInt(e.target.value) })}
                      className="w-full bg-shadow border border-obsidian rounded-sm px-4 py-2 text-cream font-body"
                    />
                  </div>
                </div>
              </section>

              {/* VIP 配置 */}
              <section className="bg-night border border-obsidian rounded-lg p-6">
                <h2 className="font-display text-lg font-semibold text-cream mb-4">👑 VIP 配置</h2>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-fog font-body mb-2">月卡价格 (元)</label>
                    <input
                      type="number"
                      value={config.vipMonthlyPrice}
                      onChange={(e) => setConfig({ ...config, vipMonthlyPrice: parseInt(e.target.value) })}
                      className="w-full bg-shadow border border-obsidian rounded-sm px-4 py-2 text-cream font-body"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-fog font-body mb-2">季卡价格 (元)</label>
                    <input
                      type="number"
                      value={config.vipQuarterlyPrice}
                      onChange={(e) => setConfig({ ...config, vipQuarterlyPrice: parseInt(e.target.value) })}
                      className="w-full bg-shadow border border-obsidian rounded-sm px-4 py-2 text-cream font-body"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-fog font-body mb-2">年卡价格 (元)</label>
                    <input
                      type="number"
                      value={config.vipYearlyPrice}
                      onChange={(e) => setConfig({ ...config, vipYearlyPrice: parseInt(e.target.value) })}
                      className="w-full bg-shadow border border-obsidian rounded-sm px-4 py-2 text-cream font-body"
                    />
                  </div>
                </div>
              </section>

              {/* 功能开关 */}
              <section className="bg-night border border-obsidian rounded-lg p-6">
                <h2 className="font-display text-lg font-semibold text-cream mb-4">🔧 功能开关</h2>
                
                <div className="space-y-4">
                  {[
                    { key: 'enableRegistration', label: '允许新用户注册' },
                    { key: 'enableAiImage', label: 'AI 图像生成' },
                    { key: 'enableAiVideo', label: 'AI 视频生成' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-cream font-body">{label}</span>
                      <button
                        onClick={() => setConfig({ ...config, [key]: !config[key as keyof SystemConfig] })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          config[key as keyof SystemConfig] ? 'bg-success' : 'bg-obsidian'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-cream transition-transform ${
                            config[key as keyof SystemConfig] ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* 速率限制 */}
              <section className="bg-night border border-obsidian rounded-lg p-6">
                <h2 className="font-display text-lg font-semibold text-cream mb-4">⚡ 速率限制</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-fog font-body mb-2">认证接口 (次/15分钟)</label>
                    <input
                      type="number"
                      value={config.rateLimitAuth}
                      onChange={(e) => setConfig({ ...config, rateLimitAuth: parseInt(e.target.value) })}
                      className="w-full bg-shadow border border-obsidian rounded-sm px-4 py-2 text-cream font-body"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-fog font-body mb-2">AI 接口 (次/分钟)</label>
                    <input
                      type="number"
                      value={config.rateLimitAi}
                      onChange={(e) => setConfig({ ...config, rateLimitAi: parseInt(e.target.value) })}
                      className="w-full bg-shadow border border-obsidian rounded-sm px-4 py-2 text-cream font-body"
                    />
                  </div>
                </div>
              </section>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary px-8 py-3"
                >
                  {saving ? '保存中...' : '保存配置'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}