'use client'

import { logger } from '@/lib/utils/logger'
import { useEffect, useCallback, useState } from 'react'
import { useMessages } from '@/lib/hooks/useMessages'
import { Profile } from '@/types/models'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import SafetyBanner from './SafetyBanner'
import Avatar from '@/components/ui/Avatar'
import ReportModal from '@/components/ui/ReportModal'
import { ArrowLeft, Clock, Flag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRealtimeContext } from '@/components/providers/RealtimeProvider'

interface ChatRoomProps {
  currentUserId: string | undefined
  otherUser: Profile
}

export default function ChatRoom({ currentUserId, otherUser }: ChatRoomProps) {
  const router = useRouter()
  const [showReport, setShowReport] = useState(false)
  const {
    messages,
    loading,
    sendMessage,
    markAsRead,
    addMessage,
  } = useMessages({
    otherUserId: otherUser.id,
  })

  /**
   * 從全域 RealtimeProvider 取得最新收到的訊息。
   *
   * 原理：RealtimeProvider 已有一個全域 channel 訂閱 messages 表，
   * 每當收到「發給我」的 INSERT 事件，就更新 latestIncomingMessage。
   * 聊天室直接訂閱這個 Context 值，不需要再建立第二個 channel。
   */
  const { latestIncomingMessage, refetchUnreadCount } = useRealtimeContext()

  // 監聽全域新訊息 → 若是對方發給我的，加入聊天室畫面
  useEffect(() => {
    if (!latestIncomingMessage) return
    if (!currentUserId) return

    // 過濾：只處理「對方（otherUser）發給我（currentUserId）」的訊息
    if (latestIncomingMessage.sender_id !== otherUser.id) return
    if (latestIncomingMessage.receiver_id !== currentUserId) return

    logger.log('[ChatRoom] 收到新訊息，加入聊天視窗', latestIncomingMessage.id)

    /**
     * 用 otherUser prop（我們已經有完整 Profile）直接組出 MessageWithSender，
     * 省去再打一次 Supabase query 取 sender profile 的步驟，
     * 避免「二次查詢失敗 → 訊息靜默消失」的問題。
     */
    addMessage({
      id: latestIncomingMessage.id,
      sender_id: latestIncomingMessage.sender_id,
      receiver_id: latestIncomingMessage.receiver_id,
      content: latestIncomingMessage.content,
      is_read: latestIncomingMessage.is_read,
      created_at: latestIncomingMessage.created_at,
      sender: otherUser,  // 直接使用已知的 Profile，不需要重新查詢
    })

    // 自動標記為已讀，並更新全域未讀數
    markAsRead(otherUser.id).then(() => {
      refetchUnreadCount()
    })
  }, [latestIncomingMessage]) // eslint-disable-line react-hooks/exhaustive-deps
  // 注意：intentionally 只依賴 latestIncomingMessage，
  // 其他值（currentUserId, otherUser.id...）在對話存在期間不會改變。

  // 進入聊天室時標記所有訊息為已讀，並重置全域氣泡數
  useEffect(() => {
    if (!loading && messages.length > 0) {
      markAsRead(otherUser.id).then(() => {
        refetchUnreadCount()
      })
    }
  }, [loading, otherUser.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendMessage = useCallback(async (content: string) => {
    const { error } = await sendMessage(otherUser.id, content)
    if (error) {
      alert('發送失敗：' + error.message)
    }
  }, [sendMessage, otherUser.id])

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem-4rem)] md:h-[calc(100dvh-4rem)]">
      {/* Header */}
      <div className="border-b border-dark-100 bg-dark-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 返回按鈕 */}
            <button
              type="button"
              onClick={() => router.push('/chat')}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-dark-100 rounded-lg transition-colors md:hidden"
            >
              <ArrowLeft size={20} className="text-gray-400" />
            </button>

            {/* 對方資訊 */}
            <Avatar
              src={otherUser.avatar_url}
              alt={otherUser.display_name}
              size="md"
              fallback={otherUser.display_name}
            />
            <div>
              <h2 className="text-lg font-bold text-white">
                {otherUser.display_name}
              </h2>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={12} />
                24 小時快閃對話
              </p>
            </div>
          </div>

          {/* 檢舉此用戶 */}
          <button
            onClick={() => setShowReport(true)}
            title="檢舉此用戶"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-dark-100 transition-colors text-stone-600 hover:text-stone-400"
          >
            <Flag size={15} />
          </button>
        </div>
      </div>

      {/* 安全警語橫幅 */}
      <SafetyBanner />

      {/* 訊息列表 */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        loading={loading}
      />

      {/* 訊息輸入 */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={!currentUserId}
      />

      {/* 檢舉 Modal */}
      <ReportModal
        target={showReport ? {
          type: 'user',
          targetId: otherUser.id,
          displayName: otherUser.display_name,
        } : null}
        onClose={() => setShowReport(false)}
      />
    </div>
  )
}
