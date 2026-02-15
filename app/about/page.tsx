import type { Metadata } from 'next'
import { Film, Shield, Clock, Zap } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '關於 CineMatch — 在電影散場後',
  description: '一個工程師在工作之餘蓋出來的快閃電影社交空間。沒有繁瑣個資，只有最純粹的觀影意圖。',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-12 sm:py-16">

        {/* ── 頁首標題 ─────────────────────────────────────── */}
        <header className="mb-12 sm:mb-16">
          {/* 裝飾線 */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-dark-50/60" />
            <Film size={14} className="text-neon-pink opacity-70" />
            <div className="h-px flex-1 bg-dark-50/60" />
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground leading-snug tracking-tight mb-4">
            在電影散場後，<br />
            我們依然擁有彼此的生活。
          </h1>
          <p className="text-xs text-stone-500 tracking-widest uppercase">
            A Note from XU &nbsp;·&nbsp; 開發者自白
          </p>
        </header>

        {/* ── 主文 ──────────────────────────────────────────── */}
        <article className="space-y-7 text-stone-300 leading-relaxed text-[15px]">

          <p>
            大家好，我是 XU。
          </p>

          <p>
            我是一個極度熱愛電影的人，但即便如此，我也常遇到那種「想看電影，卻找不到人」的時刻。有時候是朋友們剛好沒空，有時候是我特別想看恐怖片，卻找不到人陪我一起分擔那份恐懼。
          </p>

          <p>
            在開發 CineMatch 的過程中，我發現身邊有許多同樣單身或感到孤獨的人。我們並非隨時都在尋找一段長遠的感情關係，更多時候，我們只是希望在下班後或週末，能有一個人陪著看場好電影，在散場後一起討論劇情、分享感受。
          </p>

          {/* 引言區塊 */}
          <blockquote className="relative border-l-2 border-neon-red/50 pl-5 py-1 my-8">
            <p className="text-foreground font-serif text-lg italic leading-relaxed">
              然後，我們可以優雅地「快閃」回到各自原本的生活軌跡裡。
            </p>
          </blockquote>

          <p>
            這是我在工作之餘，利用閒暇時間一字一句敲出來的實驗空間。這裡沒有繁瑣的個資、沒有刪不掉的標籤，只有最純粹的觀影意圖。
          </p>

          <p>
            我希望能為這座城市裡同樣愛電影的你，蓋一座 24 小時的快閃基地。
          </p>

        </article>

        {/* ── 分隔線 ───────────────────────────────────────── */}
        <div className="my-12 flex items-center gap-3">
          <div className="h-px flex-1 bg-dark-50/60" />
          <span className="text-stone-600 text-xs tracking-widest">— XU</span>
          <div className="h-px flex-1 bg-dark-50/60" />
        </div>

        {/* ── 安全機制說明 ─────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-6">
            安全機制 &amp; 隱私原則
          </h2>

          <div className="grid gap-4">

            <div className="flex gap-4 p-4 bg-dark-100 border border-dark-50/40 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-neon-red/10 border border-neon-red/20 flex items-center justify-center flex-shrink-0">
                <Clock size={16} className="text-neon-red" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">24 小時自動銷毀</p>
                <p className="text-xs text-stone-500 leading-relaxed">
                  所有訊號與對話記錄將在發布後 24 小時內自動從伺服器徹底刪除，不留存任何痕跡。
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-dark-100 border border-dark-50/40 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center flex-shrink-0">
                <Shield size={16} className="text-neon-purple" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">匿名身份保護</p>
                <p className="text-xs text-stone-500 leading-relaxed">
                  系統不收集真實姓名、電話或社群帳號。你的身份只有你自己知道。
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-dark-100 border border-dark-50/40 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-neon-pink/10 border border-neon-pink/20 flex items-center justify-center flex-shrink-0">
                <Zap size={16} className="text-neon-pink" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">純粹的觀影意圖</p>
                <p className="text-xs text-stone-500 leading-relaxed">
                  CineMatch 不是交友 App，不是約砲工具。這裡只問一件事：你想看哪部電影？
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── 底部 CTA ────────────────────────────────────── */}
        <footer className="mt-14 pt-8 border-t border-dark-50/40 text-center">
          <p className="text-stone-500 text-sm mb-5">
            準備好找一個人看電影了嗎？
          </p>
          <Link
            href="/lobby"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neon-red text-white text-sm font-medium rounded-lg hover:bg-neon-red/90 transition-all duration-200 hover:shadow-neon-red"
          >
            <Film size={15} />
            前往訊號大廳
          </Link>
          <p className="text-[11px] text-stone-600 mt-6 leading-relaxed">
            CineMatch 是由 XU 以個人身份獨立開發的實驗性專案。<br />
            如有任何問題或建議，歡迎透過大廳訊號聯繫。
          </p>
        </footer>

      </div>
    </div>
  )
}
