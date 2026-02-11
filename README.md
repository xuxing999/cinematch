# 🎬 CineMatch (影伴)

> 基於電影優惠與觀影意圖的 24 小時快閃社交工具

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

</div>

---

## 🌟 產品簡介

CineMatch 讓您在觀影前快速找到同好：
- 💰 **我有票**：分享電影優惠，徵人平分
- 👻 **求壯膽**：恐怖片不敢一個人看？找個伴吧
- 🎭 **純看片**：不聊天，看完即散
- 🧠 **想討論**：燒腦片映後交流

所有訊號與聊天記錄都會在 **24 小時後自動銷毀**，零壓力社交！

---

## 🚀 快速開始

### 1. 環境建置
請按照 **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** 的步驟完成：
- Supabase 專案建立
- TMDB API 金鑰申請
- 環境變數設定

### 2. 安裝依賴
```bash
npm install
```

### 3. 啟動開發伺服器
```bash
npm run dev
```

訪問 http://localhost:3000 開始使用！

---

## 📂 專案結構

詳細的目錄結構說明請參考 **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**

```
CineMatch/
├── app/              # Next.js App Router 頁面
├── components/       # React 組件
├── lib/              # 工具函數與 API 客戶端
├── types/            # TypeScript 類型定義
└── public/           # 靜態資源
```

---

## 🛠️ 技術棧

| 類別 | 技術 |
|------|------|
| **前端框架** | Next.js 14+ (App Router) |
| **樣式** | Tailwind CSS |
| **圖標** | Lucide Icons |
| **後端/資料庫** | Supabase (Postgres + Auth + Realtime) |
| **部署** | Vercel |
| **第三方 API** | TMDB (電影數據) |

---

## 💡 核心功能

### 🎯 熱門雷達
顯示當前全台熱門電影（來自 TMDB），並即時顯示每部電影的積極訊號總數。

### 📢 訊號大廳
用戶可發布揪團訊號，必須選擇一個意圖標籤（我有票/求壯膽/純看片/想討論）。

### 💬 快閃聊天
基於 Supabase Realtime 的即時通訊，所有訊息 24 小時後自動銷毀。

---

## 🔐 隱私與安全

- ✅ 匿名登入，無需提供個人資訊
- ✅ 24 小時訊息自動銷毀
- ✅ Supabase RLS（Row Level Security）保護資料
- ✅ 僅顯示必要的用戶資訊（暱稱、頭貼）

---

## 📝 開發進度

- [x] 第一階段：環境與資料庫建置
- [ ] 第二階段：核心 API 開發
- [ ] 第三階段：UI 與社交功能實作
- [ ] 第四階段：測試與優化
- [ ] 第五階段：部署上線

---

## 📄 授權

本專案僅供學習與展示用途。

---

## 📧 聯絡方式

如有問題或建議，歡迎開啟 Issue 或聯繫開發者。

---

<div align="center">

**讓每一次觀影，都找到最佳影伴 🎬**

Made with ❤️ using Next.js & Supabase

</div>
