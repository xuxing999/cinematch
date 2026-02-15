// @ts-nocheck
'use client'

import { logger } from '@/lib/utils/logger'
import { useEffect, useState, useCallback, useRef } from 'react'
import { SignalWithProfile, SignalTag, SignalIntent } from '@/types/models'
import { useSupabaseRealtime } from '@/lib/hooks/useSupabaseRealtime'

interface UseSignalsOptions {
  movieId?: number
  tag?: SignalTag
  location?: string
  intent?: SignalIntent
  autoRefresh?: boolean
}

export function useSignals(options: UseSignalsOptions = {}) {
  const [signals, setSignals] = useState<SignalWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // ─── 靜默刷新（不顯示 loading spinner，用於 Realtime 觸發） ──
  const optionsRef = useRef(options)
  useEffect(() => {
    optionsRef.current = options
  })

  const silentRefetch = useCallback(async () => {
    try {
      const { movieId, tag, location, intent } = optionsRef.current
      const params = new URLSearchParams()
      if (movieId)  params.append('movie_id', movieId.toString())
      if (tag)      params.append('tag', tag)
      if (location) params.append('location', location)
      if (intent)   params.append('intent', intent)
      const response = await fetch(`/api/signals?${params.toString()}`)
      if (!response.ok) return
      const data = await response.json()
      setSignals(data)
      logger.log('[useSignals] Realtime 觸發靜默刷新，訊號數:', data.length)
    } catch (err) {
      logger.error('[useSignals] 靜默刷新失敗', err)
    }
  }, [])

  // ─── Realtime 訂閱：signals 表有 INSERT/DELETE 就立即刷新 ────
  useSupabaseRealtime({
    channelName: 'signals-lobby-global',
    table: 'signals',
    event: '*',
    schema: 'public',
    onEvent: (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
        logger.log(`[useSignals] 收到 ${payload.eventType} 事件，立即刷新大廳`)
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
      if (options.movieId)  params.append('movie_id', options.movieId.toString())
      if (options.tag)      params.append('tag', options.tag)
      if (options.location) params.append('location', options.location)
      if (options.intent)   params.append('intent', options.intent)

      const url = `/api/signals?${params.toString()}`
      logger.log('📡 useSignals: 獲取訊號', { url })

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch signals')
      }

      const data = await response.json()
      logger.log('📊 useSignals: 收到訊號', { count: data.length })
      setSignals(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      logger.error('❌ useSignals: 錯誤', err)
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
    location?: string
    intent?: SignalIntent
    gender_age_label?: string
  }) => {
    try {
      const response = await fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signalData),
      })

      if (!response.ok) {
        throw new Error('Failed to create signal')
      }

      const newSignal = await response.json()
      logger.log('✅ useSignals: 訊號建立成功', newSignal.id)

      await fetchSignals()

      return { data: newSignal, error: null }
    } catch (err) {
      logger.error('Error creating signal:', err)
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

      setSignals(signals.filter((s) => s.id !== signalId))

      return { error: null }
    } catch (err) {
      logger.error('Error deleting signal:', err)
      return { error: err instanceof Error ? err : new Error('Unknown error') }
    }
  }

  useEffect(() => {
    fetchSignals()

    if (options.autoRefresh) {
      const interval = setInterval(fetchSignals, 30000)
      return () => clearInterval(interval)
    }
  }, [options.movieId, options.tag, options.location, options.intent])

  return {
    signals,
    loading,
    error,
    fetchSignals,
    createSignal,
    deleteSignal,
  }
}
