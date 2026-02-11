// @ts-nocheck
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient<Database> | undefined

/**
 * Supabase 瀏覽器客戶端（單例模式）
 *
 * 在 build 時（Vercel 靜態生成），env vars 可能尚未注入。
 * 使用 placeholder fallback 避免 throw，讓 build 成功。
 * 實際 runtime 時 Vercel 會注入真實的 env vars。
 */
export function createClient() {
  if (client) {
    return client
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Build 時若 env vars 尚未設定，使用 placeholder 避免 throw
  // 注意：使用 placeholder 的 client 無法實際連線，
  // 需要在 Vercel 設定真實的 env vars 並重新 build 才能運作
  const safeUrl = url || 'https://placeholder.supabase.co'
  const safeKey = key || 'placeholder-anon-key-for-build-time-only'

  if (!url || !key) {
    // 只在 server side（build time）時靜默，client side 才警告
    if (typeof window !== 'undefined') {
      console.error(
        '[Supabase] 缺少環境變數 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
        '請到 Vercel 儀表板 → Settings → Environment Variables 設定'
      )
    }
  }

  client = createBrowserClient<Database>(
    safeUrl,
    safeKey,
    {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    }
  )

  return client
}
