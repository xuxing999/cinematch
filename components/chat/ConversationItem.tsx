'use client'

import { Conversation } from '@/types/models'
import { formatRelativeTime } from '@/lib/utils/date'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { MessageCircle } from 'lucide-react'

interface ConversationItemProps {
  conversation: Conversation
  onClick: () => void
}

export default function ConversationItem({ conversation, onClick }: ConversationItemProps) {
  const { profile, lastMessage, unreadCount } = conversation

  return (
    <Card
      variant="default"
      hover={true}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {/* 頭像 */}
        <div className="relative">
          <Avatar
            src={profile.avatar_url}
            alt={profile.display_name}
            size="lg"
            fallback={profile.display_name}
          />
          {/* 在線狀態（未實作，預留） */}
          {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-200" /> */}
        </div>

        {/* 對話資訊 */}
        <div className="flex-1 min-w-0">
          {/* 名稱與時間 */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-white line-clamp-1">
              {profile.display_name}
            </h3>
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {formatRelativeTime(lastMessage.created_at)}
            </span>
          </div>

          {/* 最後一則訊息 */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400 line-clamp-1 flex-1">
              <MessageCircle size={14} className="inline mr-1" />
              {lastMessage.content}
            </p>

            {/* 未讀計數 */}
            {unreadCount > 0 && (
              <Badge variant="red" size="sm" className="ml-2 flex-shrink-0">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
