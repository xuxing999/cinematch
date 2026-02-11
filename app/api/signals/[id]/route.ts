// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/signals/[id]
 * 取得單個訊號
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('signals')
      .select(`
        *,
        profiles (*)
      `)
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching signal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch signal' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/signals/[id]
 * 更新訊號
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // 檢查用戶認證
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from('signals')
      .update(body)
      .eq('id', params.id)
      .eq('user_id', user.id) // 確保只能更新自己的訊號
      .select(`
        *,
        profiles (*)
      `)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating signal:', error)
    return NextResponse.json(
      { error: 'Failed to update signal' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/signals/[id]
 * 刪除訊號
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // 檢查用戶認證
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('signals')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id) // 確保只能刪除自己的訊號

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting signal:', error)
    return NextResponse.json(
      { error: 'Failed to delete signal' },
      { status: 500 }
    )
  }
}
