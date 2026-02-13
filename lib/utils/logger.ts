/**
 * logger — 生產環境安全日誌工具
 *
 * 問題：直接使用 console.log 會在生產環境將 userId、session 等敏感資訊
 *       暴露在瀏覽器 DevTools Console，任何開啟 F12 的人都能看到。
 *
 * 解決方案：所有日誌呼叫統一走這個 logger，
 *           在 production 環境全部靜默（no-op），
 *           development 環境維持原本的輸出。
 *
 * 使用方式：
 *   import { logger } from '@/lib/utils/logger'
 *   logger.log('訊息', data)   ← 取代 console.log
 *   logger.warn('警告', data)  ← 取代 console.warn
 *   logger.error('錯誤', data) ← 取代 console.error
 */

const isDev = process.env.NODE_ENV !== 'production'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogArgs = any[]

export const logger = {
  log: isDev ? (...args: LogArgs) => console.log(...args) : () => {},
  warn: isDev ? (...args: LogArgs) => console.warn(...args) : () => {},
  error: isDev ? (...args: LogArgs) => console.error(...args) : () => {},
}
