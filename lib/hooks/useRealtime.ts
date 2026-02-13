// @ts-nocheck
'use client'

/**
 * useRealtimeMessages — 聊天室用即時訊息 Hook
 *
 * 改用 useSupabaseRealtime 作為底層，統一管理：
 * - 自動重連
 * - 正確 cleanup
 * - 連線狀態回報
 *
 * 僅在聊天室（ChatRoom）使用，負責接收當前對話的新訊息。
 */

import { logger } from '@/lib/utils/logger'
import { useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSupabaseRealtime, type RealtimeStatus } from './useSupabaseRealtime'

interface UseRealtimeMessagesOptions {
  currentUserId: string | undefined
  otherUserId: string
  onNewMessage: (message: any) => void
}

interface UseRealtimeMessagesReturn {
  status: RealtimeStatus
  reconnect: () => void
}

export function useRealtimeMessages({
  currentUserId,
  otherUserId,
  onNewMessage,
}: UseRealtimeMessagesOptions): UseRealtimeMessagesReturn {
  // 用 ref 保存 callback，避免 callback 變化觸發重新訂閱
  const onNewMessageRef = useRef(onNewMessage)
  // 每次 render 更新（不加 deps）
  // eslint-disable-next-line react-hooks/exhaustive-deps
  onNewMessageRef.current = onNewMessage

  /**
   * Realtime 事件處理：
   * 1. 只處理 INSERT（新訊息）
   * 2. 客戶端過濾：接收者是我、發送者是對話對象
   * 3. 再從資料庫取完整資料（含 sender profile）
   */
  const handleEvent = useCallback(
    async (payload: any) => {
      if (payload.eventType !== 'INSERT') return
      if (!currentUserId || !otherUserId) return

      const msg = payload.new
      // 過濾：只處理「對方發給我」的訊息
      if (msg?.receiver_id !== currentUserId) return
      if (msg?.sender_id !== otherUserId) return

      logger.log(`[useRealtimeMessages] 收到新訊息 id=${msg.id}，取完整資料`)

      const supabase = createClient()
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(*)')
        .eq('id', msg.id)
        .single()

      if (error) {
        logger.error('[useRealtimeMessages] 取訊息詳情失敗', error)
        return
      }

      if (data) {
        onNewMessageRef.current(data)
      }
    },
    [currentUserId, otherUserId]
  )

  // 頻道名稱：每個對話獨立一個頻道
  const channelName =
    currentUserId && otherUserId
      ? `chat-${currentUserId}-${otherUserId}`
      : 'chat-idle'

  const { status, reconnect } = useSupabaseRealtime({
    channelName,
    table: 'messages',
    event: '*',
    schema: 'public',
    onEvent: handleEvent,
    enabled: !!currentUserId && !!otherUserId,
  })

  return { status, reconnect }
}
