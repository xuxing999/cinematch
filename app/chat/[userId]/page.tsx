import { logger } from '@/lib/utils/logger'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ChatRoom from '@/components/chat/ChatRoom'

interface ChatRoomPageProps {
  params: Promise<{
    userId: string
  }>
}

export default async function ChatRoomPage({ params }: ChatRoomPageProps) {
  const { userId: otherUserId } = await params
  logger.log('📱 ChatRoomPage: 渲染聊天室', otherUserId)

  const supabase = await createClient()

  // 獲取當前用戶
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    logger.log('⚠️ ChatRoomPage: 無用戶，重定向到首頁')
    redirect('/')
  }

  logger.log('✅ ChatRoomPage: 當前用戶', user.id)

  // 防止自己和自己聊天
  if (user.id === otherUserId) {
    logger.log('⚠️ ChatRoomPage: 無法與自己聊天')
    redirect('/chat')
  }

  // 獲取對方的 Profile
  const { data: otherUserProfile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', otherUserId)
    .single()

  if (error || !otherUserProfile) {
    logger.log('❌ ChatRoomPage: 找不到用戶', otherUserId, error)
    notFound()
  }

  logger.log('✅ ChatRoomPage: 對方用戶', (otherUserProfile as any).display_name)

  return <ChatRoom currentUserId={user.id} otherUser={otherUserProfile} />
}
