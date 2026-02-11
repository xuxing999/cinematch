'use client'

import { SignalTag, SIGNAL_TAGS } from '@/types/models'
import { cn } from '@/lib/utils/cn'

interface TagSelectorProps {
  selectedTag: SignalTag | null
  onSelectTag: (tag: SignalTag) => void
  size?: 'sm' | 'md' | 'lg'
}

export default function TagSelector({ selectedTag, onSelectTag, size = 'md' }: TagSelectorProps) {
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Object.values(SIGNAL_TAGS).map((tag) => {
        const isSelected = selectedTag === tag.value

        return (
          <button
            key={tag.value}
            type="button"
            onClick={() => onSelectTag(tag.value)}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-300',
              sizes[size],
              isSelected
                ? 'bg-neon-red border-neon-red shadow-neon-red scale-105'
                : 'bg-dark-200 border-dark-100 hover:border-neon-red/50 hover:bg-dark-100'
            )}
          >
            <span className="text-3xl mb-1">{tag.emoji}</span>
            <span className={cn(
              'font-bold',
              isSelected ? 'text-white' : 'text-gray-300'
            )}>
              {tag.label}
            </span>
            <span className="text-xs text-gray-500 mt-1 text-center line-clamp-2">
              {tag.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}
