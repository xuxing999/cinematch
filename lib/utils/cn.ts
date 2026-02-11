// @ts-nocheck
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind CSS 類名合併工具
 * 結合 clsx 與 tailwind-merge，避免樣式衝突
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
