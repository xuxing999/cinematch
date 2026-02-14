'use client'

import Image from 'next/image'
import { useState } from 'react'
import { SignalWithProfile, SIGNAL_TAGS } from '@/types/models'
import { getTMDBImageUrl } from '@/lib/tmdb/types'
import { formatRelativeTime, formatShowtime } from '@/lib/utils/date'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import ReportModal from '@/components/ui/ReportModal'
import { MapPin, Clock, MessageCircle, Trash2, Flag } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SignalCardProps {
  signal: SignalWithProfile
  isOwner?: boolean
  onContact?: (signal: SignalWithProfile) => void
  onDelete?: (signalId: string) => void
}

export default function SignalCard({ signal, isOwner, onContact, onDelete }: SignalCardProps) {
  const [showReport, setShowReport] = useState(false)

  const tagInfo = SIGNAL_TAGS[signal.tag]
  const posterUrl = getTMDBImageUrl(signal.movie_poster, 'poster', 'small')

  const badgeVariant = {
    has_ticket:      'pink'   as const,
    seek_companion:  'purple' as const,
    pure_watch:      'cyan'   as const,
    want_discuss:    'blue'   as const,
  }[signal.tag]

  return (
    <Card variant="neon" hover={false} className="overflow-hidden">
      <div className="flex gap-3">
        {/* 電影海報 */}
        <div className="relative w-16 h-24 flex-shrink-0 rounded-md overflow-hidden border border-dark-50/40">
          <Image
            src={posterUrl}
            alt={signal.movie_title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>

        {/* 訊號內容 */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-serif font-semibold text-foreground line-clamp-1">
                {signal.movie_title}
              </h3>
              <div className="mt-1">
                <Badge variant={badgeVariant} size="sm">
                  {tagInfo.emoji} {tagInfo.label}
                </Badge>
              </div>
            </div>

            {/* 刪除按鈕 */}
            {isOwner && onDelete && (
              <button
                onClick={() => onDelete(signal.id)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-neon-red/10 transition-colors flex-shrink-0"
                title="刪除訊號"
              >
                <Trash2 size={15} className="text-neon-red/70" />
              </button>
            )}
          </div>

          {/* 發布者 */}
          <div className="flex items-center gap-2 mb-2.5">
            <Avatar
              src={signal.profiles.avatar_url}
              alt={signal.profiles.display_name}
              size="sm"
              fallback={signal.profiles.display_name}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-stone-300 line-clamp-1">
                {signal.profiles.display_name}
              </p>
              <p className="text-[11px] text-stone-500">
                {formatRelativeTime(signal.created_at)}
              </p>
            </div>
          </div>

          {/* 詳細資訊 */}
          <div className="space-y-1 mb-3">
            {signal.theater_name && (
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <MapPin size={12} className="text-neon-cyan flex-shrink-0" />
                <span className="line-clamp-1">{signal.theater_name}</span>
              </div>
            )}
            {signal.showtime && (
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <Clock size={12} className="text-neon-purple flex-shrink-0" />
                <span>{formatShowtime(signal.showtime)}</span>
              </div>
            )}
            {signal.note && (
              <p className="text-xs text-stone-500 line-clamp-2 italic border-l-2 border-dark-50/60 pl-2">
                {signal.note}
              </p>
            )}
          </div>

          {/* 行動區 */}
          {!isOwner && onContact && (
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => onContact(signal)}
            >
              <MessageCircle size={14} className="mr-1.5" />
              聯絡 TA
            </Button>
          )}

          {isOwner && (
            <div className="px-3 py-2 bg-dark-200 border border-dark-50/40 rounded-lg text-center">
              <p className="text-[11px] text-stone-500 tracking-wide">這是您發布的訊號</p>
            </div>
          )}

          {/* 檢舉按鈕（僅對非自己的訊號顯示）*/}
          {!isOwner && (
            <button
              onClick={() => setShowReport(true)}
              className="flex items-center gap-1.5 text-[11px] text-stone-600 hover:text-stone-400 transition-colors mt-1"
              title="檢舉此訊號"
            >
              <Flag size={11} />
              <span>檢舉</span>
            </button>
          )}
        </div>
      </div>

      {/* 檢舉 Modal */}
      <ReportModal
        target={showReport ? {
          type: 'signal',
          targetId: signal.id,
          displayName: `${signal.profiles.display_name} 的訊號「${signal.movie_title}」`,
        } : null}
        onClose={() => setShowReport(false)}
      />
    </Card>
  )
}
