import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'CineMatch 影伴 — 24小時快閃電影社交'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * 動態 Open Graph 分享圖 — Next.js App Router 自動辨識 app/opengraph-image.tsx
 *
 * 色系：
 *   背景     #1a1816  （網站深色背景）
 *   主色     #c14b2a  （neon-red / 鐵鏽紅）
 *   強調線   #3d3830  （dark-100 邊框色）
 *   文字主   #f5f0eb  （foreground）
 *   文字次   #a09488  （stone-400）
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#1a1816',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ── 背景裝飾：左上角膠片格 ── */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: -12,
              top: 40 + i * 72,
              width: 22,
              height: 52,
              background: '#2a2520',
              borderRadius: 4,
              border: '1.5px solid #3d3830',
            }}
          />
        ))}
        {/* 右側膠片格 */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              right: -12,
              top: 40 + i * 72,
              width: 22,
              height: 52,
              background: '#2a2520',
              borderRadius: 4,
              border: '1.5px solid #3d3830',
            }}
          />
        ))}

        {/* ── 中央膠片橫條（上）── */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 32,
            background: '#221f1c',
            borderBottom: '1px solid #3d3830',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '0 48px',
          }}
        >
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 32,
                height: 18,
                background: '#1a1816',
                borderRadius: 3,
                border: '1px solid #3d3830',
              }}
            />
          ))}
        </div>
        {/* 底部膠片橫條 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 32,
            background: '#221f1c',
            borderTop: '1px solid #3d3830',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '0 48px',
          }}
        >
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 32,
                height: 18,
                background: '#1a1816',
                borderRadius: 3,
                border: '1px solid #3d3830',
              }}
            />
          ))}
        </div>

        {/* ── 主體內容 ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 28,
          }}
        >
          {/* Logo 圖示 + 邊框 */}
          <div
            style={{
              width: 120,
              height: 120,
              background: 'rgba(193,75,42,0.08)',
              border: '2px solid rgba(193,75,42,0.5)',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="72"
              height="72"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c14b2a"
              strokeWidth="1.5"
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

          {/* 網站名稱 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 80,
                fontWeight: 700,
                color: '#f5f0eb',
                letterSpacing: '-2px',
                lineHeight: 1,
              }}
            >
              CineMatch
            </div>

            {/* 分隔線 */}
            <div
              style={{
                width: 64,
                height: 2,
                background: 'linear-gradient(90deg, transparent, #c14b2a, transparent)',
              }}
            />

            {/* 標語 */}
            <div
              style={{
                fontSize: 28,
                color: '#a09488',
                letterSpacing: '6px',
                fontFamily: 'system-ui, sans-serif',
                fontWeight: 400,
              }}
            >
              24小時快閃影伴
            </div>
          </div>

          {/* 標籤列 */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginTop: 8,
            }}
          >
            {['🎫 有票找伴', '🎬 純粹共賞', '💬 討論電影'].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: '6px 16px',
                  background: 'rgba(61,56,48,0.8)',
                  border: '1px solid #4a443c',
                  borderRadius: 20,
                  fontSize: 16,
                  color: '#a09488',
                  fontFamily: 'system-ui, sans-serif',
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
