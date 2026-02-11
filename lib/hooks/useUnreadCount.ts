// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * 獲取當前用戶的總未讀訊息數量
 * 並透過 Realtime 即時更新
 */
export function useUnreadCount(userId: string | undefined) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0)
      setLoading(false)
      return
    }

    const supabase = createClient()

    // 定義獲取未讀數的函數（直接在 useEffect 內）
    const fetchUnreadCount = async () => {
      console.log('📊 useUnreadCount: 獲取未讀數', userId.substring(0, 8))

      try {
        const response = await fetch('/api/messages?type=conversations')

        if (!response.ok) {
          throw new Error('獲取對話列表失敗')
        }

        const data = await response.json()
        const total = data.conversations.reduce(
          (sum: number, conv: any) => sum + conv.unreadCount,
          0
        )

        console.log('✅ useUnreadCount: 總未讀數', total)
        setUnreadCount(total)
      } catch (error) {
        console.error('❌ useUnreadCount: 錯誤', error)
        setUnreadCount(0)
      } finally {
        setLoading(false)
      }
    }

    // 初次獲取未讀數
    fetchUnreadCount()

    // 訂閱新訊息（使用 event: '*' 統一監聽所有事件，避免 binding mismatch 錯誤）
    console.log('🔌 useUnreadCount: 建立 Realtime 連線', userId.substring(0, 8))

    const channel = supabase
      .channel(`unread-count-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',  // 統一監聽所有事件（INSERT, UPDATE, DELETE）
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const eventType = payload.eventType
          const record = payload.new || payload.old

          console.log(`📨 useUnreadCount: 收到 ${eventType} 事件`, record)

          // 客戶端過濾：只處理與我相關的訊息
          if (eventType === 'INSERT') {
            // 新訊息：如果是發給我的，未讀數 +1
            if (payload.new.receiver_id !== userId) {
              console.log('⚠️ useUnreadCount: 訊息不是發給我的，忽略')
              return
            }
            console.log('✅ useUnreadCount: 這是發給我的新訊息，未讀數 +1')
            setUnreadCount((prev) => {
              const newCount = prev + 1
              console.log('🔢 useUnreadCount: 未讀數更新', prev, '->', newCount)
              return newCount
            })
          } else if (eventType === 'UPDATE') {
            // 更新訊息：如果是我的訊息被更新（例如標記已讀），重新獲取未讀數
            if (payload.new.receiver_id !== userId) {
              console.log('⚠️ useUnreadCount: 更新的訊息不是發給我的，忽略')
              return
            }
            console.log('✅ useUnreadCount: 我的訊息被更新，重新獲取未讀數')
            fetchUnreadCount()
          }
        }
      )
      .subscribe((status, err) => {
        console.log('🔌 useUnreadCount: 訂閱狀態', status, err)

        if (status === 'SUBSCRIBED') {
          console.log('✅ useUnreadCount: 訂閱成功！')
        }

        if (status === 'CHANNEL_ERROR') {
          console.error('❌ useUnreadCount: 訂閱失敗', err)
        }
      })

    return () => {
      console.log('🔌 useUnreadCount: 取消訂閱')
      supabase.removeChannel(channel)
    }
  }, [userId]) // 只依賴 userId

  return { unreadCount, loading }
}
