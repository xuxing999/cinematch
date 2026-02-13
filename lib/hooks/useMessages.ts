// @ts-nocheck
'use client'

import { logger } from '@/lib/utils/logger'
import { useEffect, useState, useCallback } from 'react'
import { MessageWithSender } from '@/types/models'

interface UseMessagesOptions {
  otherUserId?: string
  autoRefresh?: boolean
}

export function useMessages(options: UseMessagesOptions = {}) {
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.otherUserId) {
        params.append('other_user_id', options.otherUserId)
      }

      const url = `/api/messages?${params.toString()}`
      logger.log('📨 useMessages: 獲取訊息', { url, otherUserId: options.otherUserId })

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      logger.log('📬 useMessages: 收到訊息', { count: data.length })
      setMessages(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      logger.error('❌ useMessages: 錯誤', err)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    try {
      logger.log('📤 useMessages: 發送訊息', { receiverId, contentLength: content.length })

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: receiverId,
          content,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const newMessage = await response.json()
      logger.log('✅ useMessages: 訊息發送成功', newMessage.id)

      // 立即添加到本地狀態（不等待重新獲取）
      setMessages((prev) => [...prev, newMessage])

      return { data: newMessage, error: null }
    } catch (err) {
      logger.error('❌ useMessages: 發送失敗', err)
      return { data: null, error: err instanceof Error ? err : new Error('Unknown error') }
    }
  }, [])

  const markAsRead = useCallback(async (otherUserId: string) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          other_user_id: otherUserId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark messages as read')
      }

      // 更新本地狀態
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender_id === otherUserId ? { ...msg, is_read: true } : msg
        )
      )

      return { error: null }
    } catch (err) {
      logger.error('Error marking messages as read:', err)
      return { error: err instanceof Error ? err : new Error('Unknown error') }
    }
  }, [])

  // 添加新訊息到列表（用於 Realtime）
  const addMessage = useCallback((message: MessageWithSender) => {
    logger.log('➕ useMessages: addMessage 被呼叫', message.id)
    setMessages((prev) => {
      // 檢查訊息是否已存在（避免重複）
      if (prev.some((m) => m.id === message.id)) {
        logger.log('⚠️ useMessages: 訊息已存在，跳過', message.id)
        return prev
      }
      logger.log('✅ useMessages: 訊息已加入列表', message.id)
      return [...prev, message]
    })
  }, [])

  useEffect(() => {
    fetchMessages()
    // Note: 已移除 10 秒自動刷新，改用 Realtime 即時更新
  }, [options.otherUserId])

  return {
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
    markAsRead,
    addMessage,
  }
}
