import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'red' | 'pink' | 'purple' | 'blue' | 'cyan'
  size?: 'sm' | 'md' | 'lg'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-dark-100 text-gray-300 border-dark-50',
      red: 'bg-neon-red/20 text-neon-red border-neon-red',
      pink: 'bg-neon-pink/20 text-neon-pink border-neon-pink',
      purple: 'bg-neon-purple/20 text-neon-purple border-neon-purple',
      blue: 'bg-neon-blue/20 text-neon-blue border-neon-blue',
      cyan: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan',
    }

    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-full border',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export default Badge
