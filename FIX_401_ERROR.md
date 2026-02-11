# 🔧 修復 401 Unauthorized 錯誤

## 問題診斷

您收到 **401 Unauthorized** 錯誤，這表示匿名登入沒有成功。

---

## 🚀 快速修復步驟

### 步驟 1：確認 Supabase Anonymous Sign-in 已啟用

這是**最關鍵**的步驟！

1. 前往 Supabase Dashboard：https://app.supabase.com/
2. 選擇您的 CineMatch 專案
3. 左側選單點擊 **Authentication** > **Providers**
4. 找到 **Anonymous Sign-in**
5. 確認開關是 **ON**（綠色）
6. 如果是 OFF，點擊開啟
7. 點擊 **Save** 儲存

**截圖參考：**
```
┌─────────────────────────────────┐
│ Providers                        │
├─────────────────────────────────┤
│ Email                 [ON]       │
│ Phone                 [OFF]      │
│ Anonymous Sign-in     [ON] ← 這個要開啟
│ Google                [OFF]      │
└─────────────────────────────────┘
```

---

### 步驟 2：清除瀏覽器 Cookie

1. 在瀏覽器按 **F12** 開啟開發者工具
2. 切換到 **Application** 或 **儲存空間** 面板
3. 左側選擇 **Cookies** > **http://localhost:3001**
4. 右鍵點擊 > **Clear** 清除所有 Cookie
5. 或直接使用無痕視窗測試

---

### 步驟 3：重新載入頁面並檢查 Console

1. 重新整理頁面（Ctrl+R 或 Cmd+R）
2. 打開 Console 面板
3. 查看是否出現以下日誌：

**成功的日誌應該是：**
```
🔐 AuthProvider: 檢查用戶認證狀態...
⚠️ AuthProvider: 無用戶，開始匿名登入...
🚀 開始執行匿名登入...
✅ 匿名登入成功: abc12345-...
🔄 AuthProvider: 認證狀態變化 SIGNED_IN abc12345-...
✅ AuthProvider: Session 已更新 影伴 abc12345
```

**失敗的日誌會顯示：**
```
🔐 AuthProvider: 檢查用戶認證狀態...
⚠️ AuthProvider: 無用戶，開始匿名登入...
🚀 開始執行匿名登入...
❌ 匿名登入錯誤: {code: "...", message: "..."}
```

---

### 步驟 4：確認環境變數正確

1. 確認 `.env.local` 檔案存在
2. 確認包含以下內容：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. **重要**：修改 `.env.local` 後需要**重新啟動**開發伺服器

```bash
# 停止伺服器 (Ctrl+C)
# 然後重新啟動
npm run dev
```

---

### 步驟 5：測試匿名登入

重新載入頁面後，在 Console 中執行：

```javascript
// 檢查用戶狀態
const { data } = await fetch('/api/signals').then(r => r.json())
console.log(data)
```

如果仍然出現 401，請繼續下一步。

---

## 🔍 深度排查

### 檢查 1：測試 Supabase 連線

在 Console 中執行：

```javascript
// 測試 Supabase 是否正確連接
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

應該顯示：
```
Supabase URL: https://xxxxx.supabase.co
Anon Key exists: true
```

---

### 檢查 2：手動測試匿名登入

在 Supabase Dashboard > SQL Editor 執行：

```sql
-- 查看是否有匿名用戶
SELECT
  id,
  email,
  created_at,
  is_anonymous
FROM auth.users
WHERE is_anonymous = true
ORDER BY created_at DESC
LIMIT 5;
```

如果沒有任何結果，說明匿名登入從未成功過。

---

### 檢查 3：檢查 RLS 政策

在 Supabase Dashboard > SQL Editor 執行：

```sql
-- 檢查 signals 表的 RLS 政策
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
WHERE tablename = 'signals';
```

應該能看到類似的政策：
- `Authenticated users can create signals`
- `Signals are viewable by everyone (24h)`

---

## 🎯 最可能的原因與解決方案

### 原因 1：Anonymous Sign-in 未啟用（最常見）

**症狀**：
```
❌ 匿名登入錯誤: {code: "anonymous_provider_disabled", ...}
```

**解決方案**：
前往 Supabase Dashboard > Authentication > Providers，啟用 Anonymous Sign-in。

---

### 原因 2：環境變數錯誤

**症狀**：
```
Supabase URL: undefined
```

**解決方案**：
1. 確認 `.env.local` 存在且正確
2. 重新啟動開發伺服器

---

### 原因 3：Cookie 問題

**症狀**：認證成功但 401 仍然出現

**解決方案**：
清除所有 Cookie 或使用無痕視窗。

---

### 原因 4：Supabase URL 不匹配

**症狀**：401 且無任何錯誤訊息

**解決方案**：
確認 `.env.local` 中的 URL 與 Supabase Dashboard 一致。

---

## ✅ 驗證修復成功

修復後，重新測試發布訊號：

1. 訪問 http://localhost:3001/lobby
2. 檢查頁面是否顯示 **用戶 ID: xxxxxxxx...**
3. 點擊發布訊號
4. 應該看到：
   ```
   ✅ 發布成功: {id: "...", ...}
   ```
5. 彈出提示：**「訊號發布成功！」**
6. 訊號出現在列表中

---

## 📞 仍然無法解決？

請提供以下資訊：

1. **Console 完整日誌**（從載入頁面開始）
2. **Supabase Anonymous Sign-in 是否已啟用**（截圖）
3. **`.env.local` 的內容**（隱藏敏感資訊）
4. **終端機的錯誤訊息**

我會立即幫您診斷並解決！
