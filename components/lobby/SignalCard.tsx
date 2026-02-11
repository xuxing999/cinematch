'use client'

import Image from 'next/image'
import { SignalWithProfile, SIGNAL_TAGS } from '@/types/models'
import { getTMDBImageUrl } from '@/lib/tmdb/types'
import { formatRelativeTime, formatShowtime } from '@/lib/utils/date'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { MapPin, Clock, MessageCircle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SignalCardProps {
  signal: SignalWithProfile
  isOwner?: boolean
  onContact?: (signal: SignalWithProfile) => void
  onDelete?: (signalId: string) => void
}

export default function SignalCard({ signal, isOwner, onContact, onDelete }: SignalCardProps) {
  const tagInfo = SIGNAL_TAGS[signal.tag]
  const posterUrl = getTMDBImageUrl(signal.movie_poster, 'poster', 'small')

  // 根據標籤選擇顏色
  const badgeVariant = {
    has_ticket: 'pink' as const,
    seek_companion: 'purple' as const,
    pure_watch: 'cyan' as const,
    want_discuss: 'blue' as const,
  }[signal.tag]

  return (
    <Card variant="neon" className="overflow-hidden">
      <div className="flex gap-4">
        {/* 電影海報 */}
        <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={posterUrl}
            alt={signal.movie_title}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>

        {/* 訊號內容 */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white line-clamp-1">
                {signal.movie_title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={badgeVariant} size="sm">
                  {tagInfo.emoji} {tagInfo.label}
                </Badge>
              </div>
            </div>

            {/* 刪除按鈕（僅所有者可見） */}
            {isOwner && onDelete && (
              <button
                onClick={() => onDelete(signal.id)}
                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                title="刪除訊號"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            )}
          </div>

          {/* 發布者資訊 */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar
              src={signal.profiles.avatar_url}
              alt={signal.profiles.display_name}
              size="sm"
              fallback={signal.profiles.display_name}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-300 line-clamp-1">
                {signal.profiles.display_name}
              </p>
              <p className="text-xs text-gray-500">
                {formatRelativeTime(signal.created_at)}
              </p>
            </div>
          </div>

          {/* 詳細資訊 */}
          <div className="space-y-1.5 mb-3">
            {signal.theater_name && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin size={14} className="text-neon-cyan flex-shrink-0" />
                <span className="line-clamp-1">{signal.theater_name}</span>
              </div>
            )}

            {signal.showtime && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock size={14} className="text-neon-purple flex-shrink-0" />
                <span>{formatShowtime(signal.showtime)}</span>
              </div>
            )}

            {signal.note && (
              <p className="text-sm text-gray-400 line-clamp-2 italic">
                「{signal.note}」
              </p>
            )}
          </div>

          {/* 聯絡按鈕 */}
          {!isOwner && onContact && (
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => onContact(signal)}
            >
              <MessageCircle size={16} className="mr-2" />
              聯絡 TA
            </Button>
          )}

          {isOwner && (
            <div className="px-3 py-2 bg-dark-100 rounded-lg text-center">
              <p className="text-xs text-gray-500">這是您的訊號</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
