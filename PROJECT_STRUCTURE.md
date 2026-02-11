# CineMatch 專案目錄結構

```
CineMatch/
│
├── app/                          # Next.js App Router 主目錄
│   ├── layout.tsx               # 全域布局（包含 Providers）
│   ├── page.tsx                 # 首頁（熱門雷達）
│   ├── globals.css              # 全域樣式（Tailwind）
│   │
│   ├── lobby/                   # 訊號大廳頁面
│   │   └── page.tsx
│   │
│   ├── chat/                    # 快閃聊天頁面
│   │   ├── page.tsx            # 聊天列表
│   │   └── [userId]/           # 一對一聊天室
│   │       └── page.tsx
│   │
│   ├── profile/                 # 個人資料頁面
│   │   └── page.tsx
│   │
│   └── api/                     # API Routes
│       ├── auth/
│       │   └── anon-login/
│       │       └── route.ts    # 匿名登入 API
│       ├── signals/
│       │   └── route.ts        # 訊號 CRUD API
│       └── tmdb/
│           └── trending/
│               └── route.ts    # TMDB 熱門電影 API
│
├── components/                   # React 組件
│   ├── ui/                      # 通用 UI 組件
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   └── Avatar.tsx
│   │
│   ├── home/                    # 熱門雷達相關組件
│   │   ├── MovieCard.tsx       # 電影卡片
│   │   ├── MovieGrid.tsx       # 電影網格
│   │   └── SignalCounter.tsx   # 訊號計數器
│   │
│   ├── lobby/                   # 訊號大廳相關組件
│   │   ├── SignalCard.tsx      # 訊號卡片
│   │   ├── SignalForm.tsx      # 發布訊號表單
│   │   ├── TagSelector.tsx     # 意圖標籤選擇器
│   │   └── SignalList.tsx      # 訊號列表
│   │
│   ├── chat/                    # 聊天相關組件
│   │   ├── MessageList.tsx     # 訊息列表
│   │   ├── MessageInput.tsx    # 訊息輸入框
│   │   ├── ConversationItem.tsx # 對話項目
│   │   └── ChatRoom.tsx        # 聊天室容器
│   │
│   ├── layout/                  # 布局組件
│   │   ├── Navbar.tsx          # 導航欄
│   │   ├── BottomNav.tsx       # 底部導航（手機版）
│   │   └── Container.tsx       # 容器組件
│   │
│   └── providers/               # Context Providers
│       ├── AuthProvider.tsx    # 認證狀態管理
│       └── RealtimeProvider.tsx # Realtime 訂閱管理
│
├── lib/                         # 工具函數與客戶端
│   ├── supabase/
│   │   ├── client.ts           # Supabase 瀏覽器客戶端
│   │   ├── server.ts           # Supabase 伺服器客戶端
│   │   └── middleware.ts       # Supabase 中間件
│   │
│   ├── tmdb/
│   │   ├── client.ts           # TMDB API 客戶端
│   │   └── types.ts            # TMDB 類型定義
│   │
│   ├── hooks/                   # Custom React Hooks
│   │   ├── useAuth.ts          # 認證 Hook
│   │   ├── useSignals.ts       # 訊號 Hook
│   │   ├── useMessages.ts      # 訊息 Hook
│   │   └── useRealtime.ts      # Realtime Hook
│   │
│   └── utils/
│       ├── cn.ts               # Tailwind 類名合併
│       ├── date.ts             # 日期格式化
│       └── validators.ts       # 表單驗證
│
├── types/                       # TypeScript 類型定義
│   ├── database.ts             # Supabase 資料庫類型
│   ├── models.ts               # 資料模型
│   └── api.ts                  # API 請求/回應類型
│
├── public/                      # 靜態資源
│   ├── images/
│   │   ├── logo.svg
│   │   └── avatars/
│   └── icons/
│       └── favicon.ico
│
├── styles/                      # 額外樣式文件（如需要）
│   └── animations.css          # 自定義動畫
│
├── middleware.ts                # Next.js 中間件（Auth 檢查）
├── tailwind.config.ts          # Tailwind CSS 配置
├── postcss.config.js           # PostCSS 配置
├── next.config.js              # Next.js 配置
├── tsconfig.json               # TypeScript 配置
├── .env.local                  # 環境變數（不提交到 Git）
├── .env.example                # 環境變數範例
├── .gitignore                  # Git 忽略文件
├── package.json                # 專案依賴
├── README.md                   # 專案說明
├── supabase_schema.sql         # Supabase SQL 腳本
└── PROJECT_STRUCTURE.md        # 本文件
```

## 主要頁面路由

| 路由 | 頁面 | 說明 |
|------|------|------|
| `/` | 熱門雷達 | 顯示 TMDB 熱門電影 + 訊號數 |
| `/lobby` | 訊號大廳 | 瀏覽/發布揪團訊號 |
| `/chat` | 聊天列表 | 所有對話列表 |
| `/chat/[userId]` | 一對一聊天 | 與特定用戶的聊天室 |
| `/profile` | 個人資料 | 編輯暱稱、頭貼 |

## 核心技術說明

### 1. 認證流程
- 使用 Supabase Anonymous Sign-in
- 用戶首次進入自動創建匿名帳號
- 儲存在 `auth.users` + `public.profiles`

### 2. 即時通訊
- 使用 Supabase Realtime 訂閱 `messages` 表
- 客戶端監聽 `INSERT` 事件
- 自動更新聊天畫面

### 3. 24 小時銷毀機制
- 資料庫層級：RLS 政策過濾 24 小時前資料
- 定期清理：使用 Supabase Edge Functions 或 pg_cron
- 客戶端：查詢時自動過濾

### 4. 狀態管理
- 輕量級：使用 React Context（AuthProvider）
- 伺服器狀態：使用 SWR 或 React Query（可選）
- 表單狀態：使用 React Hook Form（可選）
