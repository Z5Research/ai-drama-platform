'use client'

// 模板市场页面
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Template } from '@/types'

export default function TemplatesPage() {
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<Template[]>([])
  const [category, setCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  useEffect(() => {
    fetchTemplates()
  }, [category])
  
  const fetchTemplates = async () => {
    try {
      const res = await fetch(`/api/templates?category=${category}&pageSize=50`)
      const data = await res.json()
      
      if (data.success) {
        setTemplates(data.data.items)
      }
    } catch (err) {
      console.error('Fetch templates error:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const categories = [
    { id: 'all', name: '全部', icon: '📚' },
    { id: 'script', name: '剧本', icon: '📝' },
    { id: 'character', name: '角色', icon: '🎭' },
    { id: 'scene', name: '场景', icon: '🎬' },
    { id: 'style', name: '风格', icon: '🎨' },
  ]
  
  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              ← 返回
            </Link>
            <span className="mx-4 text-gray-300">|</span>
            <h1 className="font-semibold">模板市场</h1>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和分类 */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="搜索模板..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md mb-6"
          />
          
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap ${
                  category === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* 精选模板 */}
        {category === 'all' && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">🔥 精选推荐</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter(t => t.isFeatured)
                .slice(0, 3)
                .map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
            </div>
          </div>
        )}
        
        {/* 全部模板 */}
        <div>
          <h2 className="text-xl font-bold mb-4">
            {categories.find(c => c.id === category)?.name || '全部模板'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              没有找到匹配的模板
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// 模板卡片组件
function TemplateCard({ template }: { template: Template }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <Link
      href={`/templates/${template.id}`}
      className="card hover:shadow-lg transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 缩略图 */}
      <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
        {template.thumbnail ? (
          <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <span className="text-4xl">
            {template.category === 'script' && '📝'}
            {template.category === 'character' && '🎭'}
            {template.category === 'scene' && '🎬'}
            {template.category === 'style' && '🎨'}
          </span>
        )}
      </div>
      
      <h3 className="font-semibold mb-2 line-clamp-1">{template.name}</h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {template.description}
      </p>
      
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center space-x-2">
          {template.isFree ? (
            <span className="bg-green-100 text-green-600 px-2 py-1 rounded">免费</span>
          ) : (
            <span className="text-indigo-600">{template.price} 积分</span>
          )}
        </div>
        <div className="text-gray-500">
          {template.useCount} 次使用
        </div>
      </div>
    </Link>
  )
}
