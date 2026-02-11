'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { useSignals } from '@/lib/hooks/useSignals'
import { SignalTag, SIGNAL_TAGS, SignalWithProfile } from '@/types/models'
import SignalList from '@/components/lobby/SignalList'
import SignalForm from '@/components/lobby/SignalForm'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Radio, Plus, Filter, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export default function LobbyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthContext()

  const movieIdParam = searchParams.get('movie_id')
  const movieId = movieIdParam ? parseInt(movieIdParam) : undefined

  const [selectedTag, setSelectedTag] = useState<SignalTag | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { signals, loading, fetchSignals, createSignal, deleteSignal } = useSignals({
    movieId,
    tag: selectedTag || undefined,
    autoRefresh: true,
  })

  // 統計各標籤的訊號數量
  const tagStats = signals.reduce((acc, signal) => {
    acc[signal.tag] = (acc[signal.tag] || 0) + 1
    return acc
  }, {} as Record<SignalTag, number>)

  const handleCreateSignal = async (formData: any) => {
    if (!formData.movie || !formData.tag) return

    setIsSubmitting(true)

    console.log('🚀 開始發布訊號:', formData)

    const { data, error } = await createSignal({
      movie_id: formData.movie.id,
      movie_title: formData.movie.title,
      movie_poster: formData.movie.poster_path,
      tag: formData.tag,
      theater_name: formData.theaterName || undefined,
      showtime: formData.showtime || undefined,
      note: formData.note || undefined,
    })

    setIsSubmitting(false)

    if (error) {
      console.error('❌ 發布失敗:', error)
      alert('發布訊號失敗：' + error.message)
    } else {
      console.log('✅ 發布成功:', data)
      alert('✅ 發布成功！訊號 ID: ' + data.id)
      setIsFormModalOpen(false)
    }
  }

  const handleContactUser = (signal: SignalWithProfile) => {
    // 導向聊天頁面
    router.push(`/chat/${signal.user_id}`)
  }

  const handleDeleteSignal = async (signalId: string) => {
    if (!confirm('確定要刪除這個訊號嗎？')) return

    await deleteSignal(signalId)
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-neon-purple/20 flex items-center justify-center animate-pulse-slow">
                <Radio size={28} className="text-neon-purple" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-neon-glow">訊號大廳</h1>
                <p className="text-gray-400 mt-1">尋找志同道合的影伴</p>
                {/* 調試用：顯示用戶狀態 */}
                {user && (
                  <p className="text-xs text-gray-600 mt-1">
                    用戶 ID: {user.id.substring(0, 8)}...
                  </p>
                )}
              </div>
            </div>

            {/* 刷新按鈕 */}
            <button
              onClick={fetchSignals}
              className="p-3 rounded-lg hover:bg-dark-100 transition-colors"
              title="刷新訊號"
            >
              <RefreshCw size={20} className="text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse"></div>
              <span className="text-gray-400">
                共 <span className="text-white font-bold">{signals.length}</span> 個訊號
              </span>
            </div>

            {/* 電影篩選提示 */}
            {movieId && (
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-dark-100"></div>
                <span className="text-yellow-500 text-sm">
                  ⚠️ 正在篩選特定電影的訊號
                </span>
                <button
                  onClick={() => router.push('/lobby')}
                  className="text-neon-red text-sm underline hover:text-neon-pink"
                >
                  查看所有訊號
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 篩選標籤 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-400">篩選標籤</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={cn(
                'px-4 py-2 rounded-full border-2 transition-all duration-300',
                selectedTag === null
                  ? 'bg-neon-red border-neon-red text-white shadow-neon-red'
                  : 'bg-dark-200 border-dark-100 text-gray-400 hover:border-neon-red/50'
              )}
            >
              全部 ({signals.length})
            </button>

            {Object.values(SIGNAL_TAGS).map((tag) => (
              <button
                key={tag.value}
                onClick={() => setSelectedTag(tag.value)}
                className={cn(
                  'px-4 py-2 rounded-full border-2 transition-all duration-300 flex items-center gap-2',
                  selectedTag === tag.value
                    ? 'bg-neon-red border-neon-red text-white shadow-neon-red'
                    : 'bg-dark-200 border-dark-100 text-gray-400 hover:border-neon-red/50'
                )}
              >
                <span>{tag.emoji}</span>
                <span>{tag.label}</span>
                <Badge variant="default" size="sm">
                  {tagStats[tag.value] || 0}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* 訊號列表 */}
        <SignalList
          signals={signals}
          currentUserId={user?.id}
          onContact={handleContactUser}
          onDelete={handleDeleteSignal}
          loading={loading}
        />

        {/* 發布訊號浮動按鈕 */}
        <button
          onClick={() => setIsFormModalOpen(true)}
          className="fixed bottom-24 md:bottom-8 right-8 w-16 h-16 bg-neon-red rounded-full shadow-neon-red hover:scale-110 transition-transform flex items-center justify-center z-30"
          title="發布訊號"
        >
          <Plus size={32} className="text-white" />
        </button>

        {/* 發布訊號 Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          title="發布新訊號"
          size="lg"
        >
          <SignalForm
            onSubmit={handleCreateSignal}
            loading={isSubmitting}
          />
        </Modal>
      </div>
    </div>
  )
}
