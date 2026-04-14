// Optimized Image Component with lazy loading
'use client'

import { useState, useEffect } from 'react'
import { clsx } from 'clsx'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'blur',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [inView, setInView] = useState(priority)

  useEffect(() => {
    if (priority) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '50px' }
    )

    const element = document.getElementById(`img-${src}`)
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [src, priority])

  return (
    <div
      id={`img-${src}`}
      className={clsx('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!loaded && !error && (
        <div
          className={clsx(
            'absolute inset-0 bg-obsidian/50 animate-pulse',
            placeholder === 'blur' && 'backdrop-blur-sm'
          )}
        />
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-obsidian/30">
          <span className="text-mist">⚠️</span>
        </div>
      )}

      {/* Actual image */}
      {inView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={clsx(
            'transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={() => {
            setLoaded(true)
            onLoad?.()
          }}
          onError={() => {
            setError(true)
            onError?.()
          }}
        />
      )}
    </div>
  )
}

// Video thumbnail with lazy load
interface VideoThumbnailProps {
  thumbnailUrl?: string
  title: string
  duration?: number
  className?: string
}

export function VideoThumbnail({
  thumbnailUrl,
  title,
  duration,
  className,
}: VideoThumbnailProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={clsx('relative aspect-video bg-shadow rounded-sm overflow-hidden', className)}>
      {thumbnailUrl ? (
        <>
          <img
            src={thumbnailUrl}
            alt={title}
            loading="lazy"
            className={clsx(
              'w-full h-full object-cover transition-opacity duration-300',
              loaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setLoaded(true)}
          />
          {duration && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-void/80 rounded text-xs text-cream font-body">
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-4xl opacity-30">🎬</span>
        </div>
      )}
    </div>
  )
}
