'use client'

import { useState } from 'react'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { useRealtimeContext } from '@/components/providers/RealtimeProvider'
import Avatar from '@/components/ui/Avatar'
import { User, Wifi, WifiOff, Clock, Shield, RefreshCw, BookOpen, Database, Film, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ─── 連線狀態徽章 ─────────────────────────────────────────
function ConnectionBadge({ status }: { status: string }) {
  const isConnected = status === 'SUBSCRIBED'
  const isConnecting = status === 'CONNECTING'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
        isConnected
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          : isConnecting
          ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
          : 'bg-stone-500/10 border-stone-500/30 text-stone-400'
      )}
    >
      {isConnected ? (
        <Wifi size={12} className="animate-pulse" />
      ) : (
        <WifiOff size={12} />
      )}
      <span>
        {isConnected ? '即時連線正常'
          : isConnecting ? '連線中...'
          : status === 'ERROR' ? '重連中...'
          : status === 'CLOSED' ? '使用備援模式'
          : '待機中'}
      </span>
    </div>
  )
}

// ─── 資訊列 ─────────────────────────────────────────────
function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-dark-50/30 last:border-0">
      <span className="text-xs text-stone-500 uppercase tracking-widest flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span
        className={cn(
          'text-sm text-stone-300 text-right break-all',
          mono && 'font-mono text-xs text-stone-400'
        )}
      >
        {value}
      </span>
    </div>
  )
}

// ─── 隱私政策區塊 ────────────────────────────────────────
function PrivacyPolicySection() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-dark-200 border border-dark-50/30 rounded-xl overflow-hidden">
      {/* 標題列（可點擊展開）*/}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-dark-100/40 transition-colors text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <Shield size={15} className="text-stone-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-stone-300">隱私承諾與數據處理說明</span>
        </div>
        {expanded
          ? <ChevronUp size={14} className="text-stone-600 flex-shrink-0" />
          : <ChevronDown size={14} className="text-stone-600 flex-shrink-0" />
        }
      </button>

      {/* 展開內容 */}
      {expanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-dark-50/30">

          {/* 快速承諾摘要 */}
          <div className="pt-4 space-y-1.5">
            {[
              { dot: 'text-emerald-500', text: '匿名身份：不收集姓名、電話或 Email，僅持有 Supabase 自動產生的匿名 UUID。' },
              { dot: 'text-emerald-500', text: '24 小時自毀：所有訊號與聊天訊息在建立後 24 小時由資料庫排程自動刪除。' },
              { dot: 'text-emerald-500', text: 'RLS 隔離：Row Level Security 確保每位用戶只能讀取自己的訊息，平台開發者亦不主動查閱內容。' },
              { dot: 'text-emerald-500', text: '不追蹤：無 Google Analytics、無 Meta Pixel、無任何第三方廣告追蹤腳本。' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={cn('text-xs flex-shrink-0 mt-0.5', item.dot)}>·</span>
                <p className="text-xs text-stone-500 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          {/* TMDB 數據來源 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Film size={13} className="text-stone-500 flex-shrink-0" />
              <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
                電影資料來源（TMDB）
              </h4>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              本平台的電影海報、片名、上映資訊均來自
              <span className="text-stone-400 font-medium"> TMDB（The Movie Database）</span>
              ，依 TMDB 服務條款（非商業個人用途）授權使用。CineMatch 不主張任何電影著作權，所有媒體版權歸各原始持有人所有。
            </p>
            <p className="text-xs text-stone-600 leading-relaxed">
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
          </div>

          {/* Supabase 數據儲存 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database size={13} className="text-stone-500 flex-shrink-0" />
              <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
                數據儲存（Supabase）
              </h4>
            </div>
            <div className="space-y-1.5">
              {[
                { label: '儲存位置', value: 'Supabase（PostgreSQL），資料中心位於 AWS ap-northeast-1（東京）或 ap-southeast-1（新加坡）' },
                { label: '儲存內容', value: '匿名 UUID、自訂暱稱（可選）、訊號標籤與電影選擇、24小時內的聊天訊息' },
                { label: '不儲存', value: '真實姓名、電話、Email、IP 位址、裝置識別符、位置資訊' },
                { label: '保留期限', value: '訊號與訊息：24 小時後自動刪除。匿名帳號（profiles）：無到期限制，但不包含任何可識別個人的資訊' },
              ].map((row, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5 border-b border-dark-50/20 last:border-0">
                  <span className="text-xs text-stone-600 flex-shrink-0 w-16 pt-0.5">{row.label}</span>
                  <span className="text-xs text-stone-500 leading-relaxed">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 用戶權利 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen size={13} className="text-stone-500 flex-shrink-0" />
              <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
                您的權利
              </h4>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              由於本平台採匿名機制，我們無法主動驗證身份。若您希望刪除所有相關資料，可直接清除瀏覽器的 localStorage 與 Cookie（這將重置您的匿名帳號），或透過 GitHub Issues 聯繫開發者。
            </p>
          </div>

          {/* 免責聲明 */}
          <div className="bg-dark-300 border border-stone-700/30 rounded-lg p-3.5 space-y-1">
            <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest">免責聲明</p>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              本平台為個人 Side Project，以「現狀」提供服務，不對服務中斷、數據遺失或任何因使用本平台所生之損害負責。請勿在對話中分享任何敏感個人資訊。
            </p>
          </div>

          <p className="text-[11px] text-stone-700 text-right">最後更新：2026-02-14</p>
        </div>
      )}
    </div>
  )
}

// ─── 主頁面 ─────────────────────────────────────────────
export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuthContext()
  const { connectionStatus, isPolling, unreadCount, reconnect } = useRealtimeContext()

  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  const displayName = profile?.display_name ?? '影伴'
  const shortId = user?.id?.substring(0, 8) ?? '--------'
  const fullId = user?.id ?? '尚未登入'
  const joinedAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('zh-TW', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—'

  const handleEditName = () => {
    setNewName(displayName)
    setIsEditingName(true)
  }

  const handleSaveName = async () => {
    const trimmed = newName.trim()
    if (!trimmed || trimmed === displayName) {
      setIsEditingName(false)
      return
    }
    setSaving(true)
    await updateProfile({ display_name: trimmed })
    setSaving(false)
    setIsEditingName(false)
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* ─── 頁面標題 ─── */}
        <div className="flex items-start gap-4 mb-2">
          <div className="w-11 h-11 rounded-md border border-stone-600/40 bg-stone-500/8 flex items-center justify-center flex-shrink-0 mt-0.5">
            <User size={20} className="text-stone-400" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">
              個人資料
            </h1>
            <p className="text-stone-400 text-sm mt-1">你的匿名影伴身份</p>
          </div>
        </div>

        {/* ─── 主卡片：頭像 + 暱稱 ─── */}
        <div className="bg-dark-200 border border-dark-100 rounded-xl p-6">
          <div className="flex items-center gap-5">
            {/* 頭像 */}
            <div className="relative flex-shrink-0">
              <Avatar
                src={profile?.avatar_url}
                alt={displayName}
                size="xl"
                fallback={displayName}
              />
              {/* 連線狀態小點 */}
              <span
                className={cn(
                  'absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-dark-200',
                  connectionStatus === 'SUBSCRIBED' ? 'bg-emerald-400' : 'bg-stone-500'
                )}
              />
            </div>

            {/* 名稱區 */}
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="space-y-2">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName()
                      if (e.key === 'Escape') setIsEditingName(false)
                    }}
                    maxLength={20}
                    className="w-full px-3 py-2 bg-dark-300 border border-neon-red/40 rounded-lg text-foreground text-lg font-serif font-bold focus:outline-none focus:border-neon-red/70 focus:ring-1 focus:ring-neon-red/20"
                    placeholder="輸入暱稱..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveName}
                      disabled={saving}
                      className="px-4 py-1.5 bg-neon-red text-white text-xs rounded-md hover:bg-neon-red/90 disabled:opacity-50 transition-all"
                    >
                      {saving ? '儲存中...' : '儲存'}
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="px-4 py-1.5 bg-dark-100 text-stone-400 text-xs rounded-md hover:text-foreground transition-all"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-serif font-bold text-foreground truncate">
                    {displayName}
                  </h2>
                  <p className="text-xs text-stone-500 font-mono mt-0.5">
                    #{shortId}
                  </p>
                  <button
                    onClick={handleEditName}
                    className="mt-2 text-xs text-neon-red/70 hover:text-neon-red transition-colors underline underline-offset-2"
                  >
                    修改暱稱
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ─── 帳號資訊卡 ─── */}
        <div className="bg-dark-200 border border-dark-100 rounded-xl p-5">
          <h3 className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-1">
            帳號資訊
          </h3>
          <div className="divide-y divide-dark-50/30">
            <InfoRow label="加入日期" value={joinedAt} />
            <InfoRow label="登入方式" value="匿名登入（無需帳號）" />
            <InfoRow label="資料保留" value="訊號與訊息 24 小時後自動銷毀" />
            <InfoRow label="匿名 ID" value={fullId} mono />
          </div>
        </div>

        {/* ─── 連線狀態卡 ─── */}
        <div className="bg-dark-200 border border-dark-100 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-stone-500 uppercase tracking-widest">
              即時連線狀態
            </h3>
            <button
              onClick={reconnect}
              title="手動重連"
              className="p-1.5 rounded-md hover:bg-dark-100 transition-colors text-stone-500 hover:text-foreground"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <ConnectionBadge status={connectionStatus} />

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-300 rounded-lg p-3">
              <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">
                連線模式
              </div>
              <div className="text-sm font-medium text-foreground">
                {isPolling ? 'Polling 備援' : 'WebSocket'}
              </div>
            </div>
            <div className="bg-dark-300 rounded-lg p-3">
              <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">
                未讀訊息
              </div>
              <div className={cn(
                'text-sm font-bold',
                unreadCount > 0 ? 'text-neon-red' : 'text-stone-400'
              )}>
                {unreadCount > 0 ? `${unreadCount} 則` : '無'}
              </div>
            </div>
          </div>
        </div>

        {/* ─── 隱私與數據處理說明（可展開）─── */}
        <PrivacyPolicySection />

        {/* ─── 24h 說明 ─── */}
        <div className="flex items-center gap-2 text-xs text-stone-600 justify-center pb-4">
          <Clock size={12} />
          <span>所有連線資料將於 24 小時後自動清除</span>
        </div>

      </div>
    </div>
  )
}
