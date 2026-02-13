# Supabase Cron Job 設定指南

> **目的**：每小時自動執行 `cleanup_expired_data()`，刪除超過 24 小時的訊號與訊息。
> **重要性**：若未設定，資料庫將持續累積過期資料，影響查詢效能並增加儲存成本。

---

## 方法一：Supabase Dashboard（推薦，最簡單）

### 步驟

1. **登入 Supabase Dashboard**
   前往 [https://app.supabase.com](https://app.supabase.com) → 選擇你的 CineMatch 專案

2. **開啟 SQL Editor**
   左側選單 → **SQL Editor** → **New query**

3. **貼上並執行以下 SQL**

```sql
-- ============================================
-- 啟用 pg_cron 擴展（若尚未啟用）
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================
-- 建立每小時清理的 Cron Job
-- ============================================
SELECT cron.schedule(
  'cleanup-expired-cinematch-data',   -- Job 名稱（唯一識別）
  '0 * * * *',                        -- Cron 語法：每小時整點執行
  $$
    SELECT cleanup_expired_data();
  $$
);
```

4. **點擊 Run（▶）** 執行，確認回傳 `schedule` 數字（例如 `1`）

5. **驗證 Job 已建立**

```sql
-- 查看所有 Cron Job
SELECT
  jobid,
  schedule,
  command,
  nodename,
  active
FROM cron.job
WHERE jobname = 'cleanup-expired-cinematch-data';
```

預期輸出：
```
 jobid | schedule  | command                           | active
-------+-----------+-----------------------------------+--------
     1 | 0 * * * * | SELECT cleanup_expired_data();    | t
```

---

## 方法二：Supabase Dashboard → Database → Cron Jobs（GUI 方式）

1. 左側選單 → **Database** → **Cron Jobs**
2. 點擊右上角 **Create a new cron job**
3. 填入以下欄位：

| 欄位 | 值 |
|------|----|
| **Name** | `cleanup-expired-cinematch-data` |
| **Schedule** | `0 * * * *` |
| **Command** | `SELECT cleanup_expired_data();` |

4. 點擊 **Save** 儲存

---

## Cron 語法說明

```
 ┌──── 分鐘 (0-59)
 │  ┌── 小時 (0-23)
 │  │  ┌─ 日 (1-31)
 │  │  │  ┌ 月 (1-12)
 │  │  │  │  ┌ 星期 (0-7, 0和7都是星期日)
 │  │  │  │  │
 0  *  *  *  *   ← 每小時整點執行（推薦）
 */30 * * * *    ← 每 30 分鐘執行（更積極的清理）
 0 2  * * *      ← 每天凌晨 2 點執行（流量低峰，最省資源）
```

**CineMatch 建議**：使用 `0 * * * *`（每小時），因為資料 24 小時過期，每小時清理可確保資料庫不超過 ~25 小時的累積量。

---

## 手動測試清理函數

在 SQL Editor 執行以下指令，確認函數正常運作：

```sql
-- 查看清理前的資料量
SELECT
  'signals' AS table_name,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '24 hours') AS expired
FROM public.signals
UNION ALL
SELECT
  'messages',
  COUNT(*),
  COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '24 hours')
FROM public.messages;

-- 執行清理
SELECT cleanup_expired_data();

-- 清理後再次查詢確認
SELECT
  'signals' AS table_name,
  COUNT(*) AS remaining
FROM public.signals
UNION ALL
SELECT 'messages', COUNT(*) FROM public.messages;
```

---

## 查看 Cron Job 執行紀錄

```sql
-- 查看最近 10 次執行記錄
SELECT
  jobid,
  start_time,
  end_time,
  EXTRACT(MILLISECONDS FROM (end_time - start_time)) AS duration_ms,
  status,
  return_message
FROM cron.job_run_details
WHERE jobid = (
  SELECT jobid FROM cron.job
  WHERE jobname = 'cleanup-expired-cinematch-data'
)
ORDER BY start_time DESC
LIMIT 10;
```

正常執行的 `status` 欄位應為 `succeeded`。

---

## 修改或刪除 Cron Job

```sql
-- 暫停 Job（不刪除）
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-expired-cinematch-data'),
  active := false
);

-- 重新啟用
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-expired-cinematch-data'),
  active := true
);

-- 永久刪除
SELECT cron.unschedule('cleanup-expired-cinematch-data');
```

---

## 注意事項

- **pg_cron 需要 Supabase Pro 方案或以上**。Free 方案可能需要改用外部 Cron 服務（如 cron-job.org）透過 API 呼叫
- 若使用 Free 方案，替代方案是在應用層加入清理邏輯，或使用 Supabase Edge Functions + Scheduled Function
- `cleanup_expired_data()` 函數定義在 `supabase_schema.sql` 中，使用 `SECURITY DEFINER` 確保有足夠權限執行刪除

---

## Free 方案替代方案（外部 Cron）

若 Supabase Free 方案不支援 pg_cron，可使用 [cron-job.org](https://cron-job.org)：

1. 建立免費帳號
2. 新增一個 Cron Job，指向以下 URL（建立 Supabase Edge Function 後取得 URL）：
   ```
   POST https://<project-ref>.supabase.co/functions/v1/cleanup
   ```
3. 設定執行頻率：每小時

Edge Function 範例 (`supabase/functions/cleanup/index.ts`)：
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const { error } = await supabase.rpc('cleanup_expired_data')
  return new Response(
    JSON.stringify({ success: !error, error: error?.message }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

---

*最後更新：2026-02-13*
