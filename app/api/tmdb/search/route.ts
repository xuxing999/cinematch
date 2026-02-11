// @ts-nocheck
import { NextResponse } from 'next/server'
import { tmdbClient } from '@/lib/tmdb/client'

/**
 * GET /api/tmdb/search
 * 搜尋電影
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const page = parseInt(searchParams.get('page') || '1')

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const data = await tmdbClient.searchMovies(query, page)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error searching movies:', error)
    return NextResponse.json(
      { error: 'Failed to search movies' },
      { status: 500 }
    )
  }
}
