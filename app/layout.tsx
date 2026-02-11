import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { RealtimeProvider } from '@/components/providers/RealtimeProvider'
import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'

export const metadata: Metadata = {
  title: 'CineMatch 影伴 - 24小時快閃電影社交',
  description: '基於電影優惠與觀影意圖的快閃社交工具。找影伴，省錢看電影，24小時後訊息自動銷毀。',
  keywords: ['電影', '社交', '優惠', '揪團', '快閃', 'CineMatch'],
  authors: [{ name: 'CineMatch Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#e50914',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen gradient-neon antialiased">
        <AuthProvider>
          {/* RealtimeProvider 必須在 AuthProvider 內層，才能存取 useAuthContext */}
          <RealtimeProvider>
            <Navbar />
            <main className="pb-20 md:pb-0">
              {children}
            </main>
            <BottomNav />
          </RealtimeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
