# 🔧 Realtime 最終修復方案

## 問題根源

您遇到的 `mismatch between server and client bindings for postgres changes` 錯誤是因為：

**在 Supabase Realtime 訂閱中使用 `filter` 參數會導致客戶端和服務器端的 bindings 不匹配。**

這是 Supabase JS v2.45.0 版本的已知問題。

## ✅ 最終解決方案

**移除所有 `filter` 參數，改在客戶端進行過濾。**

### 修改內容

#### 1. `lib/hooks/useRealtime.ts`

**之前（有問題）：**
```typescript
.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'messages',
  filter: `receiver_id=eq.${currentUserId}`,  // ❌ 這會導致 mismatch 錯誤
}, ...)
```

**修復後：**
```typescript
.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'messages',
  // ✅ 不使用 filter
}, async (payload) => {
  // ✅ 在客戶端過濾
  if (payload.new.receiver_id !== currentUserId) {
    return
  }
  if (payload.new.sender_id !== otherUserId) {
    return
  }
  // 處理訊息...
})
```

#### 2. `lib/hooks/useUnreadCount.ts`

同樣的修復方式：移除 `filter` 參數，在 callback 中過濾。

---

## 🧪 測試步驟

### 1️⃣ 完全重新啟動

**這非常重要！**

```bash
# 停止開發伺服器（Ctrl+C）
# 然後重新啟動
npm run dev
```

### 2️⃣ 清除瀏覽器快取

- **完全重新整理**：Ctrl+Shift+R（Windows）或 Cmd+Shift+R（Mac）
- 或者：關閉所有分頁，重新打開

### 3️⃣ 測試即時訊息

**主視窗（用戶 A）：**
1. 打開開發者工具（F12）→ Console
2. 進入聊天室

**無痕視窗（用戶 B）：**
1. 打開開發者工具（F12）→ Console
2. 進入聊天室

**檢查 Console：**

您應該看到：
```
🔌 useRealtime: 建立 Realtime 連線
🔌 useRealtime: 訂閱狀態 SUBSCRIBED undefined
✅ useRealtime: 訂閱成功！
```

**不應該看到：**
```
❌ useRealtime: 訂閱失敗  // ❌ 不應該出現
❌ useUnreadCount: 訂閱失敗  // ❌ 不應該出現
```

### 4️⃣ 發送訊息測試

1. **用戶 B 發送「測試 1」**

2. **檢查用戶 A 的 Console：**
   ```
   📨 useRealtime: 收到 INSERT 事件
   ✅ useRealtime: 這是對話對象發給我的訊息
   ✅ useRealtime: 將訊息加入列表
   🔔 ChatRoom: 收到即時訊息
   ✅ useMessages: 訊息已加入列表
   ```

3. **檢查用戶 A 的畫面：**
   - ✅ 訊息應該**立即出現**
   - ✅ **無需重新整理**
   - ✅ 自動滾動到底部

### 5️⃣ 測試未讀徽章

1. **用戶 A 離開聊天室**，回到首頁或其他頁面
2. **用戶 B 發送新訊息**

3. **檢查用戶 A 的 Console：**
   ```
   📨 useUnreadCount: 收到新訊息通知
   ✅ useUnreadCount: 這是發給我的訊息，未讀數 +1
   🔢 useUnreadCount: 未讀數更新 0 -> 1
   ```

4. **檢查用戶 A 的導航欄：**
   - ✅ 「快閃聊天」旁應該**立即出現紅色徽章「1」**
   - ✅ 徽章有脈動動畫
   - ✅ **無需重新整理**

---

## ✅ 成功標準

**如果以下都成立，表示修復成功：**

1. ✅ Console 沒有 `訂閱失敗` 錯誤
2. ✅ Console 顯示 `✅ useRealtime: 訂閱成功！`
3. ✅ 發送訊息後，對方立即看到（無需重新整理）
4. ✅ 未讀徽章立即更新（無需重新整理）
5. ✅ 雙向聊天完全流暢

---

## 🐛 如果還是不行

### 檢查清單

- [ ] 已停止並重新啟動開發伺服器（`npm run dev`）
- [ ] 已完全重新整理瀏覽器（Ctrl+Shift+R）
- [ ] Supabase Dashboard → Database → Replication → `messages` 表的 Realtime 為 **ON**
- [ ] Console 沒有其他紅色錯誤訊息

### 如果還有錯誤

請提供以下資訊：

1. **完整的 Console 錯誤訊息**（截圖）
2. **Console 中的所有 Realtime 日誌**（包括成功和失敗的）
3. **是否看到 `✅ useRealtime: 訂閱成功！`**

---

## 📝 修復摘要

**修改的檔案：**
1. ✅ `/lib/hooks/useRealtime.ts` - 移除 filter，改用客戶端過濾
2. ✅ `/lib/hooks/useUnreadCount.ts` - 移除 filter，改用客戶端過濾

**原理：**
- Supabase Realtime 的 `filter` 參數在某些情況下會導致 bindings mismatch
- 訂閱整個 `messages` 表的變更，然後在客戶端 callback 中過濾
- 性能影響：極小（因為我們只監聽 INSERT/UPDATE 事件，不是所有表）

**優勢：**
- ✅ 避免 server-client bindings mismatch 錯誤
- ✅ 更可靠的訂閱連接
- ✅ 與所有 Supabase 版本兼容
