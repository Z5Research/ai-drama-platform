'use client'

import React from 'react'

export type TransitionType = 'none' | 'dissolve' | 'fade' | 'slide'

interface TransitionPickerProps {
  value: TransitionType
  duration: number
  onChange: (type: TransitionType, duration: number) => void
}

/**
 * 转场效果选择器
 */
export const TransitionPicker: React.FC<TransitionPickerProps> = ({
  value,
  duration,
  onChange
}) => {
  const transitions: { type: TransitionType; label: string; icon: string }[] = [
    { type: 'none', label: '无转场', icon: '⏭️' },
    { type: 'dissolve', label: '溶解', icon: '✨' },
    { type: 'fade', label: '淡入淡出', icon: '🌙' },
    { type: 'slide', label: '滑动', icon: '➡️' }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 转场类型 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px'
      }}>
        {transitions.map(t => (
          <button
            key={t.type}
            onClick={() => onChange(t.type, duration)}
            style={{
              padding: '8px 12px',
              background: value === t.type ? 'var(--glass-accent-from, #4F46E5)' : 'var(--glass-bg-surface, #1e1e1e)',
              border: `1px solid ${value === t.type ? 'var(--glass-stroke-focus, #7C3AED)' : 'var(--glass-stroke-base, #333)'}`,
              borderRadius: '6px',
              color: value === t.type ? 'white' : 'var(--glass-text-primary, #fff)',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* 转场时长 */}
      {value !== 'none' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            fontSize: '12px',
            color: 'var(--glass-text-secondary, #999)'
          }}>
            时长
          </span>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={duration}
            onChange={(e) => onChange(value, parseInt(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{
            fontSize: '12px',
            color: 'var(--glass-text-tertiary, #666)'
          }}>
            {(duration / 30).toFixed(1)}s
          </span>
        </div>
      )}
    </div>
  )
}

export default TransitionPicker
