// @ts-nocheck
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/signals/stats
 * 取得訊號統計（每部電影的訊號數量）
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('signals')
      .select('movie_id')
      .eq('is_active', true)

    if (error) throw error

    // 統計每部電影的訊號數量
    const stats: Record<number, number> = {}

    data.forEach((signal) => {
      if (!stats[signal.movie_id]) {
        stats[signal.movie_id] = 0
      }
      stats[signal.movie_id]++
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching signal stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch signal stats' },
      { status: 500 }
    )
  }
}
