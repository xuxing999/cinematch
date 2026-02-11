// @ts-nocheck
'use client'

/**
 * useSupabaseRealtime — 標準化 Supabase Realtime 訂閱 Hook
 *
 * 功能：
 * - 統一管理 channel 生命週期（建立 → SUBSCRIBED → 清理）
 * - 自動重連：指數退避，最多 MAX_RETRIES 次
 * - 達到最大重連次數後回報 CLOSED，讓上層切換到 Polling 備援
 * - 正確的 cleanup 邏輯（React StrictMode 安全）
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

// ─── 型別定義 ────────────────────────────────────────────────
export type RealtimeStatus =
  | 'IDLE'        // 尚未啟動（enabled = false）
  | 'CONNECTING'  // 正在建立連線
  | 'SUBSCRIBED'  // 已成功訂閱
  | 'CLOSED'      // 已斷線且不再重連
  | 'ERROR'       // 錯誤中，準備重連

export interface UseSupabaseRealtimeOptions {
  /** Channel 名稱，必須在整個 app 中唯一 */
  channelName: string
  /** 要監聽的資料表 */
  table: string
  /** 要監聽的事件，預設 '*'（所有事件） */
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE'
  /** Schema，預設 'public' */
  schema?: string
  /** Supabase 伺服器端 filter（例如 `receiver_id=eq.${userId}`） */
  filter?: string
  /** Realtime 事件回呼，使用 ref 包裝避免不必要的重訂閱 */
  onEvent: (payload: RealtimePostgresChangesPayload<Record<string, any>>) => void
  /** 是否啟用訂閱，預設 true */
  enabled?: boolean
}

export interface UseSupabaseRealtimeReturn {
  /** 目前連線狀態 */
  status: RealtimeStatus
  /** 手動觸發重連（重置重連次數） */
  reconnect: () => void
}

// ─── 常數 ──────────────────────────────────────────────────
const MAX_RETRIES = 5
const BASE_RETRY_DELAY_MS = 3_000 // 3 秒起始，指數退避

// ─── Hook ─────────────────────────────────────────────────
export function useSupabaseRealtime({
  channelName,
  table,
  event = '*',
  schema = 'public',
  filter,
  onEvent,
  enabled = true,
}: UseSupabaseRealtimeOptions): UseSupabaseRealtimeReturn {
  const [status, setStatus] = useState<RealtimeStatus>('IDLE')

  /**
   * subscribeKey：每次需要重新訂閱時遞增，驅動 useEffect 重跑
   * 使用 state 而非 ref，確保 React 感知變化並重跑 effect
   */
  const [subscribeKey, setSubscribeKey] = useState(0)

  // 追蹤重連次數（使用 ref 避免觸發 re-render）
  const retryCountRef = useRef(0)
  // 重連計時器
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 保持 callback 最新，避免 stale closure 問題
  const onEventRef = useRef(onEvent)

  // 每次 render 都更新 ref（不加 deps，總是保持最新）
  useEffect(() => {
    onEventRef.current = onEvent
  })

  /**
   * 公開的手動重連函式
   * 重置重連次數，並遞增 subscribeKey 觸發 effect 重跑
   */
  const reconnect = useCallback(() => {
    console.log(`[Realtime:${channelName}] 手動重連`)
    retryCountRef.current = 0
    setSubscribeKey((k) => k + 1)
  }, [channelName])

  // ─── iOS / Safari 自動重連 ────────────────────────────────
  // 問題：iOS Safari 在分頁切換或螢幕鎖定時，WebSocket 靜默死亡，
  //       但狀態仍顯示 SUBSCRIBED（殭屍 channel）。
  // 解法：監聽 visibilitychange（回到前景）和 online（網路恢復），
  //       強制重新訂閱，確保 iOS 回來後立即恢復 Realtime。
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log(`[Realtime:${channelName}] 頁面回到前景，觸發重連`)
        retryCountRef.current = 0
        setSubscribeKey((k) => k + 1)
      }
    }

    const handleOnline = () => {
      console.log(`[Realtime:${channelName}] 網路恢復，觸發重連`)
      retryCountRef.current = 0
      setSubscribeKey((k) => k + 1)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnline)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
    }
  }, [channelName, enabled])

  // ─── 核心訂閱 Effect ──────────────────────────────────────
  useEffect(() => {
    // 未啟用：保持 IDLE
    if (!enabled) {
      setStatus('IDLE')
      return
    }

    // isDestroyed：本次 effect 已清理，防止 async callback 污染下一個 effect
    let isDestroyed = false
    const supabase = createClient()

    // 清除上一個 effect 可能留下的重連計時器
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }

    setStatus('CONNECTING')
    console.log(`[Realtime:${channelName}] 建立連線 (table: ${table}, event: ${event})`)

    // 組裝 postgres_changes 設定
    const changeConfig: Record<string, string> = { event, schema, table }
    if (filter) changeConfig.filter = filter

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', changeConfig as any, (payload) => {
        // 確保 effect 未被清理
        if (!isDestroyed) {
          onEventRef.current(payload)
        }
      })
      .subscribe((subStatus, err) => {
        if (isDestroyed) return

        console.log(`[Realtime:${channelName}] 狀態: ${subStatus}`, err ?? '')

        if (subStatus === 'SUBSCRIBED') {
          setStatus('SUBSCRIBED')
          retryCountRef.current = 0 // 成功後重置重連次數

        } else if (subStatus === 'CHANNEL_ERROR' || subStatus === 'TIMED_OUT') {
          setStatus('ERROR')

          if (retryCountRef.current < MAX_RETRIES) {
            // 指數退避：3s, 6s, 12s, 24s, 48s
            const delay = BASE_RETRY_DELAY_MS * Math.pow(2, retryCountRef.current)
            retryCountRef.current++
            console.warn(
              `[Realtime:${channelName}] 自動重連 ${retryCountRef.current}/${MAX_RETRIES}，${delay}ms 後...`
            )
            retryTimerRef.current = setTimeout(() => {
              if (!isDestroyed) {
                // 遞增 subscribeKey 讓 effect 重跑
                setSubscribeKey((k) => k + 1)
              }
            }, delay)
          } else {
            // 超過最大重連次數 → CLOSED，由上層切換 Polling
            console.error(
              `[Realtime:${channelName}] 達最大重連次數 (${MAX_RETRIES})，停止重試`
            )
            setStatus('CLOSED')
          }

        } else if (subStatus === 'CLOSED') {
          // 非預期關閉（例如網路中斷後服務端主動關閉）
          if (!isDestroyed) {
            setStatus('CLOSED')
          }
        }
      })

    // ─── Cleanup ─────────────────────────────────────────
    return () => {
      isDestroyed = true
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current)
        retryTimerRef.current = null
      }
      console.log(`[Realtime:${channelName}] 清理 channel`)
      supabase.removeChannel(channel)
    }
    // subscribeKey 變化時重跑（手動重連 or 自動重連觸發）
  }, [channelName, table, event, schema, filter, enabled, subscribeKey]) // eslint-disable-line

  return { status, reconnect }
}
