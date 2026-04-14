// Error Boundary Component
'use client'

import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="font-display text-2xl font-semibold text-cream mb-2">
              出错了
            </h2>
            <p className="text-mist font-body mb-6">
              页面遇到了问题，请尝试刷新或返回上一页
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary px-6 py-2"
              >
                刷新页面
              </button>
              <button
                onClick={() => window.history.back()}
                className="btn btn-secondary px-6 py-2"
              >
                返回上页
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Error Alert Component
interface ErrorAlertProps {
  message: string
  onRetry?: () => void
  onDismiss?: () => void
}

export function ErrorAlert({ message, onRetry, onDismiss }: ErrorAlertProps) {
  return (
    <div className="bg-error/10 border border-error/30 rounded-sm p-4">
      <div className="flex items-start gap-3">
        <span className="text-error text-xl">⚠️</span>
        <div className="flex-1">
          <p className="text-error font-body text-sm">{message}</p>
        </div>
        <div className="flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm text-error hover:text-red-300 font-body"
            >
              重试
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-sm text-fog hover:text-mist font-body"
            >
              关闭
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Async Error Handler Hook
export function useAsyncError() {
  const [, setError] = React.useState<Error | null>(null)
  
  return React.useCallback((error: Error) => {
    setError(() => {
      throw error
    })
  }, [])
}
