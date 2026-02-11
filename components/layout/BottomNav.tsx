'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Film, Radar, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { useRealtimeContext } from '@/components/providers/RealtimeProvider'

const navItems = [
  { href: '/',        label: '雷達', icon: Radar },
  { href: '/lobby',   label: '大廳', icon: Film },
  { href: '/chat',    label: '聊天', icon: MessageSquare },
  { href: '/profile', label: '我的', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuthContext()
  const { unreadCount } = useRealtimeContext()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-dark-50/50"
         style={{ background: 'rgba(26, 24, 22, 0.97)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <div className="flex items-stretch h-16 px-1">
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
                'relative flex flex-col items-center justify-center flex-1 gap-1 transition-colors duration-200',
                isActive ? 'text-foreground' : 'text-stone-500'
              )}
            >
              {/* Active 頂部指示線 */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-neon-red rounded-b-full" />
              )}

              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />

                {/* 未讀徽章 */}
                {showBadge && (
                  <span className="absolute -top-2 -right-2.5 bg-neon-red text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>

              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
