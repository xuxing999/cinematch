# 🔍 訊號發布問題排查指南

## 請按照以下步驟檢查：

### 步驟 1：檢查瀏覽器 Console
1. 打開瀏覽器開發者工具（F12 或 右鍵 > 檢查）
2. 切換到 **Console** 面板
3. 發布一個訊號
4. 查看是否有紅色錯誤訊息

**請告訴我是否看到任何錯誤訊息？**

---

### 步驟 2：檢查 Network 請求
1. 開發者工具切換到 **Network** 面板
2. 發布一個訊號
3. 找到 `/api/signals` 的 POST 請求
4. 點擊該請求，查看：
   - Status Code（狀態碼）
   - Response（回應內容）

**請告訴我：**
- Status Code 是多少？（200, 401, 500?）
- Response 的內容是什麼？

---

### 步驟 3：檢查 Supabase 認證
在 Console 中執行：
```javascript
console.log(document.cookie)
```

看看是否有 Supabase 相關的 cookie。

---

## 可能的原因與解決方案

### 原因 1：用戶未登入（401 錯誤）
**症狀**：POST /api/signals 回傳 401 Unauthorized

**解決方案**：
- Supabase 匿名登入未正確執行
- 需要確認 AuthProvider 是否正常運作

### 原因 2：資料格式錯誤（500 錯誤）
**症狀**：POST /api/signals 回傳 500 Internal Server Error

**解決方案**：
- API 資料格式不正確
- 需要修正前端發送的資料

### 原因 3：RLS 政策阻擋（403 錯誤）
**症狀**：Supabase 回傳權限錯誤

**解決方案**：
- 檢查 Supabase RLS 政策
- 確認用戶有權限插入資料

---

請先執行上述檢查，然後告訴我結果，我會根據具體錯誤幫您解決！
