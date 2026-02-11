import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'
import { User } from 'lucide-react'

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, size = 'md', fallback, ...props }, ref) => {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-12 h-12 text-sm',
      lg: 'w-16 h-16 text-base',
      xl: 'w-24 h-24 text-xl',
    }

    const iconSizes = {
      sm: 16,
      md: 20,
      lg: 24,
      xl: 32,
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-full overflow-hidden bg-dark-100 border-2 border-dark-50 flex items-center justify-center',
          sizes[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : fallback ? (
          <span className="font-semibold text-gray-300">
            {fallback.charAt(0).toUpperCase()}
          </span>
        ) : (
          <User size={iconSizes[size]} className="text-gray-500" />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

export default Avatar
