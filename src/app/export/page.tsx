'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface RenderTask {
  id: string
  episodeId: string
  episode: {
    id: string
    episodeNumber: number
    title: string | null
    project: {
      id: string
      title: string
    }
  }
  renderStatus: string | null
  outputUrl: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * 导出中心页面
 * 查看渲染任务状态和下载导出的视频
 */
export default function ExportCenterPage() {
  const [tasks, setTasks] = useState<RenderTask[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadTasks()
  }, [filter])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const url = filter === 'all' 
        ? '/api/editor/projects?limit=50'
        : `/api/editor/projects?status=${filter}&limit=50`
      
      const response = await fetch(url)
      const data = await response.json()
      setTasks(data.projects || [])
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string | null) => {
    const statusConfig = {
      pending: { color: '#F59E0B', label: '等待中' },
      rendering: { color: '#3B82F6', label: '渲染中' },
      completed: { color: '#10B981', label: '已完成' },
      failed: { color: '#EF4444', label: '失败' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <span style={{
        padding: '4px 12px',
        background: config.color,
        color: 'white',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 500
      }}>
        {config.label}
      </span>
    )
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      color: 'white',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              marginBottom: '8px'
            }}>
              📦 导出中心
            </h1>
            <p style={{ color: '#999', fontSize: '14px' }}>
              查看渲染任务状态和下载导出的视频
            </p>
          </div>
          <Link
            href="/dashboard"
            style={{
              padding: '12px 24px',
              background: '#333',
              border: '1px solid #444',
              borderRadius: '8px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            ← 返回工作台
          </Link>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px'
        }}>
          {[
            { value: 'all', label: '全部' },
            { value: 'pending', label: '等待中' },
            { value: 'rendering', label: '渲染中' },
            { value: 'completed', label: '已完成' },
            { value: 'failed', label: '失败' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              style={{
                padding: '8px 20px',
                background: filter === option.value ? '#4F46E5' : '#1e1e1e',
                border: '1px solid #333',
                borderRadius: '20px',
                color: filter === option.value ? 'white' : '#999',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Task List */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#666'
          }}>
            加载中...
          </div>
        ) : tasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#1e1e1e',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              暂无渲染任务
            </p>
            <Link
              href="/project"
              style={{
                padding: '12px 24px',
                background: '#4F46E5',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              创建项目
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '16px'
          }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  background: '#1e1e1e',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px'
                }}
              >
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      margin: 0
                    }}>
                      {task.episode.project.title}
                    </h3>
                    <span style={{
                      color: '#999',
                      fontSize: '14px'
                    }}>
                      第 {task.episode.episodeNumber} 集
                    </span>
                    {task.episode.title && (
                      <span style={{
                        color: '#666',
                        fontSize: '12px'
                      }}>
                        {task.episode.title}
                      </span>
                    )}
                  </div>
                  <p style={{
                    color: '#666',
                    fontSize: '12px',
                    margin: 0
                  }}>
                    更新时间: {formatDate(task.updatedAt)}
                  </p>
                </div>

                {/* Status */}
                {getStatusBadge(task.renderStatus)}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  {task.renderStatus === 'completed' && task.outputUrl && (
                    <a
                      href={task.outputUrl}
                      download
                      style={{
                        padding: '8px 16px',
                        background: '#10B981',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        textDecoration: 'none',
                        fontSize: '14px'
                      }}
                    >
                      ⬇️ 下载
                    </a>
                  )}
                  {task.renderStatus === 'rendering' && (
                    <button
                      disabled
                      style={{
                        padding: '8px 16px',
                        background: '#3B82F6',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '14px',
                        opacity: 0.7
                      }}
                    >
                      渲染中...
                    </button>
                  )}
                  {task.renderStatus === 'failed' && (
                    <button
                      onClick={() => {
                        // 重新渲染
                        fetch(`/api/editor/projects/${task.episodeId}/render`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ editorProjectId: task.id })
                        }).then(() => loadTasks())
                      }}
                      style={{
                        padding: '8px 16px',
                        background: '#EF4444',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      🔄 重试
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
