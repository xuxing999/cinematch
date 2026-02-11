// @ts-nocheck
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

// 單例模式：確保整個應用只有一個 Supabase 客戶端實例
let client: SupabaseClient<Database> | undefined

/**
 * Supabase 瀏覽器客戶端（單例模式）
 * 用於客戶端組件（Client Components）
 */
export function createClient() {
  if (client) {
    return client
  }

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
