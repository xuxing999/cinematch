# 🐛 Bug 修復記錄

## Bug #1: 選擇標籤後自動提交表單

### 問題描述
用戶在「發布訊號」表單中，選擇完意圖標籤後，表單就自動提交了，無法填寫其他欄位（影城名稱、場次時間、備註）。

### 問題原因
HTML 表單中的 `<button>` 元素，如果沒有明確指定 `type` 屬性，預設會是 `type="submit"`。當用戶點擊標籤選擇器中的按鈕時，會觸發表單的提交事件。

### 受影響的組件
1. `components/lobby/TagSelector.tsx` - 標籤選擇器
2. `components/lobby/MovieSearch.tsx` - 電影搜尋（選擇電影、清除按鈕）

### 修復方案
在所有非提交按鈕上添加 `type="button"` 屬性，明確告訴瀏覽器這些按鈕不是提交按鈕。

### 修改內容

#### 1. TagSelector.tsx
```tsx
// 修改前
<button
  key={tag.value}
  onClick={() => onSelectTag(tag.value)}
  ...
>

// 修改後
<button
  key={tag.value}
  type="button"  // ← 新增此行
  onClick={() => onSelectTag(tag.value)}
  ...
>
```

#### 2. MovieSearch.tsx
兩處修改：

**清除選擇按鈕：**
```tsx
// 修改前
<button
  onClick={() => onSelectMovie(null!)}
  ...
>

// 修改後
<button
  type="button"  // ← 新增此行
  onClick={() => onSelectMovie(null!)}
  ...
>
```

**下拉選單選擇按鈕：**
```tsx
// 修改前
<button
  key={movie.id}
  onClick={() => handleSelectMovie(movie)}
  ...
>

// 修改後
<button
  key={movie.id}
  type="button"  // ← 新增此行
  onClick={() => handleSelectMovie(movie)}
  ...
>
```

### 驗證步驟
1. 訪問 http://localhost:3001/lobby
2. 點擊右下角 [+] 按鈕開啟「發布訊號」表單
3. 搜尋並選擇一部電影
4. 點擊任一意圖標籤（例如：🎟️ 我有票）
5. **確認表單沒有自動提交**
6. 繼續填寫影城名稱、場次時間、備註
7. 點擊最下方的 **[發布訊號]** 按鈕
8. **確認訊號成功發布並出現在列表中**

### 測試結果
✅ 修復成功
- 選擇標籤後不再自動提交
- 用戶可以正常填寫所有欄位
- 點擊最下方按鈕才會提交表單

---

## Bug #2: 401 Unauthorized（已解決）

### 問題描述
用戶發布訊號時收到 `401 Unauthorized` 錯誤，無法建立訊號。

### 問題原因
Supabase 匿名登入未成功執行，可能的原因：
1. Supabase Dashboard 中未啟用 Anonymous Sign-in
2. Cookie 問題
3. 環境變數設定錯誤

### 修復方案
1. 添加詳細的認證日誌（AuthProvider）
2. 確認 Supabase Anonymous Sign-in 已啟用
3. 清除瀏覽器 Cookie
4. 重新啟動開發伺服器

### 調試增強
添加了以下日誌：
- `🔐 AuthProvider: 檢查用戶認證狀態...`
- `✅ AuthProvider: 用戶已登入`
- `⚠️ AuthProvider: 無用戶，開始匿名登入...`
- `✅ 匿名登入成功`
- `🔄 AuthProvider: 認證狀態變化`

### 驗證步驟
1. 打開瀏覽器 Console
2. 重新載入頁面
3. 查看是否出現 `✅ AuthProvider: 用戶已登入` 或 `✅ 匿名登入成功`
4. 頁面標題下方應顯示 `用戶 ID: xxxxxxxx...`
5. 發布訊號時不再出現 401 錯誤

### 測試結果
✅ 修復成功
- 匿名登入正常運作
- 訊號成功發布
- 列表即時更新

---

## 改進項目

### 1. 移除干擾性彈窗
**修改前：**
發布成功後會彈出 `alert('訊號發布成功！')`

**修改後：**
移除彈窗提示，訊號會自動出現在列表中，提供更流暢的使用體驗。

**理由：**
- 訊號已經即時出現在列表中，用戶可以看到
- 不需要額外的確認步驟
- 減少干擾，提升 UX

### 2. 保留調試日誌
在開發階段保留 Console 日誌，便於排查問題：
- `🚀 開始發布訊號`
- `✅ 發布成功`
- `❌ 發布失敗`

這些日誌在生產環境可以透過環境變數控制是否顯示。

---

## 下次開發注意事項

### HTML 表單最佳實踐
1. **明確指定按鈕類型：**
   - 提交按鈕：`<button type="submit">`
   - 普通按鈕：`<button type="button">`
   - 重置按鈕：`<button type="reset">`

2. **表單內的所有非提交按鈕都應該加上 `type="button"`**

3. **常見需要加 `type="button"` 的場景：**
   - 標籤選擇器
   - 搜尋下拉選單
   - Modal 關閉按鈕
   - 刪除按鈕
   - 清除/重置按鈕（非 reset type）

### React 表單開發檢查清單
- [ ] 所有 `<button>` 都有明確的 `type` 屬性
- [ ] 表單提交邏輯使用 `onSubmit` 事件
- [ ] 提交處理函數中調用 `e.preventDefault()`
- [ ] 表單驗證邏輯完整
- [ ] 錯誤訊息清晰易懂
- [ ] 提交中狀態（loading）正確顯示
- [ ] 成功/失敗的使用者回饋適當

---

## 總結

兩個主要問題都已修復：
1. ✅ 表單自動提交問題（type="button"）
2. ✅ 401 認證錯誤（匿名登入）

現在訊號大廳功能完全正常：
- ✅ 可以搜尋並選擇電影
- ✅ 可以選擇意圖標籤
- ✅ 可以填寫完整資訊
- ✅ 可以成功發布訊號
- ✅ 訊號即時出現在列表中
- ✅ 可以查看、篩選、刪除訊號

下一步可以繼續開發快閃聊天室功能！
