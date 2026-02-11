# CineMatch 環境建置指南

## 📋 前置準備

在開始之前，請確保您已擁有以下帳號：

1. **Supabase 帳號**：https://supabase.com/
2. **TMDB 帳號**：https://www.themoviedb.org/
3. **Vercel 帳號**（部署用）：https://vercel.com/

---

## 🗄️ 步驟一：建立 Supabase 專案

### 1.1 建立新專案
1. 登入 Supabase Dashboard
2. 點擊 **New Project**
3. 填寫專案資訊：
   - Name: `CineMatch`
   - Database Password: 請設定強密碼並妥善保存
   - Region: 選擇 `Northeast Asia (Tokyo)` 或離您最近的區域

### 1.2 執行 SQL 腳本
1. 等待專案建立完成（約 2 分鐘）
2. 進入 **SQL Editor**（左側選單）
3. 點擊 **New Query**
4. 複製 `supabase_schema.sql` 的完整內容
5. 貼上後點擊 **Run**
6. 確認執行成功（應顯示 "Success. No rows returned"）

### 1.3 啟用匿名登入
1. 進入 **Authentication** > **Providers**（左側選單）
2. 找到 **Anonymous Sign-in**
3. 點擊右側的開關，啟用此功能
4. 點擊 **Save**

### 1.4 啟用 Realtime
1. 進入 **Database** > **Replication**（左側選單）
2. 找到 `messages` 表，點擊右側的 **Enabled** 開關
3. 找到 `signals` 表，同樣啟用
4. 點擊 **Save**

### 1.5 取得 API 金鑰
1. 進入 **Settings** > **API**（左側選單）
2. 複製以下資訊：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **重要提醒**：`service_role` 金鑰擁有完整權限，切勿暴露於客戶端或提交到 Git！

---

## 🎬 步驟二：取得 TMDB API 金鑰

### 2.1 註冊開發者帳號
1. 前往 https://www.themoviedb.org/
2. 點擊右上角 **Join TMDB**（如已有帳號請直接登入）
3. 完成註冊流程

### 2.2 申請 API Key
1. 登入後，點擊右上角頭像 > **Settings**
2. 左側選單選擇 **API**
3. 點擊 **Create** > **Developer**
4. 填寫申請表單：
   - Type of Use: `Website`
   - Application Name: `CineMatch`
   - Application URL: `http://localhost:3000`（開發時使用）
   - Application Summary: `A flash social app for movie matching`
5. 同意條款後提交
6. 複製 **API Key (v3 auth)** → `NEXT_PUBLIC_TMDB_API_KEY`

---

## ⚙️ 步驟三：設定環境變數

### 3.1 建立 .env.local
```bash
# 在專案根目錄執行
cp .env.example .env.local
```

### 3.2 填入實際的 API 金鑰
用文字編輯器開啟 `.env.local`，填入您在步驟一、二取得的值：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# TMDB
NEXT_PUBLIC_TMDB_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.3 確認設定
- 確保 `.env.local` 已加入 `.gitignore`（預設已包含）
- 切勿將 `.env.local` 提交到版本控制

---

## 🚀 步驟四：安裝依賴並啟動專案

### 4.1 安裝依賴
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 4.2 啟動開發伺服器
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

### 4.3 開啟瀏覽器
訪問 http://localhost:3000，應該可以看到 CineMatch 首頁。

---

## ✅ 驗證設定

### 檢查清單
- [ ] Supabase 專案已建立
- [ ] SQL 腳本執行成功
- [ ] 匿名登入已啟用
- [ ] Realtime 已啟用（messages + signals）
- [ ] TMDB API 金鑰已取得
- [ ] .env.local 已正確設定
- [ ] 依賴已安裝完成
- [ ] 開發伺服器可正常啟動

### 測試連線
在瀏覽器的開發者工具 Console 中應該看到：
```
✓ Supabase client initialized
✓ Anonymous user created
✓ TMDB API connected
```

---

## 🐛 常見問題

### 問題：Supabase 連線失敗
**解決方案**：
1. 確認 `NEXT_PUBLIC_SUPABASE_URL` 格式正確（含 `https://`）
2. 確認 API 金鑰沒有多餘的空白
3. 檢查 Supabase 專案狀態是否為 Active

### 問題：TMDB API 回傳 401 錯誤
**解決方案**：
1. 確認使用的是 **API Key (v3 auth)**，而非 **API Read Access Token (v4)**
2. 確認金鑰已啟用且未過期
3. 檢查 API 請求是否包含正確的 `api_key` 參數

### 問題：Realtime 訊息無法即時更新
**解決方案**：
1. 確認 Database > Replication 中 `messages` 表已啟用
2. 檢查瀏覽器 Network 面板是否有 WebSocket 連線
3. 確認 RLS 政策沒有阻擋訂閱

---

## 📚 下一步

環境建置完成後，請參考 `PROJECT_STRUCTURE.md` 了解專案架構，並開始開發核心功能！

需要協助？請查看：
- [Supabase 官方文檔](https://supabase.com/docs)
- [Next.js 官方文檔](https://nextjs.org/docs)
- [TMDB API 文檔](https://developers.themoviedb.org/3)
