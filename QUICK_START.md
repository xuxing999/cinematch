# 🚀 CineMatch 快速啟動指南

## 當前進度

✅ **第一階段**：環境與資料庫 - 已完成
✅ **第二階段**：核心 API 與基礎 - 已完成
✅ **第三階段-1**：訊號大廳頁面 - 已完成
⏳ **第三階段-2**：快閃聊天室 - 待開發
⏳ **第三階段-3**：個人資料頁面 - 待開發

---

## 📋 啟動前檢查清單

在啟動專案前，請確認以下項目：

- [ ] 已在 Supabase SQL Editor 執行 `supabase_schema.sql`
- [ ] 已啟用 Supabase Anonymous Sign-in
- [ ] 已啟用 Supabase Realtime（messages + signals 表）
- [ ] 已取得 TMDB API Key (v3)
- [ ] 已建立 `.env.local` 並填入所有環境變數

---

## ⚡ 快速啟動

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動開發伺服器

```bash
npm run dev
```

### 3. 訪問應用程式

打開瀏覽器，前往：**http://localhost:3000**

---

## 🎯 功能測試路徑

### 頁面 1：熱門雷達 (/)

**功能：** 顯示現正熱映電影 + 即時訊號數

**測試步驟：**
1. 訪問 http://localhost:3000
2. 確認能看到電影海報網格
3. 確認電影卡片顯示評分
4. 確認顯示訊號計數（如果有訊號）
5. 點擊任一電影，確認彈出詳情 Modal
6. 點擊 [查看訊號]，確認導向訊號大廳

**預期結果：**
- ✅ 顯示 TMDB 熱映電影
- ✅ 霓虹深色主題正常
- ✅ 導航欄正常運作
- ✅ 手機版底部導航正常

---

### 頁面 2：訊號大廳 (/lobby)

**功能：** 發布/瀏覽/篩選/刪除揪團訊號

**測試步驟：**

#### A. 發布訊號
1. 點擊右下角 **[+]** 浮動按鈕
2. 在搜尋框輸入電影名稱（例如：沙丘）
3. 等待搜尋結果，點擊選擇電影
4. 選擇意圖標籤（例如：🎟️ 我有票）
5. 填寫影城名稱（選填）：例如「信義威秀」
6. 選擇場次時間（選填）
7. 輸入備註（選填）：例如「有買一送一票券」
8. 點擊 **[發布訊號]**

**預期結果：**
- ✅ Modal 關閉
- ✅ 新訊號出現在列表最上方
- ✅ 訊號卡片顯示所有資訊
- ✅ 顯示「這是您的訊號」
- ✅ 顯示刪除按鈕

#### B. 篩選訊號
1. 點擊不同的標籤按鈕（我有票、求壯膽、純看片、想討論）
2. 確認列表即時更新
3. 確認標籤數量正確

**預期結果：**
- ✅ 篩選即時生效
- ✅ 選中標籤高亮顯示
- ✅ 數量正確顯示

#### C. 刪除訊號
1. 找到自己發布的訊號
2. 點擊刪除按鈕（🗑️）
3. 確認彈出警告對話框
4. 點擊確定

**預期結果：**
- ✅ 訊號從列表消失
- ✅ 統計數量更新

#### D. 聯絡功能
1. 使用無痕視窗（或其他瀏覽器）訪問 /lobby
2. 系統會自動建立新的匿名用戶
3. 點擊第一個用戶的訊號上的 **[💬 聯絡 TA]**
4. 確認導向 `/chat/[userId]`

**預期結果：**
- ✅ 成功導向聊天頁面
- ✅ 顯示「頁面建置中」（聊天功能尚未實作）

---

## 🐛 常見問題排查

### 問題 1：電影海報無法顯示

**可能原因：**
- TMDB API Key 未正確設定
- next.config.js 未配置圖片域名

**解決方案：**
1. 確認 `.env.local` 中 `NEXT_PUBLIC_TMDB_API_KEY` 正確
2. 檢查 `next.config.js` 中的 `images.remotePatterns` 設定
3. 重啟開發伺服器

---

### 問題 2：無法發布訊號（401 錯誤）

**可能原因：**
- Supabase 匿名登入未啟用
- 用戶認證失效

**解決方案：**
1. 前往 Supabase Dashboard > Authentication > Providers
2. 確認 **Anonymous Sign-in** 已啟用
3. 清除瀏覽器 Cookie 後重新載入
4. 檢查瀏覽器 Console 是否有錯誤訊息

---

### 問題 3：訊號列表為空

**可能原因：**
- 資料庫表格未建立
- RLS 政策阻擋讀取

**解決方案：**
1. 確認已執行 `supabase_schema.sql`
2. 前往 Supabase Dashboard > Database > Tables
3. 確認 `signals` 表存在
4. 檢查 RLS 政策是否正確

---

### 問題 4：搜尋電影無結果

**可能原因：**
- TMDB API Key 錯誤
- 網路連線問題

**解決方案：**
1. 打開瀏覽器 DevTools > Network 面板
2. 搜尋電影時查看 `/api/tmdb/search` 請求
3. 檢查回應狀態碼與錯誤訊息
4. 確認 TMDB API Key 未過期

---

## 📊 資料庫驗證

如果功能異常，可直接查詢 Supabase 資料庫：

### 查詢所有訊號

```sql
SELECT
  s.*,
  p.display_name,
  p.avatar_url
FROM signals s
LEFT JOIN profiles p ON s.user_id = p.id
WHERE s.created_at > NOW() - INTERVAL '24 hours'
ORDER BY s.created_at DESC;
```

### 查詢所有用戶

```sql
SELECT * FROM profiles ORDER BY created_at DESC;
```

### 手動清理過期訊號

```sql
SELECT cleanup_expired_data();
```

---

## 🎨 自定義主題

如果您想調整霓虹色彩，編輯 `tailwind.config.ts`：

```typescript
colors: {
  neon: {
    red: '#e50914',    // 主色調（紅）
    pink: '#ff006e',   // 我有票
    purple: '#8338ec', // 求壯膽
    blue: '#3a86ff',   // 想討論
    cyan: '#06ffa5',   // 純看片
  },
}
```

---

## 📞 需要協助？

如果遇到任何問題：

1. 檢查瀏覽器 Console 的錯誤訊息
2. 檢查終端機的伺服器日誌
3. 查看 `LOBBY_COMPLETED.md` 的完整功能說明
4. 查看 `SETUP_GUIDE.md` 的詳細配置步驟

---

## ✨ 下一步

訊號大廳已完成，準備好繼續開發 **快閃聊天室** 了嗎？

聊天室功能將包含：
- 📱 對話列表頁面
- 💬 一對一即時聊天
- ⚡ Supabase Realtime 即時通訊
- ⏰ 24 小時訊息自動銷毀提示
- 🔔 未讀訊息計數

告訴我您準備好了，我們立即開始！
