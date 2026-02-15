'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Film, Radar, MessageSquare, User, Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { useRealtimeContext } from '@/components/providers/RealtimeProvider'

const navItems = [
  { href: '/',       label: '熱門雷達', icon: Radar },
  { href: '/lobby',  label: '訊號大廳', icon: Film },
  { href: '/chat',   label: '快閃聊天', icon: MessageSquare },
  { href: '/profile',label: '個人資料', icon: User },
  { href: '/about',  label: '關於',     icon: Info },
]

export default function Navbar() {
  const pathname = usePathname()
  const { user } = useAuthContext()
  const { unreadCount } = useRealtimeContext()

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-dark-50/50"
         style={{ background: 'rgba(26, 24, 22, 0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-md border border-neon-red/70 bg-neon-red/10 flex items-center justify-center transition-colors group-hover:bg-neon-red/20">
              <Film size={18} className="text-neon-red" />
            </div>
            <span className="text-xl font-serif font-bold text-foreground tracking-tight hidden sm:block">
              CineMatch
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
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
                    'relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-foreground bg-dark-100'
                      : 'text-stone-400 hover:text-foreground hover:bg-dark-100/60'
                  )}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>

                  {/* active indicator */}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-neon-red rounded-full" />
                  )}

                  {/* 未讀徽章 */}
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 bg-neon-red text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Mobile 右側佔位 */}
          <div className="md:hidden w-9" />
        </div>
      </div>
    </nav>
  )
}
