'use client'

import { useEffect, useState } from 'react'
import { TMDBMovie } from '@/lib/tmdb/types'
import MovieGrid from '@/components/home/MovieGrid'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Sparkles, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const [movies, setMovies] = useState<TMDBMovie[]>([])
  const [signalStats, setSignalStats] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchMovies()
    fetchSignalStats()
  }, [])

  const fetchMovies = async () => {
    try {
      const response = await fetch('/api/tmdb/now-playing')
      const data = await response.json()
      setMovies(data.results || [])
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSignalStats = async () => {
    try {
      const response = await fetch('/api/signals/stats')
      const data = await response.json()
      setSignalStats(data)
    } catch (error) {
      console.error('Error fetching signal stats:', error)
    }
  }

  const handleMovieClick = (movie: TMDBMovie) => {
    setSelectedMovie(movie)
    setIsModalOpen(true)
  }

  const handleViewSignals = () => {
    if (selectedMovie) {
      window.location.href = `/lobby?movie_id=${selectedMovie.id}`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-neon-red/40 border-t-neon-red rounded-full animate-spin mx-auto" />
          <p className="text-stone-500 text-sm">載入中</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 頁面標題 */}
        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-md border border-neon-red/40 bg-neon-red/8 flex items-center justify-center flex-shrink-0 mt-0.5">
              <TrendingUp size={20} className="text-neon-red" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">
                熱門雷達
              </h1>
              <p className="text-stone-400 text-sm mt-1">探索當前熱映電影與即時訊號</p>
            </div>
          </div>

          {/* 統計行 */}
          <div className="flex items-center gap-4 text-sm mt-5 pl-1">
            <div className="flex items-center gap-2 text-stone-400">
              <Sparkles size={14} className="text-neon-cyan" />
              <span>
                <span className="text-foreground font-semibold">{movies.length}</span> 部電影
              </span>
            </div>
            <span className="text-dark-50">·</span>
            <div className="flex items-center gap-2 text-stone-400">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-red inline-block" />
              <span>
                <span className="text-foreground font-semibold">
                  {Object.values(signalStats).reduce((a, b) => a + b, 0)}
                </span> 個活躍訊號
              </span>
            </div>
          </div>
        </div>

        {/* 電影格 */}
        <MovieGrid
          movies={movies}
          signalStats={signalStats}
          onMovieClick={handleMovieClick}
        />

        {/* 電影詳情 Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedMovie?.title}
          size="md"
        >
          {selectedMovie && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 uppercase tracking-wider">評分</span>
                <span className="text-neon-pink font-semibold text-sm">
                  ★ {selectedMovie.vote_average.toFixed(1)} / 10
                </span>
              </div>

              <div className="border-t border-dark-50/40 pt-4">
                <p className="text-stone-300 text-sm leading-relaxed">
                  {selectedMovie.overview || '暫無簡介'}
                </p>
              </div>

              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-xs text-stone-500 uppercase tracking-wider block mb-0.5">上映日期</span>
                  <span className="text-foreground">{selectedMovie.release_date || '未定'}</span>
                </div>
                <div>
                  <span className="text-xs text-stone-500 uppercase tracking-wider block mb-0.5">訊號數</span>
                  <span className="text-neon-red font-semibold">
                    {signalStats[selectedMovie.id] || 0}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="primary" className="flex-1" onClick={handleViewSignals}>
                  查看訊號
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
                  關閉
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}
