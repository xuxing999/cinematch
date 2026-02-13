# CineMatch — 產品需求說明書 (PRD v1 · MVP)

> **文件版本**：v1.0
> **建立日期**：2026-02-13
> **分支狀態**：`feature/ui-ux-refinement`（待合併回 `main`）
> **Build 狀態**：✅ `npm run build` 零錯誤通過

---

## 一、產品願景

**CineMatch 是一個 24 小時快閃電影社交平台。**

核心命題：電影是最天然的社交載體，但「揪人」一直是痛點。CineMatch 讓使用者在當下電影時機下即時廣播觀影意圖，與陌生的影伴在 24 小時內完成配對、對話、然後一起進場——時間一到，訊息自動銷毀，無壓力、無社交負擔。

**目標使用者**：18–35 歲，喜歡看電影但常常缺伴的都市獨行俠。
**核心差異化**：不是交友軟體，是「電影場次粒度」的即時揪伴工具。

---

## 二、核心功能清單

### ✅ 已完成（MVP Ready）

| # | 功能模組 | 說明 | 技術實作位置 |
|---|---------|------|-------------|
| 1 | **匿名自動登入** | 進站即自動匿名登入，無需註冊，降低使用門檻 | `AuthProvider` → `signInAnonymously()` |
| 2 | **熱門雷達（首頁）** | 顯示 TMDB 院線熱映電影海報牆，標示各片活躍訊號數 | `app/page.tsx` + `MovieGrid` + TMDB API |
| 3 | **電影詳情 Modal** | 點擊海報顯示簡介、評分、上映日期、訊號數，一鍵跳轉大廳 | `app/page.tsx` Modal |
| 4 | **訊號大廳（Lobby）** | 瀏覽全站訊號，支援 4 種標籤篩選 | `app/lobby/page.tsx` + `SignalList` |
| 5 | **訊號發布** | 選電影 → 選標籤 → 選場次 → 寫備註 → 發布，即時廣播給所有大廳使用者 | `SignalForm` + `useSignals` + Realtime |
| 6 | **訊號 Realtime 即時更新** | 任何人新發布訊號，大廳所有人立即看到，無需刷新 | `useSignals` Realtime subscription |
| 7 | **4 種訊號標籤** | 🎫 有票找伴、🔍 尋找影伴、🎬 純粹想看、💬 想找人討論 | `types/models.ts` SIGNAL_TAGS |
| 8 | **聯繫影伴（啟動對話）** | 點擊訊號卡片的「聯繫」按鈕，直接進入快閃聊天室 | `SignalCard` → `router.push('/chat/userId')` |
| 9 | **快閃聊天室** | 雙向即時對話，不刷新頁面收到訊息，Enter 發送，Shift+Enter 換行 | `ChatRoom` + `RealtimeProvider` |
| 10 | **全域氣泡通知** | 在任何頁面收到新訊息，導航列聊天圖示立即顯示紅色計數徽章 | `RealtimeProvider` → `Navbar` + `BottomNav` |
| 11 | **對話列表** | 顯示所有進行中的對話，含未讀數，有新訊息立即更新 | `ConversationList` → `latestIncomingMessage` |
| 12 | **訊息已讀標記** | 進入聊天室自動標記已讀，發送者可見對方已讀狀態 | `markAsRead` API PATCH |
| 13 | **Polling 備援** | Realtime 失敗時自動切換 10 秒 Polling，保持通知不中斷 | `RealtimeProvider` shouldPoll |
| 14 | **iOS 斷線重連** | 鎖屏 5 秒以上自動重建 WebSocket，修正 iOS Safari JWT 問題 | `useSupabaseRealtime` visibilitychange |
| 15 | **復古高級感 UI** | 深色底 + Neon Red/Pink/Cyan 主色 + Playfair Display 字型 | Tailwind config + globals.css |
| 16 | **RWD 響應式設計** | 桌面頂部導航 + 手機底部導航，雙端佈局分離 | `Navbar` / `BottomNav` |
| 17 | **基礎 SEO Meta** | title、description、keywords、viewport 已設定 | `app/layout.tsx` metadata |
| 18 | **24 小時自動清理 Schema** | SQL 層 cleanup function，訊號與訊息 24h 到期 | `supabase_schema.sql` cleanup_expired_data |

### 🔲 待開發（Post-MVP）

| # | 功能 | 優先度 | 說明 |
|---|------|--------|------|
| P1 | **後台排程清理任務** | 高 | 目前 cleanup_expired_data() 需手動執行或 Supabase Cron 設定，尚未驗證自動化 |
| P1 | **訊息速率限制** | 高 | API 層無 rate limit，惡意用戶可刷爆訊息 |
| P1 | **個人資料頁 `/profile`** | 高 | 導航列有此入口但頁面尚未實作（目前為 404） |
| P2 | **檢舉 / 封鎖機制** | 中 | 無內容審核機制，用戶遇到騷擾無法自救 |
| P2 | **Open Graph / Twitter Card** | 中 | 社群分享預覽圖尚未設定，影響病毒傳播 |
| P2 | **PWA / 加入主畫面** | 中 | manifest.json 與 service worker 未設定 |
| P3 | **推播通知 (Push API)** | 低 | 目前依賴 WebSocket，關閉分頁後無法收到通知 |
| P3 | **地理位置匹配** | 低 | 依據使用者所在城市或影城篩選訊號 |
| P3 | **多語系（i18n）** | 低 | 目前僅繁體中文 |
| P3 | **電影評論 / 討論串** | 低 | 聊天結束後的非同步討論空間 |

---

## 三、使用者流程（User Flow）

```
[進站]
  │
  ▼
[自動匿名登入] ──── (背景 Supabase signInAnonymously，用戶無感)
  │
  ▼
[熱門雷達 /] ──── 瀏覽 TMDB 院線海報牆
  │                   │
  │                   ▼
  │            [點擊電影海報]
  │                   │
  │                   ▼
  │            [電影詳情 Modal]
  │            ├─ 查看評分 / 簡介
  │            └─ [查看訊號] ──────────────────────┐
  │                                                 │
  ▼                                                 ▼
[訊號大廳 /lobby] ◄──────────────────────────────── ┘
  │
  ├── 瀏覽現有訊號（Realtime 即時更新）
  │       │
  │       ▼
  │   [點擊「聯繫」按鈕]
  │       │
  │       ▼
  │   [快閃聊天室 /chat/userId]
  │       ├─ 傳送訊息（Enter 發送，游標不離開輸入框）
  │       ├─ 即時收到對方回覆（不需刷新）
  │       └─ 訊息 24 小時後自動銷毀
  │
  └── [發布新訊號] ──── 點擊右下角 FAB (+)
          │
          ▼
      [發布表單 Modal]
      ├─ 搜尋電影
      ├─ 選標籤（4 種）
      ├─ 填影城 / 場次 / 備註（選填）
      └─ [發布] → 即時出現在所有人的大廳

[任何頁面]
  │
  收到新訊息
  │
  ▼
[導航列紅色氣泡 +N] ←── RealtimeProvider INSERT event
  │
  ▼
[點擊「快閃聊天」] → [對話列表 /chat] → [聊天室]
```

---

## 四、技術架構摘要

### 前端框架
- **Next.js 14** (App Router) — SSR + Client Components 混合架構
- **TypeScript** — 全型別安全
- **Tailwind CSS** — 原子化樣式 + 自訂 Neon 色系
- **Playfair Display + Inter** — 雙字型系統（標題 Serif + 內文 Sans）

### 後端 / 資料庫
- **Supabase (PostgreSQL)** — 資料庫 + 認證 + Realtime
  - 匿名登入 (Anonymous Auth)
  - Row Level Security (RLS) 全面啟用
  - 3 張核心表：`profiles`、`signals`、`messages`
  - Realtime Publication：`supabase_realtime` 含 messages + signals 表

### 即時通訊架構
```
[Supabase Realtime WebSocket]
         │
         ▼
[useSupabaseRealtime Hook]          ← 統一訂閱管理（指數退避重連）
         │
    ┌────┴────────────────────┐
    │                         │
    ▼                         ▼
[RealtimeProvider]        [useSignals]
(messages 全域訂閱)       (signals 大廳訂閱)
receiver_id filter        公開無需 filter
    │
    ├── unreadCount → Navbar 氣泡
    ├── latestIncomingMessage → ChatRoom 即時顯示
    └── Polling 備援（Realtime 失敗時 10s interval）
```

### 外部 API
- **TMDB API** — 電影資料（海報、評分、簡介、上映日期）
- 本地快取：1 小時，避免重複請求

### 部署
- **Vercel** — 自動 CI/CD，main branch 自動部署
- 環境變數：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`TMDB_API_KEY`

---

## 五、後續開發路徑（Roadmap）

### Phase 1 — 穩固 MVP（當前 Sprint）
- [x] 修復 iOS Realtime 單向收不到問題
- [x] 修復 ConversationList 無 filter 訂閱
- [x] 大廳訊號即時廣播
- [x] 桌面端 Enter 發送 + 自動 refocus
- [ ] 實作 `/profile` 個人資料頁
- [ ] 設定 Supabase Cron 每小時執行 cleanup_expired_data()
- [ ] API 層加入基本速率限制

### Phase 2 — 用戶留存（下一 Sprint）
- [ ] 檢舉 / 封鎖機制（signals + messages 各加 report_count 欄位）
- [ ] Open Graph Meta Tags（分享到 IG / LINE 有預覽圖）
- [ ] PWA manifest + 加入主畫面提示
- [ ] 訊息送出「傳送中」動畫 + Skeleton loading

### Phase 3 — 成長功能（3 個月內）
- [ ] 地理位置匹配（依城市 / 縣市篩選訊號）
- [ ] 推播通知（關閉分頁後仍能收到新訊息）
- [ ] 電影場次 API 整合（實際班表）
- [ ] 優惠券資訊整合（威秀、國賓、誠品等）

### Phase 4 — 規模化（6 個月內）
- [ ] 多語系（繁中 / 簡中 / 英文）
- [ ] 影院聯名合作（購票導流）
- [ ] 社群功能（電影討論串、評分）
- [ ] 數據分析儀表板

---

## 六、已知技術債

| 項目 | 影響 | 建議處理時機 |
|------|------|-------------|
| `// @ts-nocheck` 散佈在多個檔案 | TypeScript 保護失效，潛在 runtime 錯誤 | Phase 2 |
| 大量 `console.log` 未移除 | 生產環境洩露用戶 ID 到瀏覽器 Console | 合併前清理 |
| `alert()` 在訊號發布成功時 | 原生 alert 破壞 UI 一致性 | Phase 1 尾段 |
| `useMessages.fetchMessages` 未 useCallback | 每次 render 重建函式，輕微效能損耗 | Phase 2 |
| `/profile` 頁面顯示 404 | 導航列有入口但頁面不存在，用戶體驗破洞 | 合併前或 Phase 1 |

---

## 七、MVP 上線標準評估

| 標準 | 狀態 | 說明 |
|------|------|------|
| 核心流程完整（看電影 → 找伴 → 聊天） | ✅ | End-to-end 流程可走通 |
| 即時通訊穩定（含 iOS） | ✅ | 三輪修復後穩定 |
| 生產 Build 無錯誤 | ✅ | `npm run build` 全綠 |
| 資料安全（RLS） | ✅ | 所有表 RLS 啟用 |
| 基礎 SEO | ✅ | title / description / keywords |
| 個人資料頁 | ❌ | `/profile` 404，導航入口存在 |
| 自動資料清理 | ⚠️ | Schema 有函數，未確認 Cron 排程 |
| 速率限制 | ❌ | API 層無防護 |
| 檢舉機制 | ❌ | 無內容審核 |

**結論**：具備「軟上線（Soft Launch / Beta）」條件，建議修復 `/profile` 後正式對外開放。

---

*本文件由 CineMatch 工程團隊自動生成，版本隨功能迭代更新。*
