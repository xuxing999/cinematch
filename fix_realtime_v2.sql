-- ============================================
-- 修復 Supabase Realtime 問題（穩健版本 v2）
-- ============================================
-- 此腳本使用 PL/pgSQL DO 區塊來安全處理 Publication 設定
-- 執行此檔案以確保 Realtime 功能正常運作

-- ============================================
-- 1. 安全地將 messages 表加入 Realtime Publication
-- ============================================

DO $$
BEGIN
  -- 檢查 messages 是否已在 supabase_realtime publication 中
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'messages'
  ) THEN
    -- 如果不在，則加入
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    RAISE NOTICE '✅ messages 表已加入 supabase_realtime publication';
  ELSE
    RAISE NOTICE 'ℹ️  messages 表已經在 supabase_realtime publication 中';
  END IF;
END $$;

-- ============================================
-- 2. 安全地將 signals 表加入 Realtime Publication
-- ============================================

DO $$
BEGIN
  -- 檢查 signals 是否已在 supabase_realtime publication 中
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'signals'
  ) THEN
    -- 如果不在，則加入
    ALTER PUBLICATION supabase_realtime ADD TABLE public.signals;
    RAISE NOTICE '✅ signals 表已加入 supabase_realtime publication';
  ELSE
    RAISE NOTICE 'ℹ️  signals 表已經在 supabase_realtime publication 中';
  END IF;
END $$;

-- ============================================
-- 3. 確保 RLS 已啟用
-- ============================================

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. 檢查並創建 Realtime 專用 RLS 政策
-- ============================================

-- 為 messages 表創建 Realtime 專用政策
DO $$
BEGIN
  -- 先檢查政策是否已存在
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'messages'
    AND policyname = 'Realtime: Users receive messages sent to them'
  ) THEN
    -- 如果存在，先刪除
    DROP POLICY "Realtime: Users receive messages sent to them" ON public.messages;
    RAISE NOTICE 'ℹ️  已刪除舊的 Realtime 政策，準備重新創建';
  END IF;

  -- 創建新政策
  CREATE POLICY "Realtime: Users receive messages sent to them"
    ON public.messages FOR SELECT
    TO authenticated
    USING (auth.uid() = receiver_id);

  RAISE NOTICE '✅ Realtime 專用 RLS 政策已創建';
END $$;

-- ============================================
-- 5. 驗證現有的主要 RLS 政策
-- ============================================

-- 檢查主要的 SELECT 政策是否存在且正確
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'messages'
    AND policyname = 'Users can view own messages (24h)'
  ) THEN
    -- 如果不存在，創建它
    CREATE POLICY "Users can view own messages (24h)"
      ON public.messages FOR SELECT
      USING (
        (auth.uid() = sender_id OR auth.uid() = receiver_id)
        AND created_at > NOW() - INTERVAL '24 hours'
      );
    RAISE NOTICE '✅ 主要 RLS 政策已創建';
  ELSE
    RAISE NOTICE 'ℹ️  主要 RLS 政策已存在';
  END IF;
END $$;

-- ============================================
-- 6. 建立診斷檢視
-- ============================================

-- 先刪除舊的檢視（如果存在）
DROP VIEW IF EXISTS realtime_diagnostic;

-- 創建新的診斷檢視
CREATE VIEW realtime_diagnostic AS
SELECT
  'messages' as table_name,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages') as rls_policies_count,
  (SELECT EXISTS(
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'messages'
  )) as in_publication,
  (SELECT relreplident::text FROM pg_class WHERE relname = 'messages' AND relnamespace = 'public'::regnamespace) as replica_identity
UNION ALL
SELECT
  'signals' as table_name,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'signals') as rls_policies_count,
  (SELECT EXISTS(
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'signals'
  )) as in_publication,
  (SELECT relreplident::text FROM pg_class WHERE relname = 'signals' AND relnamespace = 'public'::regnamespace) as replica_identity;

-- ============================================
-- 7. 設定 Replica Identity（重要！）
-- ============================================

-- 將 messages 表的 replica identity 設為 FULL
-- 這確保 Realtime 可以追蹤所有欄位的變更
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.signals REPLICA IDENTITY FULL;

-- ============================================
-- 8. 執行診斷查詢
-- ============================================

-- 顯示診斷結果
SELECT
  table_name,
  rls_policies_count,
  in_publication,
  replica_identity,
  CASE
    WHEN in_publication = true AND rls_policies_count >= 2 AND replica_identity = 'f' THEN '✅ 設定完整'
    WHEN in_publication = false THEN '❌ 未加入 Publication'
    WHEN rls_policies_count < 2 THEN '⚠️ RLS 政策不足'
    WHEN replica_identity != 'f' THEN '⚠️ Replica Identity 需要設為 FULL'
    ELSE '⚠️ 需要檢查'
  END as status
FROM realtime_diagnostic;

-- ============================================
-- 9. 列出所有 messages 表的 RLS 政策
-- ============================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  CASE
    WHEN cmd = 'SELECT' THEN '✅ 讀取權限'
    WHEN cmd = 'INSERT' THEN '📝 插入權限'
    WHEN cmd = 'UPDATE' THEN '✏️ 更新權限'
    WHEN cmd = 'DELETE' THEN '🗑️ 刪除權限'
    ELSE cmd
  END as permission_type
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'messages'
ORDER BY cmd, policyname;

-- ============================================
-- 10. 檢查 Publication 內容
-- ============================================

SELECT
  pubname as publication_name,
  schemaname as schema,
  tablename as table_name,
  '✅ 已包含在 Realtime' as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND schemaname = 'public'
AND tablename IN ('messages', 'signals')
ORDER BY tablename;

-- ============================================
-- 完成！
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ Realtime 修復腳本執行完成！';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE '請執行以下步驟：';
  RAISE NOTICE '1. 檢查上方的診斷結果，確認 in_publication = true';
  RAISE NOTICE '2. 前往 Supabase Dashboard → Database → Replication';
  RAISE NOTICE '3. 確認 messages 和 signals 的 Realtime 開關是 ON';
  RAISE NOTICE '4. 重新啟動你的前端應用程式';
  RAISE NOTICE '5. 前往 http://localhost:3000/test-realtime 測試';
  RAISE NOTICE '';
END $$;
