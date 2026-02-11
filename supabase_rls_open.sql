-- ============================================================
-- CineMatch — RLS 暴力開放腳本（Debug 用）
--
-- 目的：確保 Realtime 能通，先驗證功能，之後再收緊權限。
-- 執行方式：貼到 Supabase Dashboard > SQL Editor 執行。
--
-- 注意：執行後任何人都可以讀取 messages 和 signals 表的資料。
--       確認 Realtime 正常運作後，請執行底部的「還原腳本」。
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- Step 1：啟用 Realtime（如果尚未啟用）
-- ──────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.signals;

-- ──────────────────────────────────────────────────────────
-- Step 2：messages 表 — 開放全部讀取
-- ──────────────────────────────────────────────────────────

-- 先刪除現有的 SELECT 政策（避免衝突）
DROP POLICY IF EXISTS "Users can view own messages (24h)" ON public.messages;
DROP POLICY IF EXISTS "Enable read access for all messages" ON public.messages;

-- 建立完全開放的 SELECT 政策（anon + authenticated 皆可讀）
CREATE POLICY "Enable read access for all messages"
  ON public.messages
  FOR SELECT
  USING (true);

-- ──────────────────────────────────────────────────────────
-- Step 3：signals 表 — 開放全部讀取
-- ──────────────────────────────────────────────────────────

-- 先刪除現有的 SELECT 政策
DROP POLICY IF EXISTS "Signals are viewable by everyone (24h)" ON public.signals;
DROP POLICY IF EXISTS "Enable read access for all signals" ON public.signals;

-- 建立完全開放的 SELECT 政策
CREATE POLICY "Enable read access for all signals"
  ON public.signals
  FOR SELECT
  USING (true);

-- ──────────────────────────────────────────────────────────
-- Step 4：確認 Realtime 設定（在 Supabase Dashboard 中確認）
-- ──────────────────────────────────────────────────────────
-- 1. 前往 Database > Replication
-- 2. 確認 messages 和 signals 表已勾選「Enable realtime」
-- 3. 前往 Authentication > Providers
-- 4. 確認「Anonymous sign-ins」已啟用

-- ──────────────────────────────────────────────────────────
-- 驗證查詢（執行這個確認政策已生效）
-- ──────────────────────────────────────────────────────────
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('messages', 'signals')
ORDER BY tablename, policyname;


-- ============================================================
-- 【還原腳本】驗證完成後，執行以下 SQL 收緊權限：
-- ============================================================
/*

-- 還原 messages 表政策
DROP POLICY IF EXISTS "Enable read access for all messages" ON public.messages;

CREATE POLICY "Users can view own messages (24h)"
  ON public.messages FOR SELECT
  USING (
    (auth.uid() = sender_id OR auth.uid() = receiver_id)
    AND created_at > NOW() - INTERVAL '24 hours'
  );

-- 還原 signals 表政策
DROP POLICY IF EXISTS "Enable read access for all signals" ON public.signals;

CREATE POLICY "Signals are viewable by everyone (24h)"
  ON public.signals FOR SELECT
  USING (created_at > NOW() - INTERVAL '24 hours');

*/
