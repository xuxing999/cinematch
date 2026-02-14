// @ts-nocheck
export const dynamic = 'force-dynamic'
import { logger } from '@/lib/utils/logger'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/reports
 * 提交用戶檢舉（匿名）
 *
 * Body: { target_type, target_id, reason, detail? }
 *
 * 注意：reports 表格需在 Supabase 建立（見 supabase_schema.sql）。
 * 若表格不存在，此 API 會優雅降級（回傳 200 但記錄 warning），
 * 確保前端 UX 不受影響。
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { target_type, target_id, reason, detail } = body

    if (!target_type || !target_id || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: target_type, target_id, reason' },
        { status: 400 }
      )
    }

    const validTypes   = ['signal', 'message', 'user']
    const validReasons = ['spam', 'fraud', 'harass', 'illegal', 'fake', 'other']

    if (!validTypes.includes(target_type) || !validReasons.includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid target_type or reason' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 取得檢舉者 ID（匿名用戶）
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id:  user?.id ?? null,
        target_type,
        target_id,
        reason,
        detail:       detail ?? null,
        status:       'pending',
      })

    if (error) {
      // 若 reports 表尚未建立，記錄 warning 但回傳 200（降級處理）
      logger.warn('[Reports API] 無法寫入 reports 表，請確認已執行 schema migration:', error.message)
      return NextResponse.json({ success: true, degraded: true })
    }

    logger.log('[Reports API] 檢舉已提交', { target_type, target_id, reason })
    return NextResponse.json({ success: true })

  } catch (error) {
    logger.error('[Reports API] 錯誤:', error)
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    )
  }
}
