'use client'

import { HTMLAttributes, forwardRef, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import { X } from 'lucide-react'

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, isOpen, onClose, title, size = 'md', children, ...props }, ref) => {
    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
    }

    // 處理 ESC 鍵關閉
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    // 防止背景滾動
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }

      return () => {
        document.body.style.overflow = 'unset'
      }
    }, [isOpen])

    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
        {/* 背景遮罩 */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal 容器：手機底部滑出，桌面居中 */}
        <div
          ref={ref}
          className={cn(
            'relative w-full flex flex-col glass animate-slide-up',
            // 手機：底部 sheet，最高 90dvh
            'rounded-t-2xl sm:rounded-2xl',
            'max-h-[90dvh] sm:max-h-[90vh]',
            sizes[size],
            className
          )}
          {...props}
        >
          {/* Header — 固定不捲動 */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-100 flex-shrink-0">
              <h2 className="text-xl font-serif font-bold text-foreground">{title}</h2>
              <button
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-dark-100 transition-colors"
                aria-label="關閉"
              >
                <X size={20} className="text-stone-400 hover:text-foreground" />
              </button>
            </div>
          )}

          {/* Body — 可獨立捲動，預留虛擬鍵盤空間 */}
          <div className="overflow-y-auto overscroll-contain p-6 pb-safe">
            {children}
          </div>
        </div>
      </div>
    )
  }
)

Modal.displayName = 'Modal'

export default Modal
