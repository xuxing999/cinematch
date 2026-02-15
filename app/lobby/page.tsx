'use client'

import { logger } from '@/lib/utils/logger'
import { useState, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { useSignals } from '@/lib/hooks/useSignals'
import {
  SignalTag, SignalIntent,
  SIGNAL_TAGS, SIGNAL_INTENTS, TW_CITIES,
  SignalWithProfile,
} from '@/types/models'
import SignalList from '@/components/lobby/SignalList'
import SignalForm from '@/components/lobby/SignalForm'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import {
  Radio, Plus, Filter, RefreshCw,
  CheckCircle2, XCircle, MapPin, ChevronDown, X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { trackPostSignal, trackStartChat } from '@/lib/utils/gtag'

function LobbyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthContext()

  const movieIdParam = searchParams.get('movie_id')
  const movieId = movieIdParam ? parseInt(movieIdParam) : undefined

  const [selectedTag,      setSelectedTag]      = useState<SignalTag | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [selectedIntent,   setSelectedIntent]   = useState<SignalIntent | null>(null)

  const [isFormModalOpen,  setIsFormModalOpen]  = useState(false)
  const [isSubmitting,     setIsSubmitting]     = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const { signals, loading, fetchSignals, createSignal, deleteSignal } = useSignals({
    movieId,
    tag:      selectedTag      || undefined,
    location: selectedLocation || undefined,
    intent:   selectedIntent   || undefined,
    autoRefresh: true,
  })

  const tagStats = signals.reduce((acc, signal) => {
    acc[signal.tag] = (acc[signal.tag] || 0) + 1
    return acc
  }, {} as Record<SignalTag, number>)

  const hasActiveFilters =
    selectedTag !== null || selectedLocation !== '' || selectedIntent !== null

  const clearFilters = () => {
    setSelectedTag(null)
    setSelectedLocation('')
    setSelectedIntent(null)
  }

  const handleCreateSignal = async (formData: any) => {
    if (!formData.movie || !formData.tag) return

    setIsSubmitting(true)
    logger.log('🚀 開始發布訊號:', formData)

    const { data, error } = await createSignal({
      movie_id:         formData.movie.id,
      movie_title:      formData.movie.title,
      movie_poster:     formData.movie.poster_path,
      tag:              formData.tag,
      theater_name:     formData.theaterName    || undefined,
      showtime:         formData.showtime        || undefined,
      note:             formData.note            || undefined,
      location:         formData.location        || undefined,
      intent:           formData.intent          || undefined,
      gender_age_label: formData.genderAgeLabel  || undefined,
    })

    setIsSubmitting(false)

    if (error) {
      logger.error('❌ 發布失敗:', error)
      showToast('error', '發布訊號失敗，請稍後再試')
    } else {
      logger.log('✅ 發布成功:', data)
      trackPostSignal(formData.movie.title, formData.tag)
      showToast('success', '訊號已發布！靜待影伴回應 ✦')
      setIsFormModalOpen(false)
    }
  }

  const handleContactUser = (signal: SignalWithProfile) => {
    trackStartChat(signal.movie_title, signal.tag)
    router.push(`/chat/${signal.user_id}`)
  }

  const handleDeleteSignal = async (signalId: string) => {
    if (!confirm('確定要刪除這個訊號嗎？')) return
    await deleteSignal(signalId)
  }

  return (
    <div className="min-h-screen">
      {/* Toast Notifications */}
      {toast && (
        <div className={cn(
          'fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium transition-all animate-fade-in',
          toast.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-700/60 text-emerald-300'
            : 'bg-red-950/90 border-red-700/60 text-red-300'
        )}>
          {toast.type === 'success'
            ? <CheckCircle2 size={16} className="flex-shrink-0" />
            : <XCircle     size={16} className="flex-shrink-0" />
          }
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-md border border-neon-purple/40 bg-neon-purple/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Radio size={20} className="text-neon-purple" />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">
                  訊號大廳
                </h1>
                <p className="text-stone-400 text-sm mt-1">尋找志同道合的影伴</p>
                {user && (
                  <p className="text-[11px] text-stone-600 mt-0.5">已登入（匿名）</p>
                )}
              </div>
            </div>

            <button
              onClick={fetchSignals}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-dark-100 transition-colors flex-shrink-0"
              title="刷新訊號"
            >
              <RefreshCw size={18} className="text-stone-500 hover:text-foreground" />
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm mt-5 pl-1">
            <div className="flex items-center gap-2 text-stone-400">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-purple inline-block" />
              <span>
                共 <span className="text-foreground font-semibold">{signals.length}</span> 個訊號
              </span>
            </div>

            {movieId && (
              <>
                <span className="text-dark-50">·</span>
                <div className="flex items-center gap-2">
                  <span className="text-neon-pink text-xs">電影篩選中</span>
                  <button
                    onClick={() => router.push('/lobby')}
                    className="text-xs text-stone-400 underline underline-offset-2 hover:text-foreground transition-colors"
                  >
                    查看全部
                  </button>
                </div>
              </>
            )}

            {hasActiveFilters && (
              <>
                <span className="text-dark-50">·</span>
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-neon-red transition-colors"
                >
                  <X size={11} />
                  清除篩選
                </button>
              </>
            )}
          </div>
        </div>

        {/* ══ 篩選列 ══════════════════════════════════════════════ */}
        <div className="mb-6 space-y-4">

          {/* 意圖標籤篩選 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter size={13} className="text-stone-500" />
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                意圖篩選
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={cn(
                  'px-3 py-2 rounded-md border text-sm font-medium transition-all duration-200 min-h-[44px]',
                  selectedTag === null
                    ? 'bg-neon-red/15 border-neon-red/50 text-neon-red'
                    : 'bg-transparent border-dark-50/60 text-stone-400 hover:border-stone-500 hover:text-stone-300'
                )}
              >
                全部 ({signals.length})
              </button>

              {Object.values(SIGNAL_TAGS).map((tag) => (
                <button
                  key={tag.value}
                  onClick={() => setSelectedTag(tag.value)}
                  className={cn(
                    'px-3 py-2 rounded-md border text-sm font-medium transition-all duration-200 flex items-center gap-1.5 min-h-[44px]',
                    selectedTag === tag.value
                      ? 'bg-neon-red/15 border-neon-red/50 text-neon-red'
                      : 'bg-transparent border-dark-50/60 text-stone-400 hover:border-stone-500 hover:text-stone-300'
                  )}
                >
                  <span>{tag.emoji}</span>
                  <span>{tag.label}</span>
                  <Badge variant="default" size="sm" className="ml-0.5">
                    {tagStats[tag.value] || 0}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* 地區 & 社交安排篩選 */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <MapPin size={13} className="text-stone-500 flex-shrink-0" />
              <span className="text-xs text-stone-500">地區：</span>
            </div>

            {/* 縣市選單 */}
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className={cn(
                  'pl-3 pr-8 py-2 bg-dark-200 border rounded-md text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-neon-red/30 transition-all duration-200 min-h-[44px]',
                  selectedLocation
                    ? 'border-neon-red/50 text-foreground'
                    : 'border-dark-50/60 text-stone-400'
                )}
              >
                <option value="">所有地區</option>
                {TW_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none"
              />
            </div>

            {/* 社交安排標籤 */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-stone-500 flex-shrink-0">安排：</span>
              {Object.values(SIGNAL_INTENTS).map((item) => (
                <button
                  key={item.value}
                  onClick={() =>
                    setSelectedIntent(
                      selectedIntent === item.value ? null : item.value
                    )
                  }
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-md border text-sm transition-all duration-200 min-h-[44px]',
                    selectedIntent === item.value
                      ? 'bg-neon-cyan/15 border-neon-cyan/50 text-neon-cyan'
                      : 'bg-transparent border-dark-50/60 text-stone-400 hover:border-stone-500 hover:text-stone-300'
                  )}
                  title={item.description}
                >
                  <span>{item.emoji}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Signal List */}
        <SignalList
          signals={signals}
          currentUserId={user?.id}
          onContact={handleContactUser}
          onDelete={handleDeleteSignal}
          loading={loading}
        />

        {/* Post Signal FAB */}
        <button
          onClick={() => setIsFormModalOpen(true)}
          className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-neon-red rounded-full shadow-neon-red hover:bg-neon-red/90 transition-all duration-200 flex items-center justify-center z-30 active:scale-95"
          title="發布訊號"
        >
          <Plus size={26} className="text-white" />
        </button>

        {/* Signal Form Modal */}
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

export default function LobbyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-stone-500 text-sm">載入中...</div>
      </div>
    }>
      <LobbyContent />
    </Suspense>
  )
}
