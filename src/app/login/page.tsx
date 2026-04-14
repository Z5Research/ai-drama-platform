'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PageLoading, ButtonLoading } from '@/components/ui/loading'
import '@/styles/cinematic.css'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data = await res.json()

      if (data.success) {
        // 立即跳转，不等待
        router.push(redirectTo)
        router.refresh()
      } else {
        setError(data.error || '登录失败')
        setLoading(false)
      }
    } catch (err) {
      setError('网络错误，请重试')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-amber to-gold rounded-lg flex items-center justify-center shadow-glow">
              <span className="font-display text-3xl font-bold text-void">智</span>
            </div>
          </Link>
          <h1 className="font-display text-3xl font-semibold text-cream mt-6">欢迎回来</h1>
          <p className="text-fog font-body mt-2">登录您的账户继续创作</p>
        </div>

        {/* Form */}
        <div className="bg-night border border-obsidian rounded-xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-error text-sm font-body">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-fog font-body mb-2">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="w-full bg-shadow border border-obsidian rounded-lg px-4 py-3 text-cream font-body focus:border-amber focus:ring-2 focus:ring-amber/20 transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm text-fog font-body mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full bg-shadow border border-obsidian rounded-lg px-4 py-3 text-cream font-body focus:border-amber focus:ring-2 focus:ring-amber/20 transition-all disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <ButtonLoading />
                  登录中...
                </span>
              ) : (
                '登录'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-fog font-body text-sm">
              还没有账户？{' '}
              <Link 
                href={`/register${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                className="text-amber hover:text-honey transition-colors"
              >
                立即注册
              </Link>
            </p>
          </div>
        </div>

        {/* Demo account hint */}
        <div className="mt-6 text-center">
          <p className="text-sm text-fog font-body">
            演示账号：admin@zhiwu.ai / Admin@2026
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <LoginForm />
    </Suspense>
  )
}