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
        console.log(`[RealtimeProvider] 未讀數更新: ${total}`)
      }
    } catch (err) {
      console.error('[RealtimeProvider] 獲取未讀數失敗', err)
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

  // ─── Realtime 事件處理（客戶端過濾） ──────────────────
  const handleRealtimeEvent = useCallback(
    (payload: any) => {
      if (!userId) return

      const eventType: string = payload.eventType
      console.log(`[RealtimeProvider] Realtime 事件: ${eventType}`, payload.new ?? payload.old)

      if (eventType === 'INSERT') {
        // 新訊息：若接收者是我
        if (payload.new?.receiver_id === userId) {
          // 1. 未讀數 +1
          setUnreadCount((prev) => {
            console.log(`[RealtimeProvider] 新訊息 → 未讀數 ${prev} → ${prev + 1}`)
            return prev + 1
          })
          // 2. 更新 latestIncomingMessage，讓聊天室直接從 Context 拿到新訊息
          setLatestIncomingMessage(payload.new as IncomingMessage)
          console.log(`[RealtimeProvider] latestIncomingMessage 更新 id=${payload.new.id}`)
        }
      } else if (eventType === 'UPDATE') {
        // 訊息被更新（例如標記已讀）：重新抓取準確數字
        if (payload.new?.receiver_id === userId) {
          console.log('[RealtimeProvider] 訊息已讀更新 → refetch')
          refetchUnreadCount()
        }
      }
    },
    [userId, refetchUnreadCount]
  )

  // ─── 建立全域 Realtime 訂閱（整個 app 只有一個） ───────
  const { status: realtimeStatus, reconnect } = useSupabaseRealtime({
    channelName: userId ? `global-messages-${userId}` : 'global-messages-idle',
    table: 'messages',
    event: '*',
    schema: 'public',
    onEvent: handleRealtimeEvent,
    enabled: !!userId,
  })

  // ─── Polling 備援：Realtime 完全失敗時自動啟動 ─────────
  const shouldPoll = realtimeStatus === 'CLOSED' && !!userId

  useEffect(() => {
    if (!shouldPoll) return

    console.log('[RealtimeProvider] Realtime 已停止，啟動 Polling 備援 (每 10 秒)')
    setIsPolling(true)

    // 立即執行一次
    refetchUnreadCount()

    const timer = setInterval(() => {
      console.log('[RealtimeProvider] Polling 執行中...')
      refetchUnreadCount()
    }, POLL_INTERVAL_MS)

    return () => {
      console.log('[RealtimeProvider] 停止 Polling 備援')
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
