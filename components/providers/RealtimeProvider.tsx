// @ts-nocheck
'use client'

/**
 * RealtimeProvider — 全域即時訊息狀態管理
 *
 * 職責：
 * 1. 整個 app 只建立「一個」 messages 表的 Realtime 訂閱
 * 2. 維護全域 unreadCount（氣泡通知數字）
 * 3. Realtime 失敗時自動切換到 Polling 備援（每 10 秒）
 * 4. Realtime 恢復後自動停止 Polling
 *
 * 使用方式：
 *   const { unreadCount, refetchUnreadCount, connectionStatus } = useRealtimeContext()
 */

import { logger } from '@/lib/utils/logger'
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { useAuthContext } from '@/components/providers/AuthProvider'
import {
  useSupabaseRealtime,
  type RealtimeStatus,
} from '@/lib/hooks/useSupabaseRealtime'

// ─── 訊息原始資料型別（來自 Supabase Realtime payload.new） ──
export interface IncomingMessage {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

// ─── Context 型別 ─────────────────────────────────────────
interface RealtimeContextType {
  /** 總未讀訊息數（用於導航列氣泡） */
  unreadCount: number
  /** 重新從 API 取得最新未讀數 */
  refetchUnreadCount: () => Promise<void>
  /** 將未讀數歸零（例如進入聊天室後呼叫） */
  resetUnreadCount: () => void
  /**
   * 最新一筆「發給我」的訊息（未讀 INSERT 事件）
   * 聊天室組件監聽這個值，即可即時顯示新訊息，
   * 不需要另外建立第二個 Realtime channel。
   */
  latestIncomingMessage: IncomingMessage | null
  /** Realtime 連線狀態 */
  connectionStatus: RealtimeStatus
  /** 是否正在使用 Polling 備援模式 */
  isPolling: boolean
  /** 手動觸發 Realtime 重連 */
  reconnect: () => void
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

// ─── 常數 ─────────────────────────────────────────────────
const POLL_INTERVAL_MS = 10_000 // 10 秒

// ─── Provider 組件 ────────────────────────────────────────
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext()
  const userId = user?.id

  const [unreadCount, setUnreadCount] = useState(0)
  const [isPolling, setIsPolling] = useState(false)
  // 最新收到的訊息（發給我的），讓聊天室組件可以直接訂閱
  const [latestIncomingMessage, setLatestIncomingMessage] = useState<IncomingMessage | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // ─── 從 API 重新取得未讀數 ─────────────────────────────
  const refetchUnreadCount = useCallback(async () => {
    if (!userId) return
    try {
      const response = await fetch('/api/messages?type=conversations')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      const total: number = (data.conversations ?? []).reduce(
        (sum: number, conv: any) => sum + (conv.unreadCount ?? 0),
        0
      )
      if (isMountedRef.current) {
        setUnreadCount(total)
        logger.log(`[RealtimeProvider] 未讀數更新: ${total}`)
      }
    } catch (err) {
      logger.error('[RealtimeProvider] 獲取未讀數失敗', err)
    }
  }, [userId])

  // ─── 初次載入時取得未讀數 ──────────────────────────────
  useEffect(() => {
    if (userId) {
      refetchUnreadCount()
    } else {
      setUnreadCount(0)
    }
  }, [userId, refetchUnreadCount])

  // ─── Realtime 事件處理 ──────────────────────────────────
  // 注意：訂閱已加 server-side filter (receiver_id=eq.userId)，
  //       且 event='INSERT'，所以收到的 payload 必定是「發給我的新訊息」。
  //       這裡僅需處理 INSERT，不必再做 receiver_id 客戶端二次過濾。
  const handleRealtimeEvent = useCallback(
    (payload: any) => {
      if (!userId) return
      if (payload.eventType !== 'INSERT') return

      const msg = payload.new
      if (!msg?.id) return

      logger.log(`[RealtimeProvider] 收到新訊息 id=${msg.id}，sender=${msg.sender_id}`)

      // 1. 未讀數 +1
      setUnreadCount((prev) => prev + 1)

      // 2. 通知聊天室組件（ChatRoom 監聽此值即時顯示訊息）
      setLatestIncomingMessage(msg as IncomingMessage)
    },
    [userId]
  )

  // ─── 建立全域 Realtime 訂閱（整個 app 只有一個） ───────
  // 重要：傳入 server-side filter `receiver_id=eq.${userId}`
  // 原因：若沒有 filter，Supabase 依賴 RLS (auth.uid()) 過濾，
  //       但 iOS Safari 的 WebSocket 無法正確攜帶 JWT，導致
  //       auth.uid() = null → RLS 遮住整個 payload.new → iOS 收不到通知。
  // 加上 filter 後，Supabase 直接在資料庫層過濾，不依賴 JWT in WebSocket。
  const { status: realtimeStatus, reconnect } = useSupabaseRealtime({
    channelName: userId ? `global-messages-${userId}` : 'global-messages-idle',
    table: 'messages',
    event: 'INSERT',
    schema: 'public',
    filter: userId ? `receiver_id=eq.${userId}` : undefined,
    onEvent: handleRealtimeEvent,
    enabled: !!userId,
  })

  // ─── Polling 備援：Realtime 失敗時自動啟動 ────────────────
  // CLOSED：已達最大重連次數，改用 Polling
  // ERROR：重連等待期間（最長 93 秒）也用 Polling 填補，避免通知空窗
  const shouldPoll = (realtimeStatus === 'CLOSED' || realtimeStatus === 'ERROR') && !!userId

  useEffect(() => {
    if (!shouldPoll) return

    logger.log('[RealtimeProvider] Realtime 已停止，啟動 Polling 備援 (每 10 秒)')
    setIsPolling(true)

    // 立即執行一次
    refetchUnreadCount()

    const timer = setInterval(() => {
      logger.log('[RealtimeProvider] Polling 執行中...')
      refetchUnreadCount()
    }, POLL_INTERVAL_MS)

    return () => {
      logger.log('[RealtimeProvider] 停止 Polling 備援')
      setIsPolling(false)
      clearInterval(timer)
    }
  }, [shouldPoll, refetchUnreadCount])

  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0)
  }, [])

  return (
    <RealtimeContext.Provider
      value={{
        unreadCount,
        refetchUnreadCount,
        resetUnreadCount,
        latestIncomingMessage,
        connectionStatus: realtimeStatus,
        isPolling,
        reconnect,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  )
}

// ─── Consumer Hook ────────────────────────────────────────
export function useRealtimeContext(): RealtimeContextType {
  const ctx = useContext(RealtimeContext)
  if (!ctx) {
    throw new Error('useRealtimeContext must be used within <RealtimeProvider>')
  }
  return ctx
}
