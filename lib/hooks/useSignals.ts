// @ts-nocheck
'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { SignalWithProfile, SignalTag } from '@/types/models'
import { useSupabaseRealtime } from '@/lib/hooks/useSupabaseRealtime'

interface UseSignalsOptions {
  movieId?: number
  tag?: SignalTag
  autoRefresh?: boolean
}

export function useSignals(options: UseSignalsOptions = {}) {
  const [signals, setSignals] = useState<SignalWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // ─── 靜默刷新（不顯示 loading spinner，用於 Realtime 觸發） ──
  // 使用 ref 記錄最新的 options，避免 stale closure
  const optionsRef = useRef(options)
  useEffect(() => {
    optionsRef.current = options
  })

  const silentRefetch = useCallback(async () => {
    try {
      const { movieId, tag } = optionsRef.current
      const params = new URLSearchParams()
      if (movieId) params.append('movie_id', movieId.toString())
      if (tag) params.append('tag', tag)
      const response = await fetch(`/api/signals?${params.toString()}`)
      if (!response.ok) return
      const data = await response.json()
      setSignals(data)
      console.log('[useSignals] Realtime 觸發靜默刷新，訊號數:', data.length)
    } catch (err) {
      console.error('[useSignals] 靜默刷新失敗', err)
    }
  }, [])

  // ─── Realtime 訂閱：signals 表有 INSERT/DELETE 就立即刷新 ────
  // signals 的 RLS SELECT 是公開的（不依賴 auth.uid()），
  // 所以 iOS Safari 的 JWT 問題不影響此訂閱。
  useSupabaseRealtime({
    channelName: 'signals-lobby-global',
    table: 'signals',
    event: '*',
    schema: 'public',
    onEvent: (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
        console.log(`[useSignals] 收到 ${payload.eventType} 事件，立即刷新大廳`)
        silentRefetch()
      }
    },
    enabled: true,
  })

  const fetchSignals = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.movieId) params.append('movie_id', options.movieId.toString())
      if (options.tag) params.append('tag', options.tag)

      const url = `/api/signals?${params.toString()}`
      console.log('📡 useSignals: 獲取訊號', { url, movieId: options.movieId, tag: options.tag })

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch signals')
      }

      const data = await response.json()
      console.log('📊 useSignals: 收到訊號', { count: data.length, signals: data })
      setSignals(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      console.error('❌ useSignals: 錯誤', err)
    } finally {
      setLoading(false)
    }
  }

  const createSignal = async (signalData: {
    movie_id: number
    movie_title: string
    movie_poster: string | null
    tag: SignalTag
    theater_name?: string
    showtime?: string
    note?: string
  }) => {
    try {
      const response = await fetch('/api/signals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signalData),
      })

      if (!response.ok) {
        throw new Error('Failed to create signal')
      }

      const newSignal = await response.json()
      console.log('✅ useSignals: 訊號建立成功', newSignal.id)

      // 重新獲取訊號列表
      console.log('🔄 useSignals: 重新獲取訊號列表...')
      await fetchSignals()

      return { data: newSignal, error: null }
    } catch (err) {
      console.error('Error creating signal:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Unknown error') }
    }
  }

  const deleteSignal = async (signalId: string) => {
    try {
      const response = await fetch(`/api/signals/${signalId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete signal')
      }

      // 從本地狀態中移除
      setSignals(signals.filter((s) => s.id !== signalId))

      return { error: null }
    } catch (err) {
      console.error('Error deleting signal:', err)
      return { error: err instanceof Error ? err : new Error('Unknown error') }
    }
  }

  useEffect(() => {
    fetchSignals()

    // 自動刷新（每 30 秒）
    if (options.autoRefresh) {
      const interval = setInterval(fetchSignals, 30000)
      return () => clearInterval(interval)
    }
  }, [options.movieId, options.tag])

  return {
    signals,
    loading,
    error,
    fetchSignals,
    createSignal,
    deleteSignal,
  }
}
