'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-api'
import { useMounted } from '@/hooks/use-common'
import '@/styles/cinematic.css'

export default function HomePage() {
  const router = useRouter()
  const mounted = useMounted()
  const { data: authData } = useAuth()
  
  const user = authData?.user
  const isLoggedIn = authData?.success && user

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[80px] animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50">
        <div className="backdrop-blur-xl bg-void/80 border-b border-obsidian/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-4 group">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber to-gold rounded-sm flex items-center justify-center transform group-hover:scale-105 transition-transform">
                    <span className="font-display text-2xl font-bold text-void">智</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border border-amber" />
                </div>
                <div>
                  <span className="font-display text-xl font-semibold text-cream tracking-wide">智午AI漫剧</span>
                  <div className="text-xs text-fog font-body">Cinematic Intelligence</div>
                </div>
              </Link>
              
              {/* Actions */}
              <div className="flex items-center gap-6">
                {isLoggedIn ? (
                  <>
                    <Link 
                      href="/dashboard"
                      className="text-mist hover:text-cream transition-colors font-body"
                    >
                      控制台
                    </Link>
                    <Link 
                      href="/admin"
                      className="text-mist hover:text-cream transition-colors font-body"
                    >
                      后台
                    </Link>
                    <Link
                      href="/dashboard"
                      className="btn btn-primary px-8 py-3 font-medium"
                    >
                      进入工作台
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login"
                      className="text-mist hover:text-cream transition-colors font-body"
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      className="btn btn-primary px-8 py-3 font-medium"
                    >
                      开始创作
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`space-y-8 ${mounted ? 'animate-fade-in-slow' : 'opacity-0'}`}>
            {/* Badge */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-3 px-5 py-2 border border-obsidian rounded-full bg-shadow/50 backdrop-blur">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-sm text-mist font-body">工业级全流程 AI 影视生产平台</span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="text-center max-w-5xl mx-auto">
              <h1 className="font-display text-hero font-semibold text-cream mb-6 leading-tight">
                从文本到视频
                <br />
                <span className="text-gradient">AI 驱动的影视革命</span>
              </h1>
              
              <p className="text-xl text-mist font-body max-w-3xl mx-auto leading-relaxed">
                基于前沿 AI 技术，将小说、剧本自动转化为专业分镜视频。
                <br className="hidden md:block" />
                五阶段工作流，角色一致性管理，配音口型同步。
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href={isLoggedIn ? "/dashboard" : "/register"}
                className="btn btn-primary px-10 py-4 text-lg font-medium"
              >
                {isLoggedIn ? "进入工作台" : "免费开始创作"}
              </Link>
              <Link
                href="/docs"
                className="btn btn-secondary px-10 py-4 text-lg font-body"
              >
                查看文档
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-4xl mx-auto">
              {[
                { value: '10K+', label: '创作者' },
                { value: '50K+', label: '项目' },
                { value: '1M+', label: '生成图片' },
                { value: '100K+', label: '生成视频' },
              ].map((stat, i) => (
                <div key={i} className="text-center" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="font-display text-4xl font-semibold text-gradient mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-fog font-body">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-shadow/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="decorative-line mx-auto mb-6" />
            <h2 className="font-display text-4xl font-semibold text-cream mb-4">
              五阶段专业工作流
            </h2>
            <p className="text-mist font-body text-lg max-w-2xl mx-auto">
              借鉴好莱坞标准流程，从剧本到成片的无缝创作体验
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {[
              { num: '01', title: '剧本创作', desc: 'AI 辅助编剧，自动分析角色场景', icon: '📝' },
              { num: '02', title: '角色设定', desc: '多外观管理，确保角色一致性', icon: '👤' },
              { num: '03', title: '分镜设计', desc: '自动生成分镜，支持视觉规划', icon: '🎬' },
              { num: '04', title: '内容制作', desc: 'AI 生成图片视频，配音口型同步', icon: '🎥' },
              { num: '05', title: '发布导出', desc: '专业视频编辑，多格式导出', icon: '🚀' },
            ].map((stage, i) => (
              <div 
                key={i} 
                className="group relative"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="h-full p-6 bg-night border border-obsidian rounded-sm hover:border-amber/30 transition-all hover:shadow-lg hover:shadow-amber/5">
                  <div className="text-5xl font-display font-bold text-obsidian group-hover:text-shadow transition-colors mb-4">
                    {stage.num}
                  </div>
                  <div className="text-2xl mb-3">{stage.icon}</div>
                  <h3 className="font-display text-lg font-semibold text-cream mb-2">{stage.title}</h3>
                  <p className="text-sm text-fog font-body">{stage.desc}</p>
                </div>
                {i < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-amber/30 text-xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="decorative-line mx-auto mb-6" />
            <h2 className="font-display text-4xl font-semibold text-cream mb-4">
              核心能力
            </h2>
            <p className="text-mist font-body text-lg">
              面向专业创作者的全面功能支持
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'AI 图像生成',
                features: ['DALL-E 3 / Midjourney / SD', '角色一致性保持', '多风格支持', '批量生成'],
              },
              {
                title: 'AI 视频生成',
                features: ['文生视频', '图生视频', '首尾帧控制', '多分辨率支持'],
              },
              {
                title: '专业配音',
                features: ['多角色配音', '自定义音色', '情绪控制', '口型同步'],
              },
              {
                title: '视频编辑',
                features: ['时间线编辑', '多轨道支持', '转场效果', '实时预览'],
              },
              {
                title: '项目管理',
                features: ['多项目支持', '协作功能', '版本控制', '权限管理'],
              },
              {
                title: 'OpenClaw 集成',
                features: ['AI Agent 接入', 'API 开放', 'Webhook 支持', '自定义流程'],
              },
            ].map((item, i) => (
              <div key={i} className="card decorative-corner hover:border-glow">
                <h3 className="font-display text-xl font-semibold text-cream mb-4">{item.title}</h3>
                <ul className="space-y-3">
                  {item.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-mist font-body">
                      <span className="w-1 h-1 bg-amber rounded-full mt-2 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OpenClaw Integration */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber/5 via-transparent to-gold/5" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-amber/30 rounded-full bg-amber/5 mb-6">
                <span className="w-2 h-2 bg-success rounded-full" />
                <span className="text-sm text-amber font-body">OpenClaw 集成</span>
              </div>
              
              <h2 className="font-display text-4xl font-semibold text-cream mb-6">
                AI Agent 接入
                <br />
                <span className="text-gradient">自动化创作流程</span>
              </h2>
              
              <p className="text-lg text-mist font-body mb-8 leading-relaxed">
                通过 OpenClaw 智能体框架，将智午AI漫剧集成到您的自动化工作流中。
                支持 API 调用、Webhook 回调、自定义 Agent 等多种接入方式。
              </p>
              
              <div className="bg-shadow border border-obsidian rounded-sm p-6 font-mono text-sm text-mist overflow-x-auto">
                <pre>{`# 安装 OpenClaw
npm install -g openclaw

# 创建 Agent
openclaw agent create drama-agent

# 配置 API
openclaw config set API_URL \\
  https://api.zhiwu.ai/v1

# 测试连接
openclaw test`}</pre>
              </div>
            </div>

            <div className="space-y-4">
              <div className="card hover:border-amber/30 transition-all">
                <h4 className="font-display text-lg font-semibold text-cream mb-2">API 密钥管理</h4>
                <p className="text-sm text-fog font-body mb-4">生成和管理 API 密钥，支持权限控制和速率限制</p>
                <Link href="/dashboard/api-keys" className="text-amber text-sm font-body hover:text-honey transition-colors">
                  管理密钥 →
                </Link>
              </div>
              
              <div className="card hover:border-amber/30 transition-all">
                <h4 className="font-display text-lg font-semibold text-cream mb-2">Webhook 配置</h4>
                <p className="text-sm text-fog font-body mb-4">配置事件回调，实时接收项目状态更新</p>
                <Link href="/dashboard/webhooks" className="text-amber text-sm font-body hover:text-honey transition-colors">
                  配置 Webhook →
                </Link>
              </div>
              
              <div className="card hover:border-amber/30 transition-all">
                <h4 className="font-display text-lg font-semibold text-cream mb-2">Agent 示例</h4>
                <p className="text-sm text-fog font-body mb-4">查看示例代码，快速上手集成</p>
                <Link href="/docs/agent" className="text-amber text-sm font-body hover:text-honey transition-colors">
                  查看示例 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card p-12 border-glow">
            <h2 className="font-display text-3xl font-semibold text-cream mb-4">
              开始您的 AI 影视创作之旅
            </h2>
            <p className="text-lg text-mist font-body mb-8">
              免费注册，立即体验从文本到视频的 AI 魔法
            </p>
            <Link
              href={isLoggedIn ? "/dashboard" : "/register"}
              className="btn btn-primary px-12 py-4 text-lg font-medium"
            >
              {isLoggedIn ? "进入工作台" : "免费注册"}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-obsidian py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber to-gold rounded-sm flex items-center justify-center">
                  <span className="font-display text-lg font-bold text-void">智</span>
                </div>
                <span className="font-display text-lg font-semibold text-cream">智午AI漫剧</span>
              </div>
              <p className="text-sm text-fog font-body">
                工业级全流程 AI 影视生产平台
              </p>
            </div>
            
            <div>
              <h4 className="font-display font-semibold text-cream mb-4">产品</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs" className="text-mist hover:text-amber font-body">使用文档</Link></li>
                <li><Link href="/pricing" className="text-mist hover:text-amber font-body">价格方案</Link></li>
                <li><Link href="/templates" className="text-mist hover:text-amber font-body">模板市场</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-display font-semibold text-cream mb-4">开发者</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs/api" className="text-mist hover:text-amber font-body">API 文档</Link></li>
                <li><Link href="/docs/agent" className="text-mist hover:text-amber font-body">Agent 接入</Link></li>
                <li><Link href="/docs/webhook" className="text-mist hover:text-amber font-body">Webhook</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-display font-semibold text-cream mb-4">支持</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="text-mist hover:text-amber font-body">帮助中心</Link></li>
                <li><Link href="/community" className="text-mist hover:text-amber font-body">社区</Link></li>
                <li><Link href="/contact" className="text-mist hover:text-amber font-body">联系我们</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-obsidian pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-fog font-body">
              © 2026 智午研究院. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-fog hover:text-amber font-body">隐私政策</Link>
              <Link href="/terms" className="text-fog hover:text-amber font-body">服务条款</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
