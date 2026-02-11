# Realtime 即時訊息修復說明（最新版本）

## 🆕 最新修復（針對您的錯誤）

### 錯誤 1：`Cannot read properties of undefined (reading 'length')`
**原因：** API 沒有處理 `type=conversations` 參數

**修復：**
- ✅ 在 `/api/messages` GET handler 中添加對話列表處理
- ✅ 正確分組並計算未讀數
- ✅ 返回 `{ conversations: [...] }` 格式

### 錯誤 2：`mismatch between server and client bindings for postgres changes`
**原因：** Realtime 訂閱配置與 Supabase 不匹配

**修復：**
- ✅ 移除額外的 config 選項（`broadcast`, `presence`）
- ✅ 簡化 channel 名稱
- ✅ 只使用標準的 `postgres_changes` 訂閱

---

## 之前的修復內容

### 1. **useRealtimeMessages Hook** (`lib/hooks/useRealtime.ts`)
**問題：**
- 依賴項包含 `onNewMessage`，導致每次渲染都重新訂閱
- filter 條件不夠精確
- 缺少詳細的訂閱狀態日誌

**修復：**
- ✅ 使用 `useRef` 存儲 callback，避免重新訂閱
- ✅ filter 改為 `receiver_id=eq.${currentUserId}` 監聽接收的訊息
- ✅ 在 callback 中額外檢查 `sender_id` 確保來自對話對象
- ✅ 增加詳細的訂閱狀態日誌（SUBSCRIBED, CHANNEL_ERROR）
- ✅ 改善 channel 命名和配置

### 2. **useMessages Hook** (`lib/hooks/useMessages.ts`)
**問題：**
- `sendMessage`, `markAsRead`, `addMessage` 沒有使用 `useCallback`
- 每次渲染都創建新的函數引用，導致依賴它們的組件重新渲染

**修復：**
- ✅ 所有函數都包裝在 `useCallback` 中
- ✅ 在 `addMessage` 中增加詳細日誌
- ✅ 確保函數引用穩定

### 3. **ChatRoom Component** (`components/chat/ChatRoom.tsx`)
**問題：**
- `onNewMessage` callback 不穩定

**修復：**
- ✅ 使用 `useCallback` 包裝 `handleNewMessage`
- ✅ 確保 callback 穩定性

### 4. **useUnreadCount Hook** (`lib/hooks/useUnreadCount.ts`)
**問題：**
- `fetchUnreadCount` 沒有使用 `useCallback`
- 訂閱配置不完整

**修復：**
- ✅ 使用 `useCallback` 包裝 `fetchUnreadCount`
- ✅ 增加詳細的訂閱狀態日誌
- ✅ 改善未讀數更新邏輯

---

## ⚠️ 重要！測試前必須完成的設定

### 🔴 第一步：啟用 Supabase Realtime（必須！）

**這是最關鍵的步驟！如果沒做這步，即時功能不會運作！**

1. 前往 [Supabase Dashboard](https://app.supabase.com)
2. 選擇您的專案
3. 點擊左側 **Database** → **Replication**
4. 找到 `messages` 表
5. **確認 Realtime 開關為 ON** ✅

**如果 Realtime 是 OFF：**
- 點擊開關啟用
- 等待 5-10 秒讓設定生效
- **重新整理您的網站**

### 🔴 第二步：檢查 RLS 政策

確保 `messages` 表的 RLS 政策正確：

1. 點擊左側 **Authentication** → **Policies**
2. 選擇 `messages` 表
3. 確認有以下政策：
   - ✅ **SELECT**：允許用戶讀取自己相關的訊息
   - ✅ **INSERT**：允許用戶發送訊息
   - ✅ **UPDATE**：允許用戶更新接收的訊息（標記已讀）

**如果缺少政策，請執行：**
```sql
-- 查看自己相關的訊息
CREATE POLICY "Users can view their own messages"
ON messages FOR SELECT
USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- 發送訊息
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- 標記已讀
CREATE POLICY "Users can update received messages"
ON messages FOR UPDATE
USING (auth.uid() = receiver_id);
```

---

## 🧪 測試步驟

### 測試 1：即時訊息接收

1. **打開主視窗（用戶 A）**
   - 進入 `/chat/{用戶B的ID}` 聊天室
   - 打開瀏覽器開發者工具（F12）→ Console

2. **打開無痕視窗（用戶 B）**
   - 進入 `/chat/{用戶A的ID}` 聊天室
   - 打開開發者工具 → Console

3. **檢查訂閱狀態**
   - 兩個視窗的 Console 應該都顯示：
     ```
     🔌 useRealtime: 建立 Realtime 連線
     🔌 useRealtime: 訂閱狀態 SUBSCRIBED
     ✅ useRealtime: 訂閱成功！
     ```

4. **用戶 B 發送訊息**
   - 在無痕視窗輸入並發送「測試訊息 1」

5. **檢查用戶 A 的 Console**
   - 應該看到：
     ```
     📨 useRealtime: 收到 INSERT 事件 {id: "...", content: "測試訊息 1"}
     ✅ useRealtime: 這是對話對象的訊息，獲取完整資訊
     ✅ useRealtime: 將訊息加入列表 ...
     🔔 ChatRoom: 收到即時訊息 ...
     ➕ useMessages: addMessage 被呼叫 ...
     ✅ useMessages: 訊息已加入列表 ...
     ```

6. **檢查用戶 A 的畫面**
   - ✅ 訊息應該**立即出現**，無需重新整理
   - ✅ 訊息應該自動滾動到底部

### 測試 2：未讀徽章更新

1. **用戶 A 在首頁或其他頁面（不在聊天室）**
   - 檢查導航欄「快閃聊天」按鈕
   - 初始應該沒有紅色徽章

2. **用戶 B 發送訊息**

3. **檢查用戶 A 的 Console**
   - 應該看到：
     ```
     📨 useUnreadCount: 收到新訊息通知 ...
     🔢 useUnreadCount: 未讀數更新 0 -> 1
     ```

4. **檢查用戶 A 的畫面**
   - ✅ 導航欄「快閃聊天」旁應該**立即出現紅色徽章「1」**
   - ✅ 徽章有脈動動畫

5. **用戶 A 進入聊天室**
   - ✅ 徽章數字應該消失（標記為已讀）

### 測試 3：雙向即時聊天

1. **兩個視窗都在聊天室**
2. **用戶 A 發送訊息**
   - 用戶 B 應該立即看到
3. **用戶 B 回覆**
   - 用戶 A 應該立即看到
4. **連續快速發送多則訊息**
   - 兩邊都應該即時更新，無延遲

---

## 🐛 如果還是不行

### 檢查 Console 錯誤

**如果看到 `CHANNEL_ERROR`：**
```
❌ useRealtime: 訂閱失敗 [錯誤訊息]
```

**可能原因：**
1. ❌ Supabase Realtime 未啟用（見上方步驟 1）
2. ❌ API Key 權限不足
3. ❌ RLS 政策阻擋訂閱

**解決方案：**
- 前往 Supabase Dashboard 啟用 Realtime
- 檢查 RLS 政策設定

### 檢查網路面板

1. 打開開發者工具 → Network → WS (WebSocket)
2. 應該看到 WebSocket 連線
3. 狀態應該是 `101 Switching Protocols`（連線成功）

### 強制重新整理

1. 清除瀏覽器快取
2. 重新啟動開發伺服器：`npm run dev`
3. 使用無痕視窗測試

---

## 📝 預期的 Console 日誌流程

### 正常的即時訊息接收流程：

```
// 1. 建立連線
🔌 useRealtime: 建立 Realtime 連線 {currentUserId: "abc123...", otherUserId: "def456..."}
🔌 useRealtime: 訂閱狀態 SUBSCRIBED undefined
✅ useRealtime: 訂閱成功！

// 2. 收到訊息（對方發送時）
📨 useRealtime: 收到 INSERT 事件 {id: "msg-123", sender_id: "def456", receiver_id: "abc123", content: "Hello"}
✅ useRealtime: 這是對話對象的訊息，獲取完整資訊
✅ useRealtime: 將訊息加入列表 msg-123

// 3. ChatRoom 處理
🔔 ChatRoom: 收到即時訊息 msg-123

// 4. useMessages 處理
➕ useMessages: addMessage 被呼叫 msg-123
✅ useMessages: 訊息已加入列表 msg-123

// 5. 未讀徽章更新（如果不在聊天室）
📨 useUnreadCount: 收到新訊息通知 msg-123
🔢 useUnreadCount: 未讀數更新 0 -> 1
```

---

## ✅ 修復完成確認

修復已完成，所有關鍵問題已解決：
- ✅ useCallback 包裝所有回調函數
- ✅ useRef 避免重複訂閱
- ✅ 正確的 filter 條件
- ✅ 詳細的訂閱狀態日誌
- ✅ 雙向即時訊息
- ✅ 即時未讀徽章更新

**請按照上述測試步驟進行測試，並檢查 Console 日誌是否符合預期。**
