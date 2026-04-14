'use client'

import { useEffect, useState } from 'react'

// 加载遮罩组件
export function LoadingOverlay({ 
  message = '加载中...',
  show = true 
}: { 
  message?: string
  show?: boolean 
}) {
  if (!show) return null
  
  return (
    <div className="fixed inset-0 bg-void/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-obsidian border-t-amber rounded-full animate-spin mx-auto mb-4" />
        <p className="text-cream font-body">{message}</p>
      </div>
    </div>
  )
}

// 页面加载组件
export function PageLoading({ message = '加载中...' }: { message?: string } = {}) {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-obsidian border-t-amber rounded-full animate-spin mx-auto mb-4" />
        <p className="text-cream font-body text-lg">{message}</p>
      </div>
    </div>
  )
}

// 按钮加载状态
export function ButtonLoading() {
  return (
    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
  )
}

// 加载旋转器
export function LoadingSpinner({ 
  size = 'md',
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }
  
  return (
    <div className={`${sizes[size]} border-obsidian border-t-amber rounded-full animate-spin ${className}`} />
  )
}

// 内联加载
export function InlineLoading({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="w-4 h-4 border-2 border-amber border-t-transparent rounded-full animate-spin" />
      <span className="text-fog font-body text-sm">加载中...</span>
    </div>
  )
}

// 骨架屏加载动画
export function SkeletonPulse({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-obsidian via-smoke to-obsidian bg-[length:200%_100%] ${className}`} />
  )
}

// 进度条加载
export function ProgressBar({ 
  progress = 0,
  showPercentage = true,
  className = ''
}: { 
  progress: number
  showPercentage?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <div className="h-2 bg-obsidian rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber to-gold transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-sm text-fog font-body mt-1 text-center">{Math.round(progress)}%</p>
      )}
    </div>
  )
}

// 延迟加载包装器
export function DelayedLoading({ 
  children,
  delay = 200,
  fallback = null
}: { 
  children: React.ReactNode
  delay?: number
  fallback?: React.ReactNode 
}) {
  const [show, setShow] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(timer)
  }, [delay])
  
  if (!show) return <>{fallback}</>
  return <>{children}</>
}

// 懒加载组件包装器
export function LazyLoader({ 
  children,
  loading = <PageLoading />
}: { 
  children: React.ReactNode
  loading?: React.ReactNode 
}) {
  const [isReady, setIsReady] = useState(false)
  
  useEffect(() => {
    setIsReady(true)
  }, [])
  
  if (!isReady) return <>{loading}</>
  return <>{children}</>
}