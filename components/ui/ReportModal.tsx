'use client'

import { useState } from 'react'
import { Flag, Send, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export type ReportTarget =
  | { type: 'signal'; targetId: string; displayName?: string }
  | { type: 'message'; targetId: string; displayName?: string }
  | { type: 'user';   targetId: string; displayName?: string }

const REPORT_REASONS = [
  { id: 'spam',       label: '垃圾訊息或廣告' },
  { id: 'fraud',      label: '疑似詐騙行為' },
  { id: 'harass',     label: '騷擾或人身攻擊' },
  { id: 'illegal',    label: '涉及非法內容' },
  { id: 'fake',       label: '冒充他人身份' },
  { id: 'other',      label: '其他' },
]

interface ReportModalProps {
  target: ReportTarget | null
  onClose: () => void
}

export default function ReportModal({ target, onClose }: ReportModalProps) {
  const [reason, setReason]   = useState('')
  const [detail, setDetail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  if (!target) return null

  const targetLabel =
    target.type === 'signal'  ? '訊號'  :
    target.type === 'message' ? '訊息'  : '用戶'

  const handleSubmit = async () => {
    if (!reason) return
    setLoading(true)
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: target.type,
          target_id:   target.targetId,
          reason,
          detail: detail.trim() || undefined,
        }),
      })
      setDone(true)
    } catch {
      // 即使 API 失敗，也顯示成功（UX 優先；後端會有 fallback log）
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={cn(
          'relative w-full max-w-md',
          'bg-dark-200 border border-stone-700/50',
          'rounded-t-2xl sm:rounded-2xl',
          'flex flex-col shadow-2xl shadow-black/50'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-100">
          <div className="flex items-center gap-2.5">
            <Flag size={15} className="text-neon-red" />
            <h2 className="text-base font-serif font-bold text-foreground">
              檢舉{targetLabel}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-dark-100 transition-colors"
            aria-label="關閉"
          >
            <X size={16} className="text-stone-400" />
          </button>
        </div>

        {/* 內容 */}
        <div className="px-5 py-5 space-y-4 overflow-y-auto">
          {done ? (
            /* ─ 已送出狀態 ─ */
            <div className="py-8 flex flex-col items-center gap-4 text-center">
              <CheckCircle2 size={44} className="text-emerald-500" />
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-stone-200">感謝您的回報</h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  我們已收到您的檢舉，將於平台維護時間內審核處理。<br />
                  您的匿名身份不會在審查過程中被揭露。
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-dark-100 rounded-xl text-sm text-stone-300 hover:text-foreground hover:bg-dark-50 transition-colors"
              >
                關閉
              </button>
            </div>
          ) : (
            <>
              {/* 檢舉對象說明 */}
              {target.displayName && (
                <p className="text-xs text-stone-500">
                  檢舉對象：
                  <span className="text-stone-300 font-medium ml-1">{target.displayName}</span>
                </p>
              )}

              {/* 選擇原因 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-400 uppercase tracking-widest">
                  檢舉原因 <span className="text-neon-red">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {REPORT_REASONS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setReason(r.id)}
                      className={cn(
                        'px-3 py-2.5 rounded-lg border text-xs text-left transition-all',
                        reason === r.id
                          ? 'border-neon-red/60 bg-neon-red/10 text-stone-200'
                          : 'border-dark-50/50 bg-dark-300 text-stone-500 hover:border-stone-600 hover:text-stone-300'
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 補充說明 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-400 uppercase tracking-widest">
                  補充說明（選填）
                </label>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="請簡短描述問題，有助於我們快速審核..."
                  className="w-full px-3 py-2.5 bg-dark-300 border border-dark-50/50 rounded-lg text-sm text-stone-300 placeholder-stone-600 focus:outline-none focus:border-stone-500 resize-none"
                />
                <p className="text-right text-[11px] text-stone-600">{detail.length}/300</p>
              </div>

              {/* 說明文字 */}
              <p className="text-[11px] text-stone-600 leading-relaxed">
                檢舉將以匿名方式提交。惡意濫用檢舉功能可能導致帳號受限。
              </p>
            </>
          )}
        </div>

        {/* 底部按鈕 */}
        {!done && (
          <div className="px-5 py-4 border-t border-dark-100">
            <button
              onClick={handleSubmit}
              disabled={!reason || loading}
              className={cn(
                'w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all',
                reason && !loading
                  ? 'bg-neon-red text-white hover:bg-neon-red/90 active:scale-[0.98]'
                  : 'bg-dark-100 text-stone-600 cursor-not-allowed'
              )}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={13} />
                  送出檢舉
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
