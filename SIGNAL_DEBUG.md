# 🔧 訊號發布調試指南

我已經為您添加了完整的調試功能，請按照以下步驟測試：

---

## 📋 測試步驟

### 步驟 1：打開開發者工具
1. 在瀏覽器按 **F12** 或 **右鍵 > 檢查**
2. 切換到 **Console** 面板
3. 保持開啟狀態

### 步驟 2：重新載入訊號大廳
1. 訪問 http://localhost:3000/lobby
2. 查看頁面標題下方是否顯示：**用戶 ID: xxxxxxxx...**
   - ✅ 如果有顯示 → 認證正常
   - ❌ 如果沒有顯示 → 認證失敗

### 步驟 3：發布訊號並查看日誌
1. 點擊右下角 **[+]** 按鈕
2. 搜尋電影（例如：沙丘）
3. 選擇標籤（例如：🎟️ 我有票）
4. 點擊 **[發布訊號]**
5. 查看 Console 中的日誌

---

## 🔍 日誌解讀

### 正常情況（成功）

您應該會在 Console 看到：

```
🚀 開始發布訊號: {movie: {...}, tag: "has_ticket", ...}
POST /api/signals - User: abc12345-...
POST /api/signals - Body: {movie_id: 123, movie_title: "沙丘", ...}
POST /api/signals - Success: def67890-...
✅ 發布成功: {id: "def67890-...", ...}
```

然後會彈出提示：**「訊號發布成功！」**

訊號會立即出現在列表中。

---

### 錯誤情況 1：認證失敗（401）

如果看到：

```
🚀 開始發布訊號: {...}
POST /api/signals - Unauthorized: No user
❌ 發布失敗: Error: Failed to create signal
```

**原因**：用戶未登入或認證失效

**解決方案**：
1. 確認 Supabase Anonymous Sign-in 已啟用
2. 清除瀏覽器 Cookie 後重新載入
3. 檢查 `.env.local` 中的 Supabase 設定

---

### 錯誤情況 2：資料庫錯誤（500）

如果看到：

```
🚀 開始發布訊號: {...}
POST /api/signals - User: abc12345-...
POST /api/signals - Body: {...}
POST /api/signals - Supabase error: {code: "...", message: "..."}
❌ 發布失敗: Error: ...
```

**原因**：Supabase 資料庫問題

**可能的原因：**
1. RLS 政策阻擋插入
2. 欄位格式錯誤
3. 必填欄位缺失
4. 資料表不存在

**解決方案**：
1. 確認已執行 `supabase_schema.sql`
2. 前往 Supabase Dashboard > Database > Tables
3. 確認 `signals` 表存在且 RLS 政策正確
4. 檢查錯誤訊息中的具體原因

---

## 🧪 手動測試 Supabase

如果持續失敗，請在 Supabase Dashboard > SQL Editor 執行：

### 測試 1：確認用戶存在
```sql
SELECT * FROM auth.users LIMIT 5;
```

應該能看到至少一個匿名用戶。

### 測試 2：確認 profiles 表
```sql
SELECT * FROM public.profiles LIMIT 5;
```

應該能看到對應的用戶資料。

### 測試 3：手動插入訊號（測試 RLS）
```sql
-- 先取得一個用戶 ID
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;

  -- 嘗試插入測試訊號
  INSERT INTO public.signals (
    user_id, movie_id, movie_title, tag
  ) VALUES (
    test_user_id, 12345, '測試電影', 'has_ticket'
  );
END $$;
```

如果成功，說明資料表和 RLS 沒問題。

### 測試 4：查詢所有訊號
```sql
SELECT
  s.*,
  p.display_name
FROM signals s
LEFT JOIN profiles p ON s.user_id = p.id
ORDER BY s.created_at DESC
LIMIT 10;
```

確認訊號是否已建立。

---

## 📞 下一步

完成上述測試後，請告訴我：

1. **頁面是否顯示用戶 ID？**
   - [ ] 有
   - [ ] 沒有

2. **Console 顯示什麼錯誤訊息？**
   - 複製完整的錯誤訊息

3. **Supabase 測試結果如何？**
   - [ ] 用戶存在
   - [ ] profiles 存在
   - [ ] 手動插入成功
   - [ ] 查詢到訊號

根據您的回報，我會提供精確的解決方案！
