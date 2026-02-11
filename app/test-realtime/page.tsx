// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestRealtimePage() {
  const [logs, setLogs] = useState<string[]>([])
  const [status, setStatus] = useState('未連線')
  const [messageCount, setMessageCount] = useState(0)
  const [updateCount, setUpdateCount] = useState(0)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('zh-TW', { hour12: false })
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(message)
  }

  useEffect(() => {
    const supabase = createClient()

    addLog('🔌 開始建立 Realtime 連線...')
    addLog(`📡 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
    addLog(`🔗 Channel 名稱: test-realtime-connection`)
    addLog(`📊 監聽表格: public.messages`)
    addLog(`📢 監聽事件: INSERT, UPDATE`)

    const channel = supabase
      .channel('test-realtime-connection')
      // 監聽 INSERT 事件
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          setMessageCount(prev => prev + 1)
          addLog(`📨 收到 INSERT 事件！`)
          addLog(`   ID: ${payload.new.id}`)
          addLog(`   內容: ${payload.new.content}`)
          addLog(`   發送者: ${payload.new.sender_id?.substring(0, 8)}...`)
          addLog(`   接收者: ${payload.new.receiver_id?.substring(0, 8)}...`)
          addLog(`   時間: ${payload.new.created_at}`)
        }
      )
      // 監聽 UPDATE 事件
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          setUpdateCount(prev => prev + 1)
          addLog(`📝 收到 UPDATE 事件！`)
          addLog(`   ID: ${payload.new.id}`)
          addLog(`   是否已讀: ${payload.new.is_read}`)
        }
      )
      .subscribe((status, err) => {
        addLog(`🔌 訂閱狀態變更: ${status}`)
        setStatus(status)

        if (status === 'SUBSCRIBED') {
          addLog('✅ 訂閱成功！Realtime 功能正常運作！')
          addLog('🎉 你現在可以在其他視窗發送訊息來測試')
        }

        if (status === 'CHANNEL_ERROR') {
          addLog(`❌ 訂閱失敗！`)
          if (err) {
            addLog(`❌ 錯誤詳情: ${JSON.stringify(err)}`)
          }
          addLog('⚠️ 請檢查：')
          addLog('   1. messages 表是否在 supabase_realtime publication 中')
          addLog('   2. Database → Replication 是否開啟')
          addLog('   3. RLS 政策是否允許讀取')
        }

        if (status === 'TIMED_OUT') {
          addLog('⏱️ 訂閱超時！連線可能被防火牆阻擋')
        }

        if (status === 'CLOSED') {
          addLog('🔌 連線已關閉')
        }
      })

    return () => {
      addLog('🧹 清理 Realtime 連線...')
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="min-h-screen bg-dark-300 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">
          🧪 Realtime 連線測試
        </h1>

        <div className="bg-dark-200 border border-dark-100 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">連線狀態</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-4 h-4 rounded-full ${
              status === 'SUBSCRIBED' ? 'bg-green-500 animate-pulse' :
              status === 'CHANNEL_ERROR' ? 'bg-red-500' :
              'bg-yellow-500'
            }`} />
            <span className="text-lg text-white font-mono">{status}</span>
          </div>

          {/* 統計資訊 */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-dark-300 rounded-lg p-3">
              <div className="text-gray-400 text-sm mb-1">收到 INSERT 事件</div>
              <div className="text-2xl font-bold text-green-400">{messageCount}</div>
            </div>
            <div className="bg-dark-300 rounded-lg p-3">
              <div className="text-gray-400 text-sm mb-1">收到 UPDATE 事件</div>
              <div className="text-2xl font-bold text-blue-400">{updateCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-dark-200 border border-dark-100 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">即時日誌</h2>

          {logs.length === 0 ? (
            <p className="text-gray-500">等待日誌...</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="font-mono text-sm p-2 rounded bg-dark-300 text-gray-300"
                >
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-lg font-bold text-blue-400 mb-2">📋 測試步驟</h3>
          <ol className="list-decimal list-inside text-gray-300 space-y-2">
            <li>打開這個頁面後，檢查上方的「連線狀態」</li>
            <li>如果狀態是 <span className="font-mono bg-green-500/20 px-1">SUBSCRIBED</span>，表示連線成功！✅</li>
            <li>打開<strong>無痕視窗</strong>（或另一個瀏覽器）</li>
            <li>在無痕視窗登入並進入任何聊天室發送訊息</li>
            <li>回到這個頁面，應該會在「即時日誌」中看到 📨 INSERT 事件</li>
            <li>標記訊息為已讀時，會看到 📝 UPDATE 事件</li>
            <li>如果看到 <span className="font-mono bg-red-500/20 px-1">CHANNEL_ERROR</span>，請往下看故障排除</li>
          </ol>
        </div>

        <div className="mt-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <h3 className="text-lg font-bold text-yellow-400 mb-2">⚠️ 故障排除</h3>

          <div className="space-y-3">
            <div>
              <p className="text-white font-semibold mb-1">如果看到 CHANNEL_ERROR：</p>
              <ol className="list-decimal list-inside text-gray-300 space-y-1 ml-2">
                <li>執行專案根目錄的 <code className="bg-dark-300 px-1 rounded">fix_realtime_v2.sql</code></li>
                <li>前往 Supabase Dashboard → SQL Editor 執行該 SQL</li>
                <li>檢查診斷結果中的 <code className="bg-dark-300 px-1 rounded">in_publication</code> 是否為 <span className="text-green-400">true</span></li>
                <li>前往 Database → Replication，確認 messages 的 Realtime 是 <strong>ON</strong></li>
                <li>完全重新整理此頁面（Cmd+Shift+R 或 Ctrl+Shift+R）</li>
              </ol>
            </div>

            <div>
              <p className="text-white font-semibold mb-1">如果狀態是 SUBSCRIBED 但收不到訊息：</p>
              <ul className="list-disc list-inside text-gray-300 space-y-1 ml-2">
                <li>檢查 RLS 政策是否允許讀取訊息</li>
                <li>確認 <code className="bg-dark-300 px-1 rounded">replica_identity</code> 已設為 FULL</li>
                <li>檢查瀏覽器 Console（F12）是否有錯誤</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <h3 className="text-lg font-bold text-green-400 mb-2">✅ 成功指標</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            <li>連線狀態顯示：<span className="font-mono bg-green-500/20 px-1">SUBSCRIBED</span></li>
            <li>日誌中出現：<span className="font-mono bg-dark-300 px-1">✅ 訂閱成功！Realtime 功能正常運作！</span></li>
            <li>發送訊息後，日誌立即顯示 📨 INSERT 事件</li>
            <li>統計數字會即時增加</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
