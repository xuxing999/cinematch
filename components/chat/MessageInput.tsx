'use client'

import { useState, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    const trimmed = content.trim()
    if (!trimmed || sending) return

    setSending(true)
    setContent('')

    try {
      await onSend(trimmed)
    } catch (error) {
      console.error('發送訊息失敗:', error)
      setContent(trimmed)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = content.trim() && !disabled && !sending

  return (
    <div className="flex-shrink-0 border-t border-dark-50/50 bg-dark-200 px-4 py-3">
      <div className="flex items-end gap-3">
        {/* 輸入框 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="輸入訊息..."
          disabled={disabled || sending}
          rows={1}
          className={cn(
            'flex-1 px-4 py-3 bg-dark-300 border border-dark-50/60 rounded-lg',
            'text-foreground text-sm placeholder-stone-500',
            'focus:outline-none focus:border-neon-red/50 focus:ring-1 focus:ring-neon-red/20',
            'transition-all duration-200 resize-none',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          style={{ minHeight: '44px', maxHeight: '120px' }}
        />

        {/* 發送按鈕 — 44px 觸控區 */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            'min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all duration-200',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            canSend
              ? 'bg-neon-red text-white hover:bg-neon-red/90 active:scale-95'
              : 'bg-dark-100 text-stone-500'
          )}
        >
          <Send size={18} />
        </button>
      </div>

      <p className="text-[11px] text-stone-500 mt-2">
        訊息將在 24 小時後自動銷毀 · Enter 發送 · Shift+Enter 換行
      </p>
    </div>
  )
}
