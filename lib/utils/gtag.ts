/**
 * gtag.ts — Google Analytics 4 自定義事件工具
 *
 * 使用方式：
 *   import { trackEvent } from '@/lib/utils/gtag'
 *   trackEvent('post_signal', { movie_title: '...' })
 *
 * 設計原則：
 * - 僅在 NEXT_PUBLIC_GA_ID 存在時才發送（本機開發不污染數據）
 * - 對 gtag 函式的存在做防禦性檢查，避免腳本未載入時報錯
 * - 所有 event 參數盡量遵循 GA4 建議命名規範（snake_case）
 */

type GtagEventParams = Record<string, string | number | boolean | undefined>

export function trackEvent(eventName: string, params?: GtagEventParams) {
  // 若 GA_ID 未設定，直接 return（本機開發 / CI 環境）
  if (!process.env.NEXT_PUBLIC_GA_ID) return

  // 防禦性檢查：gtag 腳本尚未載入時不報錯
  if (typeof window === 'undefined') return
  if (typeof (window as any).gtag !== 'function') return

  ;(window as any).gtag('event', eventName, params ?? {})
}

// ─── CineMatch 具名事件 ────────────────────────────────────

/**
 * 使用者成功發布訊號
 * @param movieTitle  電影名稱
 * @param tag         意圖標籤 (has_ticket / seek_companion / pure_watch / want_discuss)
 */
export function trackPostSignal(movieTitle: string, tag: string) {
  trackEvent('post_signal', {
    movie_title: movieTitle,
    signal_tag:  tag,
  })
}

/**
 * 使用者點擊「聯絡 TA」，進入聊天室
 * @param movieTitle  對應的電影名稱
 * @param tag         對方的意圖標籤
 */
export function trackStartChat(movieTitle: string, tag: string) {
  trackEvent('start_chat', {
    movie_title: movieTitle,
    signal_tag:  tag,
  })
}
