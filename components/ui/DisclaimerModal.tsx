'use client'

import { useEffect, useState } from 'react'
import { FilmIcon, ShieldCheck, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const STORAGE_KEY = 'cinematch_terms_v1_accepted'

export default function DisclaimerModal() {
  const [visible, setVisible] = useState(false)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(STORAGE_KEY)
      if (!accepted) setVisible(true)
    } catch {
      // 無法讀取 localStorage（私密模式），仍顯示
      setVisible(true)
    }
  }, [])

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // ignore
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* 背景遮罩 — 刻意不可點擊關閉，必須主動同意 */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

      {/* Modal 主體 */}
      <div
        className={cn(
          'relative w-full max-w-lg',
          'bg-dark-200 border border-stone-700/60',
          'rounded-t-2xl sm:rounded-2xl',
          'max-h-[92dvh] sm:max-h-[88vh] flex flex-col',
          'shadow-2xl shadow-black/60'
        )}
      >
        {/* ─── 頂部裝飾條 ─── */}
        <div className="h-1 w-full bg-gradient-to-r from-neon-red via-stone-600 to-neon-red/30 rounded-t-2xl sm:rounded-t-2xl flex-shrink-0" />

        {/* ─── Header ─── */}
        <div className="px-6 pt-5 pb-4 border-b border-dark-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-neon-red/10 border border-neon-red/30 flex items-center justify-center flex-shrink-0">
              <FilmIcon size={18} className="text-neon-red" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-foreground tracking-tight">
                CineMatch 影伴
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">使用前請閱讀以下說明</p>
            </div>
          </div>
        </div>

        {/* ─── 內容（可捲動）─── */}
        <div className="overflow-y-auto overscroll-contain px-6 py-5 space-y-5 flex-1">

          {/* Side Project 聲明 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
                關於本平台
              </h3>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              CineMatch 是一個由個人開發者製作的
              <span className="text-stone-300 font-medium"> Side Project</span>
              ，旨在提供電影觀影的社交配對體驗。本平台並非商業服務，不提供任何購票、票價保障或官方折扣，亦不隸屬於任何電影院或電影公司。
            </p>
          </section>

          {/* 使用條款重點 */}
          <section className="space-y-2.5">
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
              使用條款摘要
            </h3>
            <ul className="space-y-2.5">
              {[
                {
                  icon: <ShieldCheck size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />,
                  text: '本平台採用完全匿名機制，不收集您的姓名、Email 或手機號碼。',
                },
                {
                  icon: <Clock size={13} className="text-neon-cyan flex-shrink-0 mt-0.5" />,
                  text: '所有訊號與對話訊息將在 24 小時後自動銷毀，平台不留存任何聊天紀錄。',
                },
                {
                  icon: <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />,
                  text: '請勿在對話中透露個人聯絡資訊、銀行帳號或其他敏感資料。平台無法為線下會面的安全性負責。',
                },
                {
                  icon: <AlertTriangle size={13} className="text-neon-red flex-shrink-0 mt-0.5" />,
                  text: '嚴禁散布騷擾、歧視、詐騙或任何違法內容。違規用戶將被停權並視情況通報相關單位。',
                },
                {
                  icon: <FilmIcon size={13} className="text-stone-500 flex-shrink-0 mt-0.5" />,
                  text: '電影資訊來源為 TMDB（The Movie Database），依 TMDB 服務條款使用，本平台不主張相關著作權。',
                },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  {item.icon}
                  <span className="text-xs text-stone-400 leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 免責聲明 */}
          <section className="bg-dark-300 border border-stone-700/40 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
              免責聲明
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              本平台以「現狀」提供服務，不作任何明示或默示擔保。開發者對因使用本平台所產生的任何直接或間接損失（包含但不限於財產損失、人身安全事故）不承擔法律責任。使用者應自行評估並承擔使用風險。
            </p>
          </section>

          {/* 同意勾選 */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="sr-only"
              />
              <div
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                  agreed
                    ? 'bg-neon-red border-neon-red'
                    : 'bg-dark-300 border-stone-600 group-hover:border-stone-400'
                )}
              >
                {agreed && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-stone-400 leading-relaxed">
              我已閱讀並了解上述內容，同意遵守使用條款，且確認我已年滿 13 歲。
            </span>
          </label>
        </div>

        {/* ─── 底部按鈕 ─── */}
        <div className="px-6 py-4 border-t border-dark-100 flex-shrink-0">
          <button
            onClick={handleAccept}
            disabled={!agreed}
            className={cn(
              'w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200',
              agreed
                ? 'bg-neon-red text-white hover:bg-neon-red/90 active:scale-[0.98]'
                : 'bg-dark-100 text-stone-600 cursor-not-allowed'
            )}
          >
            同意並進入 CineMatch
          </button>
          <p className="text-center text-[11px] text-stone-600 mt-2.5">
            繼續使用即表示您接受本條款。如不同意，請關閉此頁面。
          </p>
        </div>
      </div>
    </div>
  )
}
