'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Film, Radar, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { useRealtimeContext } from '@/components/providers/RealtimeProvider'

const navItems = [
  {
    href: '/',
    label: '雷達',
    icon: Radar,
  },
  {
    href: '/lobby',
    label: '大廳',
    icon: Film,
  },
  {
    href: '/chat',
    label: '聊天',
    icon: MessageSquare,
  },
  {
    href: '/profile',
    label: '我的',
    icon: User,
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuthContext()
  // 直接從全域 RealtimeProvider 取得未讀數，不再自行建立 Realtime 訂閱
  const { unreadCount } = useRealtimeContext()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass border-t border-dark-100">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isChatPage = item.href === '/chat'
          const showBadge = isChatPage && unreadCount > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative',
                isActive ? 'text-neon-red' : 'text-gray-400'
              )}
            >
              <div className="relative">
                <Icon
                  size={24}
                  className={cn(
                    'transition-transform',
                    isActive && 'scale-110'
                  )}
                />

                {/* 未讀訊息徽章 */}
                {showBadge && (
                  <span className="absolute -top-2 -right-2 bg-neon-red text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-neon-red animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>

              <span className="text-xs mt-1 font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-1 bg-neon-red rounded-t-full animate-fade-in" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
