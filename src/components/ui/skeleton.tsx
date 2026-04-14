'use client'

// 骨架屏组件 - 用于加载状态
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton-wave rounded ${className}`} />
  )
}

// 文本骨架
export function SkeletonText({ 
  lines = 1, 
  className = '' 
}: { 
  lines?: number
  className?: string 
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} 
        />
      ))}
    </div>
  )
}

// 卡片骨架
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-night border border-obsidian rounded-lg p-6 ${className}`}>
      <Skeleton className="h-40 w-full mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

// 表格行骨架
export function SkeletonTableRow({ 
  columns = 5,
  className = ''
}: { 
  columns?: number
  className?: string 
}) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

// 头像骨架
export function SkeletonAvatar({ 
  size = 'md',
  className = ''
}: { 
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }
  return (
    <Skeleton className={`${sizes[size]} rounded-full ${className}`} />
  )
}

// 项目卡片骨架
export function SkeletonProjectCard() {
  return (
    <div className="bg-night border border-obsidian rounded-lg overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded" />
          <Skeleton className="h-6 w-20 rounded" />
        </div>
      </div>
    </div>
  )
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-night border border-obsidian rounded-lg p-6">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

// Project Card Skeleton
export function ProjectCardSkeleton() {
  return <SkeletonProjectCard />}

// 用户列表骨架
export function SkeletonUserList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-night border border-obsidian rounded-lg">
          <SkeletonAvatar />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-8 w-20 rounded" />
        </div>
      ))}
    </div>
  )
}

// 全页加载骨架
export function SkeletonPage() {
  return (
    <div className="min-h-screen bg-void p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        
        {/* Content */}
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  )
}