'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Conversation } from '@/types/models'
import ConversationItem from './ConversationItem'
import { useSupabaseRealtime } from '@/lib/hooks/useSupabaseRealtime'

interface ConversationListProps {
  currentUserId: string
}

export default function ConversationList({ currentUserId }: ConversationListProps) {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const fetchConversations = useCallback(async () => {
    console.log('[ConversationList] 獲取對話列表')
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/messages?type=conversations')
      if (!response.ok) throw new Error('獲取對話列表失敗')
      const data = await response.json()
      console.log('[ConversationList] 取得對話', data.conversations.length, '筆')
      if (isMountedRef.current) {
        setConversations(data.conversations)
      }
    } catch (err) {
      console.error('[ConversationList] 錯誤', err)
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : '未知錯誤')
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  // 初次載入
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // ─── Realtime 事件處理 ────────────────────────────────
  const handleRealtimeEvent = useCallback(
    (payload: any) => {
      const eventType = payload.eventType
      const record = payload.new ?? payload.old
      if (!record) return

      // 客戶端過濾：只處理與我相關的訊息
      if (
        record.receiver_id !== currentUserId &&
        record.sender_id !== currentUserId
      ) {
        return
      }

      console.log(`[ConversationList] 收到 ${eventType} 事件，刷新對話列表`)
      fetchConversations()
    },
    [currentUserId, fetchConversations]
  )

  // ─── 使用標準化 Realtime Hook ─────────────────────────
  const { status: realtimeStatus } = useSupabaseRealtime({
    channelName: `conversation-list-${currentUserId}`,
    table: 'messages',
    event: '*',
    schema: 'public',
    onEvent: handleRealtimeEvent,
    enabled: !!currentUserId,
  })

  const handleConversationClick = (userId: string) => {
    router.push(`/chat/${userId}`)
  }

  // ─── 載入中 ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-neon-red border-t-transparent mx-auto"></div>
          <p className="text-gray-400">載入對話中...</p>
        </div>
      </div>
    )
  }

  // ─── 錯誤狀態 ─────────────────────────────────────────
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto rounded-full bg-dark-100 flex items-center justify-center mb-4">
          <span className="text-4xl">⚠️</span>
        </div>
        <h3 className="text-xl font-bold text-gray-400 mb-2">載入失敗</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchConversations}
          className="px-6 py-2 bg-neon-red text-white rounded-lg hover:scale-105 transition-all"
        >
          重試
        </button>
      </div>
    )
  }

  // ─── 空狀態 ───────────────────────────────────────────
  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto rounded-full bg-dark-100 flex items-center justify-center mb-4">
          <span className="text-4xl">💬</span>
        </div>
        <h3 className="text-xl font-bold text-gray-400 mb-2">還沒有對話</h3>
        <p className="text-gray-500 mb-6">去訊號大廳找人聊天吧！</p>
        <button
          onClick={() => router.push('/lobby')}
          className="px-6 py-2 bg-neon-red text-white rounded-lg hover:scale-105 transition-all shadow-neon-red"
        >
          前往訊號大廳
        </button>
      </div>
    )
  }

  // ─── 對話列表 ─────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Realtime 連線狀態提示（僅非 SUBSCRIBED 時顯示） */}
      {realtimeStatus !== 'SUBSCRIBED' && realtimeStatus !== 'CONNECTING' && realtimeStatus !== 'IDLE' && (
        <div className="text-xs text-yellow-500 text-center py-1 bg-yellow-500/10 rounded-lg">
          即時更新暫時中斷，將自動重連中...
        </div>
      )}

      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.profile.id}
          conversation={conversation}
          onClick={() => handleConversationClick(conversation.profile.id)}
        />
      ))}
    </div>
  )
}
