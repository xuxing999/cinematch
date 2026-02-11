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
    label: '熱門雷達',
    icon: Radar,
  },
  {
    href: '/lobby',
    label: '訊號大廳',
    icon: Film,
  },
  {
    href: '/chat',
    label: '快閃聊天',
    icon: MessageSquare,
  },
  {
    href: '/profile',
    label: '個人資料',
    icon: User,
  },
]

export default function Navbar() {
  const pathname = usePathname()
  const { user } = useAuthContext()
  // 直接從全域 RealtimeProvider 取得未讀數，不再自行建立 Realtime 訂閱
  const { unreadCount } = useRealtimeContext()

  return (
    <nav className="sticky top-0 z-40 w-full glass border-b border-dark-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-lg bg-neon-red flex items-center justify-center shadow-neon-red group-hover:scale-110 transition-transform">
              <Film size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-neon-glow hidden sm:block">
              CineMatch
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
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
                    'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 relative',
                    isActive
                      ? 'bg-neon-red text-white shadow-neon-red'
                      : 'text-gray-400 hover:text-white hover:bg-dark-100'
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>

                  {/* 未讀訊息徽章 */}
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 bg-neon-red text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-neon-red animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Mobile Menu Button (可選) */}
          <div className="md:hidden">
            <span className="text-sm text-gray-400">選單</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
