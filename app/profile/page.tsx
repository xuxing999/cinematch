'use client'

import { useState } from 'react'
import { useAuthContext } from '@/components/providers/AuthProvider'
import { useRealtimeContext } from '@/components/providers/RealtimeProvider'
import Avatar from '@/components/ui/Avatar'
import { User, Wifi, WifiOff, Clock, Shield, RefreshCw } from 'lucide-react'
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

        {/* ─── 隱私說明卡 ─── */}
        <div className="bg-dark-200 border border-dark-50/30 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Shield size={16} className="text-stone-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-stone-300">隱私承諾</h3>
              <ul className="text-xs text-stone-500 space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 flex-shrink-0">·</span>
                  匿名身份：不綁定手機號碼或 Email
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 flex-shrink-0">·</span>
                  24 小時自毀：所有訊號與訊息自動銷毀
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 flex-shrink-0">·</span>
                  端對端隔離：RLS 確保只有你能讀取自己的訊息
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 flex-shrink-0">·</span>
                  不追蹤：無廣告追蹤、無第三方分析
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ─── 24h 說明 ─── */}
        <div className="flex items-center gap-2 text-xs text-stone-600 justify-center pb-4">
          <Clock size={12} />
          <span>所有連線資料將於 24 小時後自動清除</span>
        </div>

      </div>
    </div>
  )
}
