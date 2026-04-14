'use client'

// 角色库页面 - 全局角色管理
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Appearance {
  id: string
  appearanceIndex: number
  changeReason: string
  description: string | null
  imageUrl: string | null
  imageUrls: string | null
  selectedIndex: number
}

interface Character {
  id: string
  name: string
  description: string | null
  aliases: string | null
  profileData: string | null
  traits: string | null
  introduction: string | null
  voiceId: string | null
  voiceType: string | null
  isGlobal: boolean
  createdAt: string
  appearances: Appearance[]
}

export default function CharactersPage() {
  const router = useRouter()
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    introduction: ''
  })

  useEffect(() => {
    fetchCharacters()
  }, [])

  const fetchCharacters = async () => {
    try {
      const res = await fetch('/api/characters?global=true')
      const data = await res.json()
      if (data.success) {
        setCharacters(data.characters)
      }
    } catch (err) {
      console.error('Fetch characters error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!createForm.name.trim()) return

    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          isGlobal: true
        })
      })

      const data = await res.json()
      if (data.success) {
        setCharacters([data.character, ...characters])
        setShowCreateModal(false)
        setCreateForm({ name: '', description: '', introduction: '' })
      }
    } catch (err) {
      console.error('Create character error:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个角色吗？')) return

    try {
      const res = await fetch(`/api/characters/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setCharacters(characters.filter(c => c.id !== id))
      }
    } catch (err) {
      console.error('Delete character error:', err)
    }
  }

  const openDetail = (character: Character) => {
    setSelectedCharacter(character)
    setShowDetailModal(true)
  }

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
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                ← 返回
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="font-semibold">角色库</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-gradient"
            >
              + 创建角色
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 说明 */}
        <div className="card mb-6 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="font-semibold text-lg mb-2">🎭 全局角色库</h2>
          <p className="text-gray-600 text-sm">
            创建可复用的角色形象，一键复制到任意项目。支持多外观管理，确保角色在不同场景中的一致性。
          </p>
        </div>

        {/* 角色列表 */}
        {characters.length === 0 ? (
          <div className="text-center py-16 card">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold mb-2">还没有角色</h3>
            <p className="text-gray-600 mb-6">创建你的第一个角色，开始构建角色库</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-gradient"
            >
              创建第一个角色
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => {
              const primaryAppearance = character.appearances[0]
              return (
                <div
                  key={character.id}
                  className="card hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => openDetail(character)}
                >
                  {/* 角色图片 */}
                  <div className="relative aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    {primaryAppearance?.imageUrl ? (
                      <img
                        src={primaryAppearance.imageUrl}
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        👤
                      </div>
                    )}
                    
                    {/* 外观数量标签 */}
                    {character.appearances.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                        {character.appearances.length} 个外观
                      </div>
                    )}
                    
                    {/* 操作按钮 */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openDetail(character)
                        }}
                        className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
                      >
                        编辑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(character.id)
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600"
                      >
                        删除
                      </button>
                    </div>
                  </div>

                  {/* 角色信息 */}
                  <h3 className="font-semibold text-lg mb-1">{character.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {character.description || character.introduction || '暂无描述'}
                  </p>

                  {/* 标签 */}
                  <div className="flex flex-wrap gap-2">
                    {character.voiceId && (
                      <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs">
                        🔊 已配置语音
                      </span>
                    )}
                    <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-xs">
                      全局角色
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* 创建角色弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4 animate-fadeIn">
            <h3 className="text-xl font-bold mb-6">创建角色</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色名称 *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="输入角色名称"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色描述
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="描述角色的外貌、性格等特点..."
                  rows={3}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色介绍
                </label>
                <textarea
                  value={createForm.introduction}
                  onChange={(e) => setCreateForm({ ...createForm, introduction: e.target.value })}
                  placeholder="角色的背景故事、身份等..."
                  rows={2}
                  className="w-full"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!createForm.name.trim()}
                  className="flex-1 btn-gradient disabled:opacity-50"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 角色详情弹窗 */}
      {showDetailModal && selectedCharacter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold">{selectedCharacter.name}</h3>
                <p className="text-gray-600">{selectedCharacter.description}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* 外观列表 */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">外观形象 ({selectedCharacter.appearances.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedCharacter.appearances.map((appearance) => (
                  <div key={appearance.id} className="border rounded-lg p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      {appearance.imageUrl ? (
                        <img
                          src={appearance.imageUrl}
                          alt={`${selectedCharacter.name} - 外观 ${appearance.appearanceIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          👤
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      {appearance.changeReason}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {appearance.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 角色档案 */}
            {selectedCharacter.profileData && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3">角色档案</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(JSON.parse(selectedCharacter.profileData), null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                关闭
              </button>
              <button className="flex-1 btn-gradient">
                生成新外观
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
