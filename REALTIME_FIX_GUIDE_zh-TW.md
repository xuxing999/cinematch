# 🔧 Supabase Realtime 修復完整指南

## 📊 診斷結果

經過完整的程式碼審查，我發現：

### ✅ 前端程式碼：完全正確
- ✅ `useRealtime.ts` - 訂閱邏輯正確
- ✅ `useUnreadCount.ts` - 訂閱邏輯正確
- ✅ `ConversationList.tsx` - 訂閱邏輯正確
- ✅ `Navbar.tsx` & `BottomNav.tsx` - 氣泡通知邏輯正確
- ✅ 所有訂閱都使用正確的 `schema: 'public'` 和 `table: 'messages'`

### ⚠️ 後端配置：需要修復
- ⚠️ **Realtime Publication 可能未正確設定**
- ⚠️ **RLS 政策需要額外的 Realtime 專用政策**

---

## 🛠️ 修復步驟

### **步驟 1：執行修復 SQL**

我已經為你生成了修復 SQL 檔案：`fix_realtime.sql`

請按照以下步驟執行：

#### 方法 A：使用 Supabase Dashboard（推薦）

1. 前往你的 Supabase 專案：
   ```
   https://app.supabase.com/project/wphhfdfrqqbgzumohdxj
   ```

2. 點選左側選單的 **SQL Editor**

3. 點選 **New Query** 建立新查詢

4. 將 `fix_realtime.sql` 的內容複製貼上到編輯器中

5. 點選 **Run** 執行

6. 檢查執行結果：
   - 應該會看到 `realtime_diagnostic` 檢視的查詢結果
   - 確認 `in_publication` 欄位顯示 `true`

#### 方法 B：使用 Supabase CLI（進階）

```bash
# 如果你有安裝 Supabase CLI
supabase db execute --file fix_realtime.sql
```

---

### **步驟 2：確認 Replication 設定**

即使執行了 SQL，你仍需要在 Dashboard 中手動確認：

1. 前往 **Database** → **Replication**

2. 找到 **`messages`** 表格

3. 確認以下設定：
   - ✅ **Source** 欄位中的 `supabase_realtime` 有勾選
   - ✅ **Realtime** 開關是 **ON**

4. 對 **`signals`** 表格做同樣的確認

5. 如果有任何變更，點選 **Save** 儲存

---

### **步驟 3：驗證 RLS 政策**

執行 SQL 後，你的 `messages` 表應該會有以下 RLS 政策：

1. **"Users can view own messages (24h)"**
   - 類型：SELECT
   - 條件：`(auth.uid() = sender_id OR auth.uid() = receiver_id) AND created_at > NOW() - INTERVAL '24 hours'`

2. **"Realtime: Users receive messages sent to them"** ⭐（新增）
   - 類型：SELECT
   - 條件：`auth.uid() = receiver_id`
   - 用途：確保 Realtime 系統可以正確廣播訊息給接收者

檢查方式：
- 前往 **Database** → **Tables** → **messages**
- 點選 **Policies** 標籤
- 確認上述兩個政策都存在

---

### **步驟 4：重新啟動應用程式**

1. **停止開發伺服器**（如果正在執行）：
   - 在終端機按 `Ctrl+C`

2. **清除 Next.js 快取**：
   ```bash
   rm -rf .next
   ```

3. **重新啟動**：
   ```bash
   npm run dev
   ```

4. **完全重新整理瀏覽器**：
   - 按 `Cmd+Shift+R`（Mac）或 `Ctrl+Shift+R`（Windows/Linux）
   - 或按 `F12` 開啟開發者工具 → 右鍵點擊重新整理按鈕 → 選擇「清空快取並強制重新整理」

---

## 🧪 測試步驟

### **測試 1：使用測試頁面**

1. 前往 **http://localhost:3000/test-realtime**

2. 檢查狀態：
   - ✅ 應該顯示 **`SUBSCRIBED`**（綠色指示燈）
   - ❌ 如果顯示 **`CHANNEL_ERROR`**（紅色），表示還有問題

3. 打開**另一個瀏覽器視窗**（無痕模式）

4. 在無痕視窗登入並發送訊息

5. 回到測試頁面，應該會看到：
   ```
   [時間] 📨 收到新訊息！ID: xxx
   [時間]    內容: xxx
   [時間]    發送者: xxx
   ```

### **測試 2：實際聊天測試**

1. 開啟**兩個瀏覽器視窗**（一個正常 + 一個無痕）

2. 分別登入不同的帳號

3. 在視窗 A 發送訊息給視窗 B

4. **✅ 視窗 B 應該立即收到訊息，不需要重新整理**

5. **✅ 視窗 B 的導航列「快閃聊天」應該出現紅色數字提示**

### **測試 3：檢查瀏覽器 Console**

按 `F12` 開啟開發者工具，應該會看到這些 log：

```
🔌 useUnreadCount: 建立 Realtime 連線 37aa859c
🔌 useUnreadCount: 訂閱狀態 SUBSCRIBED undefined
✅ useUnreadCount: 訂閱成功！
🔌 ConversationList: 建立 Realtime 連線 37aa859c
✅ ConversationList: 訂閱成功！
🔌 useRealtime: 建立 Realtime 連線 { currentUserId: '...', otherUserId: '...' }
✅ useRealtime: 訂閱成功！
```

當收到新訊息時：
```
📨 useUnreadCount: 收到新訊息通知 { id: '...', ... }
🔢 useUnreadCount: 未讀數更新 0 -> 1
📨 ConversationList: 收到新訊息，刷新對話列表
📨 useRealtime: 收到 INSERT 事件 { id: '...', ... }
✅ useRealtime: 將訊息加入列表 xxx
```

---

## 🔍 故障排除

### **問題 1：訂閱狀態顯示 `CHANNEL_ERROR`**

**原因：** Realtime 未正確啟用或 Publication 設定錯誤

**解決方案：**
1. 重新執行 `fix_realtime.sql`
2. 在 Supabase Dashboard 手動檢查 Database → Replication
3. 確認 `messages` 表的 `supabase_realtime` 有勾選

### **問題 2：訂閱成功但收不到訊息**

**原因：** RLS 政策阻擋了 Realtime 廣播

**解決方案：**
1. 檢查是否有新的 RLS 政策：**"Realtime: Users receive messages sent to them"**
2. 如果沒有，手動執行以下 SQL：
   ```sql
   CREATE POLICY "Realtime: Users receive messages sent to them"
     ON public.messages FOR SELECT
     TO authenticated
     USING (auth.uid() = receiver_id);
   ```

### **問題 3：只有發送者看到訊息，接收者看不到**

**原因：** RLS 政策只允許 `sender_id` 讀取，沒有允許 `receiver_id`

**解決方案：**
1. 檢查現有的 RLS 政策是否包含 `OR auth.uid() = receiver_id`
2. 執行以下 SQL 修正：
   ```sql
   DROP POLICY IF EXISTS "Users can view own messages (24h)" ON public.messages;

   CREATE POLICY "Users can view own messages (24h)"
     ON public.messages FOR SELECT
     USING (
       (auth.uid() = sender_id OR auth.uid() = receiver_id)
       AND created_at > NOW() - INTERVAL '24 hours'
     );
   ```

### **問題 4：氣泡通知不出現**

**原因：** `useUnreadCount` 訂閱失敗或未正確監聽

**檢查：**
1. 打開瀏覽器 Console（F12）
2. 搜尋 `useUnreadCount`
3. 應該會看到 `✅ useUnreadCount: 訂閱成功！`

**如果沒有：**
- 重新執行 `fix_realtime.sql`
- 確認 RLS 政策包含接收者權限

### **問題 5：Supabase Dashboard 找不到 Replication 選單**

**原因：** 你的 Supabase 專案可能使用舊版介面

**解決方案：**
1. 嘗試直接執行 SQL：
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
   ```
2. 或聯繫 Supabase 支援確認 Realtime 功能是否已啟用

---

## 📚 技術說明

### **為什麼需要 Publication？**

Supabase Realtime 使用 PostgreSQL 的 Logical Replication 功能。要讓表格的變更能被即時廣播，該表格必須被加入 `supabase_realtime` publication。

在 Dashboard 開啟 Realtime 開關 ≠ 加入 Publication（某些版本可能會自動加入，但不保證）

### **RLS 如何影響 Realtime？**

當 Realtime 廣播一個 INSERT 事件時：
1. 訂閱者的瀏覽器收到通知
2. Supabase 檢查該訂閱者是否有權限 **SELECT** 這筆資料（RLS 檢查）
3. 如果有權限，才會真正傳送給客戶端
4. 如果沒有權限，該事件會被靜默丟棄

這就是為什麼我們需要確保 RLS 政策允許接收者讀取訊息！

### **為什麼需要額外的 Realtime 政策？**

標準的 RLS 政策已經允許使用者讀取自己的訊息，但有時 Realtime 系統需要更明確的政策才能正確運作。

新增的政策：
```sql
CREATE POLICY "Realtime: Users receive messages sent to them"
  ON public.messages FOR SELECT
  TO authenticated
  USING (auth.uid() = receiver_id);
```

這確保了當 B 發送訊息給 A 時，Realtime 系統知道要廣播給 A。

---

## ✅ 完成檢查清單

在完成所有步驟後，請確認：

- [ ] 已執行 `fix_realtime.sql`
- [ ] Supabase Dashboard → Database → Replication → messages 的 Realtime 是 ON
- [ ] 已重新啟動開發伺服器和瀏覽器
- [ ] 測試頁面顯示 `SUBSCRIBED` 狀態
- [ ] 兩個瀏覽器之間可以即時收發訊息
- [ ] 收到新訊息時，導航列的氣泡會出現
- [ ] 瀏覽器 Console 顯示「訂閱成功」的訊息

---

## 🆘 還是不行？

如果完成所有步驟後仍然無法運作，請提供以下資訊：

1. **測試頁面的狀態**：http://localhost:3000/test-realtime 顯示什麼？

2. **瀏覽器 Console 的完整輸出**（按 F12）

3. **診斷檢視的結果**：
   ```sql
   SELECT * FROM realtime_diagnostic;
   ```

4. **RLS 政策列表**：
   ```sql
   SELECT policyname, cmd, qual
   FROM pg_policies
   WHERE tablename = 'messages';
   ```

我可以根據這些資訊進一步協助你！🚀
