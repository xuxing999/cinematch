// @ts-nocheck
export const dynamic = 'force-dynamic'
import { logger } from '@/lib/utils/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/signals
 * 取得所有訊號（24小時內），支援 movie_id / tag / location / intent 篩選
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const movieId  = searchParams.get('movie_id')
    const tag      = searchParams.get('tag')
    const location = searchParams.get('location')
    const intent   = searchParams.get('intent')

    const supabase = await createClient()

    let query = supabase
      .from('signals')
      .select(`
        *,
        profiles (*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (movieId)  query = query.eq('movie_id', parseInt(movieId))
    if (tag)      query = query.eq('tag', tag)
    if (location) query = query.eq('location', location)
    if (intent)   query = query.eq('intent', intent)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Error fetching signals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch signals' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/signals
 * 建立新訊號（含 location / intent / gender_age_label）
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    logger.log('POST /api/signals - User:', user?.id)

    if (!user) {
      logger.error('POST /api/signals - Unauthorized: No user')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    logger.log('POST /api/signals - Body:', body)

    const { data, error } = await supabase
      .from('signals')
      .insert({
        user_id:          user.id,
        movie_id:         body.movie_id,
        movie_title:      body.movie_title,
        movie_poster:     body.movie_poster,
        theater_name:     body.theater_name,
        showtime:         body.showtime,
        tag:              body.tag,
        note:             body.note,
        location:         body.location   || null,
        intent:           body.intent     || null,
        gender_age_label: body.gender_age_label || null,
      })
      .select(`
        *,
        profiles (*)
      `)
      .single()

    if (error) {
      logger.error('POST /api/signals - Supabase error:', error)
      throw error
    }

    logger.log('POST /api/signals - Success:', data?.id)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    logger.error('Error creating signal:', error)
    return NextResponse.json(
      { error: 'Failed to create signal', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
