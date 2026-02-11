// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { SignalWithProfile, SignalTag } from '@/types/models'

interface UseSignalsOptions {
  movieId?: number
  tag?: SignalTag
  autoRefresh?: boolean
}

export function useSignals(options: UseSignalsOptions = {}) {
  const [signals, setSignals] = useState<SignalWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

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
