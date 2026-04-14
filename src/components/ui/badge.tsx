import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        {
          'border-transparent bg-indigo-600 text-white hover:bg-indigo-700': variant === 'default',
          'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
          'border-transparent bg-red-500 text-white hover:bg-red-600': variant === 'destructive',
          'text-gray-700': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }