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
    setContent('') // 立即清空輸入框，提升體驗

    try {
      await onSend(trimmed)
    } catch (error) {
      console.error('發送訊息失敗:', error)
      setContent(trimmed) // 失敗時恢復內容
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift + Enter = 換行
    // Enter = 發送
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-dark-100 bg-dark-200 p-4">
      <div className="flex items-end gap-3">
        {/* 輸入框 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="輸入訊息... (Enter 發送，Shift+Enter 換行)"
          disabled={disabled || sending}
          rows={1}
          className={cn(
            'flex-1 px-4 py-3 bg-dark-300 border border-dark-100 rounded-lg text-white placeholder-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-neon-red focus:border-transparent',
            'transition-all duration-300 resize-none max-h-32',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          style={{
            minHeight: '48px',
            maxHeight: '128px',
          }}
        />

        {/* 發送按鈕 */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim() || disabled || sending}
          className={cn(
            'p-3 rounded-lg transition-all duration-300',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            content.trim() && !disabled && !sending
              ? 'bg-neon-red text-white shadow-neon-red hover:scale-105'
              : 'bg-dark-100 text-gray-500'
          )}
        >
          <Send size={20} className={sending ? 'animate-pulse' : ''} />
        </button>
      </div>

      {/* 24 小時提示 */}
      <p className="text-xs text-gray-500 mt-2">
        💬 訊息將在 24 小時後自動銷毀
      </p>
    </div>
  )
}
