import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'neon' | 'glass'
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = true, children, ...props }, ref) => {
    const variants = {
      default: 'bg-dark-100 border border-dark-50/60',
      neon:    'card-neon',
      glass:   'glass',
    }

    // 復古 hover：只做邊框與陰影，不做 scale
    const hoverEffect = hover
      ? 'hover:border-neon-red/40 hover:shadow-card-hover cursor-pointer'
      : ''

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl p-4 transition-all duration-200',
          variants[variant],
          hoverEffect,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
