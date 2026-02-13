// @ts-nocheck
export const dynamic = 'force-dynamic'
import { logger } from '@/lib/utils/logger'
import { NextResponse } from 'next/server'
import { tmdbClient } from '@/lib/tmdb/client'

/**
 * GET /api/tmdb/now-playing
 * 取得現正熱映電影（台灣地區）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')

    const data = await tmdbClient.getNowPlayingMovies(page)

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Error fetching now playing movies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch now playing movies' },
      { status: 500 }
    )
  }
}
