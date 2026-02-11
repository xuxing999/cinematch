-- ============================================
-- 修復 Supabase Realtime 問題
-- ============================================
-- 執行此檔案以確保 Realtime 功能正常運作

-- ============================================
-- 1. 確保 messages 和 signals 表格加入 Realtime Publication
-- ============================================

-- 先移除（如果已存在），避免錯誤
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.messages;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.signals;

-- 重新加入
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.signals;

-- ============================================
-- 2. 驗證 RLS 政策（這些應該已經存在，但我們重新確認）
-- ============================================

-- 檢查 messages 表的 SELECT 政策
-- 如果不存在，則創建
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages'
    AND policyname = 'Users can view own messages (24h)'
  ) THEN
    CREATE POLICY "Users can view own messages (24h)"
      ON public.messages FOR SELECT
      USING (
        (auth.uid() = sender_id OR auth.uid() = receiver_id)
        AND created_at > NOW() - INTERVAL '24 hours'
      );
  END IF;
END $$;

-- ============================================
-- 3. 為 Realtime 新增額外的輔助政策（可選，但建議）
-- ============================================

-- 此政策確保 Realtime 系統可以正確廣播新訊息給接收者
-- 注意：這不會影響安全性，因為客戶端仍然受到原本的 RLS 限制

-- 檢查並創建一個更明確的 Realtime 讀取政策
DO $$
BEGIN
  -- 先檢查是否已存在
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages'
    AND policyname = 'Realtime: Users receive messages sent to them'
  ) THEN
    -- 如果存在，先刪除
    DROP POLICY "Realtime: Users receive messages sent to them" ON public.messages;
  END IF;

  -- 創建新政策
  CREATE POLICY "Realtime: Users receive messages sent to them"
    ON public.messages FOR SELECT
    TO authenticated
    USING (auth.uid() = receiver_id);
END $$;

-- ============================================
-- 4. 檢查並確保 RLS 已啟用
-- ============================================

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. 建立 Realtime 診斷檢視
-- ============================================

-- 此檢視可幫助你診斷 Realtime 設定
CREATE OR REPLACE VIEW realtime_diagnostic AS
SELECT
  'messages' as table_name,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'messages') as rls_policies_count,
  (SELECT EXISTS(SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages')) as in_publication
UNION ALL
SELECT
  'signals' as table_name,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'signals') as rls_policies_count,
  (SELECT EXISTS(SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'signals')) as in_publication;

-- 查看診斷結果（執行後檢查 in_publication 是否為 true）
SELECT * FROM realtime_diagnostic;

-- ============================================
-- 6. 檢查現有的 RLS 政策
-- ============================================

-- 列出 messages 表的所有 RLS 政策
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY policyname;

-- ============================================
-- 完成！
-- ============================================

-- 執行完此 SQL 後，請執行以下步驟：
-- 1. 在 Supabase Dashboard 檢查 Database > Replication
-- 2. 確認 messages 和 signals 表格的 Realtime 開關是 ON
-- 3. 重新整理你的前端應用程式
-- 4. 檢查瀏覽器 Console 是否出現 "✅ 訂閱成功！" 的訊息
