// @ts-nocheck
export const dynamic = 'force-dynamic'
import { logger } from '@/lib/utils/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/messages
 * 取得當前用戶的所有對話列表或特定對話
 */
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const otherUserId = searchParams.get('other_user_id')

    // 如果請求對話列表（conversations）
    if (type === 'conversations') {
      logger.log('📊 GET /api/messages - 獲取對話列表')

      // 獲取所有相關訊息
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*),
          receiver:profiles!messages_receiver_id_fkey(*)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // 如果沒有訊息，返回空陣列
      if (!messages || messages.length === 0) {
        logger.log('✅ GET /api/messages - 沒有對話')
        return NextResponse.json({ conversations: [] })
      }

      // 按對話對象分組
      const conversationsMap = new Map()

      messages.forEach((message: any) => {
        // 確定對話對象
        const otherUserId = message.sender_id === user.id
          ? message.receiver_id
          : message.sender_id

        const otherProfile = message.sender_id === user.id
          ? message.receiver
          : message.sender

        // 如果該對話還沒記錄，或這是更新的訊息
        if (!conversationsMap.has(otherUserId)) {
          // 計算未讀數（對方發給我且未讀的）
          const unreadCount = messages.filter(
            (m: any) => m.sender_id === otherUserId && m.receiver_id === user.id && !m.is_read
          ).length

          conversationsMap.set(otherUserId, {
            profile: otherProfile,
            lastMessage: message,
            unreadCount,
          })
        }
      })

      const conversations = Array.from(conversationsMap.values())
      logger.log('✅ GET /api/messages - 對話數量:', conversations.length)

      return NextResponse.json({ conversations })
    }

    // 如果指定了對方用戶 ID，返回與該用戶的對話
    if (otherUserId) {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*),
          receiver:profiles!messages_receiver_id_fkey(*)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)
        .order('created_at', { ascending: true })

      if (error) throw error

      return NextResponse.json(data)
    }

    // 否則返回所有訊息
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*),
        receiver:profiles!messages_receiver_id_fkey(*)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/messages
 * 發送新訊息
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 檢查用戶認證
    const { data: { user } } = await supabase.auth.getUser()
    logger.log('POST /api/messages - User:', user?.id)

    if (!user) {
      logger.error('POST /api/messages - Unauthorized: No user')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    logger.log('POST /api/messages - Body:', {
      receiver_id: body.receiver_id,
      content_length: body.content?.length
    })

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: user.id,
        receiver_id: body.receiver_id,
        content: body.content,
      }] as any)
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*),
        receiver:profiles!messages_receiver_id_fkey(*)
      `)
      .single()

    if (error) {
      logger.error('POST /api/messages - Supabase error:', error)
      throw error
    }

    logger.log('POST /api/messages - Success:', (data as any)?.id)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    logger.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/messages
 * 標記訊息為已讀
 */
export async function PATCH(request: Request) {
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
    const { other_user_id } = body

    // 將所有來自對方且未讀的訊息標記為已讀
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true } as any)
      .eq('sender_id', other_user_id)
      .eq('receiver_id', user.id)
      .eq('is_read', false)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error updating messages:', error)
    return NextResponse.json(
      { error: 'Failed to update messages' },
      { status: 500 }
    )
  }
}
