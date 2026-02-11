'use client'

import { useEffect, useRef } from 'react'
import { MessageWithSender } from '@/types/models'
import { formatRelativeTime } from '@/lib/utils/date'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/utils/cn'

interface MessageListProps {
  messages: MessageWithSender[]
  currentUserId: string | undefined
  loading?: boolean
}

export default function MessageList({ messages, currentUserId, loading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 自動滾動到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-neon-red border-t-transparent mx-auto"></div>
          <p className="text-gray-400">載入訊息中...</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-dark-100 flex items-center justify-center">
            <span className="text-4xl">💬</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              開始對話
            </h3>
            <p className="text-gray-500">
              發送第一則訊息，開始你們的快閃對話！
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
    >
      {messages.map((message, index) => {
        const isCurrentUser = message.sender_id === currentUserId
        const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id

        return (
          <div
            key={message.id}
            className={cn(
              'flex gap-3 animate-fade-in',
              isCurrentUser ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {/* 頭像 */}
            <div className="flex-shrink-0">
              {showAvatar ? (
                <Avatar
                  src={message.sender.avatar_url}
                  alt={message.sender.display_name}
                  size="sm"
                  fallback={message.sender.display_name}
                />
              ) : (
                <div className="w-8 h-8" /> // 佔位符，保持對齊
              )}
            </div>

            {/* 訊息氣泡 */}
            <div
              className={cn(
                'flex flex-col max-w-[70%]',
                isCurrentUser ? 'items-end' : 'items-start'
              )}
            >
              {/* 發送者名稱（僅對方訊息顯示） */}
              {!isCurrentUser && showAvatar && (
                <span className="text-xs text-gray-500 mb-1 px-2">
                  {message.sender.display_name}
                </span>
              )}

              {/* 訊息內容 */}
              <div
                className={cn(
                  'px-4 py-2 rounded-2xl break-words whitespace-pre-wrap',
                  isCurrentUser
                    ? 'bg-neon-red text-white rounded-tr-none'
                    : 'bg-dark-100 text-gray-100 rounded-tl-none'
                )}
              >
                {message.content}
              </div>

              {/* 時間戳記 */}
              <span className="text-xs text-gray-600 mt-1 px-2">
                {formatRelativeTime(message.created_at)}
                {isCurrentUser && message.is_read && ' · 已讀'}
              </span>
            </div>
          </div>
        )
      })}

      {/* 自動滾動錨點 */}
      <div ref={messagesEndRef} />
    </div>
  )
}
