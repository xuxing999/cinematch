import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

/**
 * 動態 Favicon — Next.js App Router 自動辨識 app/icon.tsx
 * 使用 CineMatch 的 Film 圖示（lucide-react Film SVG 路徑）
 * neon-red = #c14b2a，背景 = #1a1816
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#1a1816',
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1.5px solid rgba(193,75,42,0.6)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#c14b2a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M7 3v18" />
          <path d="M3 7.5h4" />
          <path d="M3 12h18" />
          <path d="M3 16.5h4" />
          <path d="M17 3v18" />
          <path d="M17 7.5h4" />
          <path d="M17 16.5h4" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
