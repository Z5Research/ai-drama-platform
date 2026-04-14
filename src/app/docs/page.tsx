'use client'

import { useState } from 'react'
import Link from 'next/link'
import '@/styles/cinematic.css'

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-void">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-void/90 backdrop-blur-xl border-b border-obsidian z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber to-gold rounded-sm flex items-center justify-center">
                  <span className="font-display text-lg font-bold text-void">智</span>
                </div>
                <span className="font-display text-lg font-semibold text-cream">智午AI漫剧</span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <span className="text-amber font-body text-sm">文档</span>
                <Link href="/docs/api" className="text-mist hover:text-cream font-body text-sm transition-colors">API</Link>
                <Link href="/docs/agent" className="text-mist hover:text-cream font-body text-sm transition-colors">Agent</Link>
                <Link href="/docs/guide" className="text-mist hover:text-cream font-body text-sm transition-colors">指南</Link>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="btn btn-primary px-6 py-2 text-sm font-medium"
            >
              控制台
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="decorative-line mx-auto mb-6" />
          <h1 className="font-display text-hero font-semibold text-cream mb-6">
            开发者文档
          </h1>
          <p className="text-xl text-mist font-body max-w-3xl mx-auto mb-10">
            完整的 API 文档和 OpenClaw Agent 接入指南，帮助您快速集成 AI 影视生产能力。
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/docs/api" className="card hover:border-amber/30 transition-all group">
              <div className="text-3xl mb-4">🔌</div>
              <h3 className="font-display text-xl font-semibold text-cream mb-2 group-hover:text-amber transition-colors">API 文档</h3>
              <p className="text-sm text-fog font-body">RESTful API 接口文档，支持完整的 CRUD 操作</p>
            </Link>
            <Link href="/docs/agent" className="card hover:border-amber/30 transition-all group">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="font-display text-xl font-semibold text-cream mb-2 group-hover:text-amber transition-colors">Agent 接入</h3>
              <p className="text-sm text-fog font-body">OpenClaw Agent 接入指南和示例代码</p>
            </Link>
            <Link href="/docs/webhook" className="card hover:border-amber/30 transition-all group">
              <div className="text-3xl mb-4">🔔</div>
              <h3 className="font-display text-xl font-semibold text-cream mb-2 group-hover:text-amber transition-colors">Webhook</h3>
              <p className="text-sm text-fog font-body">事件回调配置，实时接收状态更新</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="card">
            <div className="border-b border-obsidian">
              <div className="flex gap-6 px-6 pt-4">
                {['overview', 'api', 'agent'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-2 font-body text-sm transition-colors ${
                      activeTab === tab 
                        ? 'text-amber border-b-2 border-amber' 
                        : 'text-fog hover:text-cream'
                    }`}
                  >
                    {tab === 'overview' ? '概览' : tab === 'api' ? 'API 调用' : 'Agent 接入'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-cream mb-3">1. 获取 API 密钥</h3>
                    <p className="text-mist font-body mb-4">登录控制台，在「设置 → API 密钥」页面创建新的密钥。</p>
                    <div className="bg-shadow rounded-sm p-4 font-mono text-sm text-mist">
                      sk_live_xxxxxxxxxxxxxxxxxxxxxx
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-display text-lg font-semibold text-cream mb-3">2. 发起第一次请求</h3>
                    <div className="bg-obsidian rounded-sm p-4 font-mono text-sm text-mist overflow-x-auto">
                      <pre>{`curl -X POST https://api.zhiwu.ai/v1/projects \\
  -H "Authorization: Bearer sk_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "我的第一个项目"}'`}</pre>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-cream mb-3">API 基础 URL</h3>
                    <div className="bg-shadow rounded-sm p-4 font-mono text-sm text-mist">
                      https://api.zhiwu.ai/v1
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-display text-lg font-semibold text-cream mb-3">常用端点</h3>
                    <div className="bg-shadow rounded-sm overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-obsidian">
                          <tr>
                            <th className="px-4 py-3 text-left font-body font-medium text-fog">方法</th>
                            <th className="px-4 py-3 text-left font-body font-medium text-fog">端点</th>
                            <th className="px-4 py-3 text-left font-body font-medium text-fog">说明</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-obsidian">
                          <tr>
                            <td className="px-4 py-3 text-amber font-mono">POST</td>
                            <td className="px-4 py-3 text-mist font-mono">/projects</td>
                            <td className="px-4 py-3 text-mist font-body">创建项目</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-amber font-mono">POST</td>
                            <td className="px-4 py-3 text-mist font-mono">/episodes</td>
                            <td className="px-4 py-3 text-mist font-body">创建剧集</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-amber font-mono">POST</td>
                            <td className="px-4 py-3 text-mist font-mono">/panels/generate-image</td>
                            <td className="px-4 py-3 text-mist font-body">生成图片</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'agent' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-cream mb-3">安装 OpenClaw</h3>
                    <div className="bg-obsidian rounded-sm p-4 font-mono text-sm text-mist overflow-x-auto">
                      <pre>{`# 全局安装
npm install -g openclaw

# 验证安装
openclaw --version`}</pre>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-display text-lg font-semibold text-cream mb-3">创建 Agent 配置</h3>
                    <div className="bg-obsidian rounded-sm p-4 font-mono text-sm text-mist overflow-x-auto">
                      <pre>{`# openclaw.config.yaml
agents:
  - id: drama-agent
    name: 漫剧创作助手
    provider: zhiwu
    model: qwen-plus`}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-obsidian py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-fog hover:text-amber font-body transition-colors">
            ← 返回首页
          </Link>
          <p className="text-sm text-fog font-body">© 2026 智午研究院</p>
        </div>
      </footer>
    </div>
  )
}