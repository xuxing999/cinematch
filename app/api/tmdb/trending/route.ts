// @ts-nocheck
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { tmdbClient } from '@/lib/tmdb/client'

/**
 * GET /api/tmdb/trending
 * 取得熱門電影
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const timeWindow = searchParams.get('time_window') || 'day' // 'day' or 'week'

    let data

    if (timeWindow === 'week') {
      data = await tmdbClient.getTrendingMoviesWeek(page)
    } else {
      data = await tmdbClient.getTrendingMovies(page)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching trending movies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending movies' },
      { status: 500 }
    )
  }
}
