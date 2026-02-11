import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'red' | 'pink' | 'purple' | 'blue' | 'cyan'
  size?: 'sm' | 'md' | 'lg'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    // 復古低飽和色系：每個 variant 對應一種點綴色
    const variants = {
      default: 'bg-dark-100 text-stone-300 border-dark-50/80',
      red:     'bg-neon-red/15   text-neon-red   border-neon-red/40',   // 鐵鏽紅
      pink:    'bg-neon-pink/15  text-neon-pink  border-neon-pink/40',  // 古銅金
      purple:  'bg-neon-purple/15 text-neon-purple border-neon-purple/40', // 鼠尾草綠
      blue:    'bg-neon-blue/15  text-neon-blue  border-neon-blue/40',  // 深鼠尾草
      cyan:    'bg-neon-cyan/15  text-neon-cyan  border-neon-cyan/40',  // 暖棕褐
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
      lg: 'px-3 py-1.5 text-sm',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded border tracking-wide',
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
