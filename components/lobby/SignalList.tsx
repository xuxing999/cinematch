'use client'

import { SignalWithProfile } from '@/types/models'
import SignalCard from './SignalCard'
import { Inbox } from 'lucide-react'

interface SignalListProps {
  signals: SignalWithProfile[]
  currentUserId?: string | null
  onContact: (signal: SignalWithProfile) => void
  onDelete: (signalId: string) => void
  loading?: boolean
}

export default function SignalList({
  signals,
  currentUserId,
  onContact,
  onDelete,
  loading,
}: SignalListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 bg-dark-200 rounded-xl animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (signals.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-100 flex items-center justify-center">
          <Inbox size={40} className="text-gray-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-400 mb-2">
          目前沒有訊號
        </h3>
        <p className="text-gray-500">
          成為第一個發布訊號的人吧！
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {signals.map((signal) => (
        <SignalCard
          key={signal.id}
          signal={signal}
          isOwner={currentUserId === signal.user_id}
          onContact={onContact}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
