'use client'

import { useState } from 'react'
import { ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/**
 * 聊天室頂部固定安全警語
 * — 不可刪除、可折疊（折疊狀態僅維持本次 session，每次進入聊天室都預設展開）
 */
export default function SafetyBanner() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        'flex-shrink-0 border-b border-amber-900/40 bg-amber-950/30',
        'transition-all duration-200'
      )}
    >
      {/* ─── 標題列（永遠可見）─── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-amber-950/20 transition-colors text-left"
        aria-expanded={!collapsed}
        aria-label="展開或收合安全指南"
      >
        <div className="flex items-center gap-2">
          <ShieldAlert size={13} className="text-amber-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-amber-400 tracking-wide">
            安全提醒 — 請謹慎保護個人隱私
          </span>
        </div>
        {collapsed
          ? <ChevronDown size={14} className="text-amber-600 flex-shrink-0" />
          : <ChevronUp size={14} className="text-amber-600 flex-shrink-0" />
        }
      </button>

      {/* ─── 詳細內容（可折疊）─── */}
      {!collapsed && (
        <div className="px-4 pb-3 space-y-1.5">
          {[
            '請勿向對方透露真實姓名、電話、住址或任何金融帳號資訊。',
            '本平台為匿名快閃社交，請勿輕易相信對方的真實身份或票券來源。',
            '任何要求提前匯款、購票轉帳或點擊外部連結的行為，均為詐騙警訊。',
            '若感到不適，請立即停止對話，並使用右上角的「檢舉」功能回報。',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-amber-600 text-xs flex-shrink-0 mt-0.5">·</span>
              <p className="text-xs text-amber-700/90 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
