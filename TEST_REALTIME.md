# 🔍 Realtime 診斷指南

請按照以下步驟逐一檢查，並告訴我每一步的結果。

## 步驟 1：檢查 Supabase Dashboard

1. 前往 https://app.supabase.com
2. 選擇您的專案
3. 左側選單：**Database** → **Replication**
4. 找到 `messages` 表
5. **Realtime 開關必須是 ON** ✅

**請確認：messages 表的 Realtime 是 ON 嗎？**
- [ ] 是 ON
- [ ] 是 OFF
- [ ] 我找不到這個設定

---

## 步驟 2：檢查 Console 日誌（用戶 A）

1. 打開主視窗（用戶 A）
2. 按 F12 打開開發者工具
3. 切換到 Console 分頁
4. 清空 Console（點擊 🚫 圖示）
5. 進入聊天室（例如 `/chat/{用戶B的ID}`）

**請複製以下關鍵字的所有日誌：**

### 查找 "useRealtime: 建立 Realtime 連線"
```
您應該看到類似：
🔌 useRealtime: 建立 Realtime 連線 {currentUserId: "abc123...", otherUserId: "def456..."}
```

**您看到這個日誌了嗎？**
- [ ] 有看到
- [ ] 沒看到

---

### 查找 "useRealtime: 訂閱狀態"
```
您應該看到類似：
🔌 useRealtime: 訂閱狀態 SUBSCRIBED undefined
✅ useRealtime: 訂閱成功！
```

**您看到什麼？請完整複製貼上**

---

### 查找錯誤訊息
**是否看到以下任何錯誤？**
- [ ] `❌ useRealtime: 訂閱失敗`
- [ ] `CHANNEL_ERROR`
- [ ] `mismatch between server and client bindings`
- [ ] 其他錯誤（請複製完整錯誤訊息）

---

## 步驟 3：測試發送訊息（用戶 B）

1. 打開無痕視窗（用戶 B）
2. 按 F12 打開開發者工具
3. 進入與用戶 A 的聊天室
4. **發送一則訊息「測試 123」**

---

## 步驟 4：檢查用戶 A 的 Console

發送訊息後，立即查看用戶 A 的 Console。

**請複製以下日誌（如果有的話）：**

### 應該看到：
```
📨 useRealtime: 收到 INSERT 事件 {id: "...", sender_id: "...", content: "測試 123"}
✅ useRealtime: 這是對話對象發給我的訊息，獲取完整資訊
✅ useRealtime: 將訊息加入列表 ...
🔔 ChatRoom: 收到即時訊息 ...
```

**您看到這些日誌了嗎？**
- [ ] 全部都看到
- [ ] 部分看到（請告訴我看到哪些）
- [ ] 完全沒看到

---

## 步驟 5：檢查 Network 面板

1. 在 Console 旁邊，切換到 **Network** 分頁
2. 在過濾器中輸入 `WS`（WebSocket）
3. 刷新聊天室頁面

**您看到 WebSocket 連線嗎？**
- [ ] 看到，狀態是 101 Switching Protocols（綠色）
- [ ] 看到，但狀態是紅色或失敗
- [ ] 完全沒看到 WebSocket 連線

如果看到 WebSocket：
- 點擊它
- 切換到 **Messages** 分頁
- 請截圖給我看

---

## 步驟 6：檢查環境變數

在終端機執行：

```bash
cd /Users/awei/Desktop/CineMatch
cat .env.local | grep SUPABASE_URL
```

**請確認：**
- [ ] SUPABASE_URL 有值且看起來像 `https://xxxxx.supabase.co`
- [ ] SUPABASE_URL 沒有值或格式不對

---

## 步驟 7：重新啟動測試

如果上述步驟都沒問題，請：

1. **完全停止開發伺服器**（Ctrl+C）
2. **清除 Next.js 快取**：
   ```bash
   rm -rf .next
   ```
3. **重新啟動**：
   ```bash
   npm run dev
   ```
4. **完全關閉所有瀏覽器分頁**
5. **重新打開並測試**

---

## 📝 請回報結果

完成以上步驟後，請告訴我：

1. **步驟 1 結果**：Realtime 是 ON 還是 OFF？
2. **步驟 2 結果**：複製所有 Console 日誌
3. **步驟 4 結果**：發送訊息後有看到日誌嗎？
4. **步驟 5 結果**：有看到 WebSocket 連線嗎？

這些資訊可以幫我快速找到問題！
