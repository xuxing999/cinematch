// @ts-nocheck
import { formatDistanceToNow, format, isWithin24Hours } from 'date-fns'
import { zhTW } from 'date-fns/locale'

/**
 * 格式化相對時間（例如：3 分鐘前）
 */
export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: zhTW,
  })
}

/**
 * 格式化絕對時間（例如：2024/01/01 15:30）
 */
export function formatAbsoluteTime(date: string | Date, pattern = 'yyyy/MM/dd HH:mm'): string {
  return format(new Date(date), pattern, { locale: zhTW })
}

/**
 * 檢查訊息是否在 24 小時內
 */
export function isMessageValid(createdAt: string | Date): boolean {
  const messageDate = new Date(createdAt)
  const now = new Date()
  const diff = now.getTime() - messageDate.getTime()
  const hoursDiff = diff / (1000 * 60 * 60)
  return hoursDiff <= 24
}

/**
 * 格式化場次時間（例如：今天 15:30、明天 19:00）
 */
export function formatShowtime(date: string | Date): string {
  const showtimeDate = new Date(date)
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // 檢查是否為今天
  if (showtimeDate.toDateString() === now.toDateString()) {
    return `今天 ${format(showtimeDate, 'HH:mm')}`
  }

  // 檢查是否為明天
  if (showtimeDate.toDateString() === tomorrow.toDateString()) {
    return `明天 ${format(showtimeDate, 'HH:mm')}`
  }

  // 其他日期
  return format(showtimeDate, 'MM/dd HH:mm')
}
