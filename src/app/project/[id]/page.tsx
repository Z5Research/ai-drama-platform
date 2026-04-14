'use client'

// 项目详情页
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useProjectStore, useAIGenerationStore } from '@/stores'
import { Project, Script } from '@/types'

export default function ProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const { currentProject, setCurrentProject, updateProject } = useProjectStore()
  const { isGenerating, startGeneration, finishGeneration, setError } = useAIGenerationStore()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'scripts' | 'characters' | 'media'>('scripts')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generateForm, setGenerateForm] = useState({
    prompt: '',
    genre: '',
    style: '',
    model: 'gpt-4',
  })
  
  useEffect(() => {
    fetchProject()
  }, [projectId])
  
  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`)
      const data = await res.json()
      
      if (data.success) {
        setCurrentProject(data.data)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Fetch project error:', err)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }
  
  const handleGenerate = async () => {
    if (!generateForm.prompt.trim()) return
    
    startGeneration()
    
    try {
      const res = await fetch('/api/agents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          ...generateForm,
        }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        // 更新项目
        fetchProject()
        setShowGenerateModal(false)
        setGenerateForm({ prompt: '', genre: '', style: '', model: 'gpt-4' })
      } else {
        setError(data.error || '生成失败')
      }
    } catch (err) {
      setError('网络错误，请重试')
    } finally {
      finishGeneration()
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }
  
  if (!currentProject) {
    return null
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 space-x-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              ← 返回
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="font-semibold truncate">{currentProject.title}</h1>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 项目头部 */}
        <div className="card mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{currentProject.title}</h2>
              <p className="text-gray-600">{currentProject.description}</p>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="btn-gradient"
              disabled={isGenerating}
            >
              {isGenerating ? '生成中...' : '✨ AI 生成剧本'}
            </button>
          </div>
        </div>
        
        {/* 标签页 */}
        <div className="border-b mb-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('scripts')}
              className={`py-4 border-b-2 font-medium ${
                activeTab === 'scripts'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              剧本 ({currentProject.scripts?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('characters')}
              className={`py-4 border-b-2 font-medium ${
                activeTab === 'characters'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              角色 ({currentProject.characters?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`py-4 border-b-2 font-medium ${
                activeTab === 'media'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              媒体
            </button>
          </div>
        </div>
        
        {/* 内容区域 */}
        {activeTab === 'scripts' && (
          <div className="space-y-4">
            {currentProject.scripts?.length === 0 ? (
              <div className="text-center py-12 card">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-600 mb-4">还没有剧本，点击上方按钮生成</p>
              </div>
            ) : (
              currentProject.scripts?.map((script) => (
                <div key={script.id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg">{script.title}</h3>
                    {script.isAiGenerated && (
                      <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-xs">
                        AI生成
                      </span>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-600">
                    {script.content.substring(0, 200)}...
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    消耗 {script.creditsCost} 积分 · {new Date(script.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {activeTab === 'characters' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentProject.characters?.length === 0 ? (
              <div className="col-span-full text-center py-12 card">
                <div className="text-4xl mb-4">🎭</div>
                <p className="text-gray-600">角色将随剧本自动生成</p>
              </div>
            ) : (
              currentProject.characters?.map((char) => (
                <div key={char.id} className="card">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                    <div>
                      <h4 className="font-semibold">{char.name}</h4>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {char.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {activeTab === 'media' && (
          <div className="text-center py-12 card">
            <div className="text-4xl mb-4">🎬</div>
            <p className="text-gray-600">图像和视频将在这里显示</p>
          </div>
        )}
      </main>
      
      {/* 生成弹窗 */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <h3 className="text-xl font-bold mb-6">AI 生成剧本</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  创意描述 *
                </label>
                <textarea
                  value={generateForm.prompt}
                  onChange={(e) => setGenerateForm({ ...generateForm, prompt: e.target.value })}
                  placeholder="描述你想创作的剧本内容，例如：一个关于穿越时空的爱情故事..."
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    类型
                  </label>
                  <select
                    value={generateForm.genre}
                    onChange={(e) => setGenerateForm({ ...generateForm, genre: e.target.value })}
                  >
                    <option value="">选择类型</option>
                    <option value="剧情">剧情</option>
                    <option value="喜剧">喜剧</option>
                    <option value="悬疑">悬疑</option>
                    <option value="科幻">科幻</option>
                    <option value="爱情">爱情</option>
                    <option value="动作">动作</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    风格
                  </label>
                  <select
                    value={generateForm.style}
                    onChange={(e) => setGenerateForm({ ...generateForm, style: e.target.value })}
                  >
                    <option value="">选择风格</option>
                    <option value="现代">现代</option>
                    <option value="古装">古装</option>
                    <option value="未来">未来</option>
                    <option value="架空">架空</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI 模型
                </label>
                <select
                  value={generateForm.model}
                  onChange={(e) => setGenerateForm({ ...generateForm, model: e.target.value })}
                >
                  <option value="glm-5">智谱 GLM-5 (推荐)</option>
                  <option value="glm-4">智谱 GLM-4</option>
                  <option value="qwen-plus">通义千问 Plus</option>
                  <option value="qwen-max">通义千问 Max</option>
                </select>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg text-sm text-indigo-600">
                💡 预估消耗：{generateForm.prompt.length > 0 ? '10-50' : '0'} 积分
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!generateForm.prompt.trim() || isGenerating}
                  className="flex-1 btn-gradient disabled:opacity-50"
                >
                  {isGenerating ? '生成中...' : '开始生成'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
