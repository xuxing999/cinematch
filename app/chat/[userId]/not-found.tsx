'use client'

import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto rounded-full bg-dark-100 flex items-center justify-center mb-4">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="text-xl font-bold text-gray-400 mb-2">找不到此用戶</h3>
        <p className="text-gray-500 mb-6">
          此用戶可能不存在，或訊息已過期自動刪除
        </p>
        <button
          onClick={() => router.push('/chat')}
          className="px-6 py-2 bg-neon-red text-white rounded-lg hover:scale-105 transition-all shadow-neon-red"
        >
          返回訊息列表
        </button>
      </div>
    </div>
  )
}
