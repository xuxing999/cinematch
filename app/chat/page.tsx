import { logger } from '@/lib/utils/logger'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ConversationList from '@/components/chat/ConversationList'

export default async function ChatPage() {
  logger.log('📱 ChatPage: 渲染對話列表頁面')

  const supabase = await createClient()

  // 獲取當前用戶
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    logger.log('⚠️ ChatPage: 無用戶，重定向到首頁')
    redirect('/')
  }

  logger.log('✅ ChatPage: 用戶已登入', user.id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 頁面標題 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">💬 訊息</h1>
        <p className="text-gray-400">
          24 小時快閃對話，珍惜當下的每一句話
        </p>
      </div>

      {/* 對話列表 */}
      <ConversationList currentUserId={user.id} />
    </div>
  )
}
