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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-neon-red border-t-transparent mx-auto"></div>
          <p className="text-gray-400">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-neon-red/20 flex items-center justify-center animate-pulse-slow">
              <TrendingUp size={28} className="text-neon-red" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-neon-glow">熱門雷達</h1>
              <p className="text-gray-400 mt-1">探索當前熱映電影與即時訊號</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-neon-cyan" />
              <span className="text-gray-400">
                共 <span className="text-white font-bold">{movies.length}</span> 部電影
              </span>
            </div>
            <div className="w-1 h-4 bg-dark-100"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-red animate-pulse"></div>
              <span className="text-gray-400">
                <span className="text-white font-bold">
                  {Object.values(signalStats).reduce((a, b) => a + b, 0)}
                </span> 個活躍訊號
              </span>
            </div>
          </div>
        </div>

        {/* Movie Grid */}
        <MovieGrid
          movies={movies}
          signalStats={signalStats}
          onMovieClick={handleMovieClick}
        />

        {/* Movie Detail Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedMovie?.title}
          size="lg"
        >
          {selectedMovie && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <span className="text-gray-400">評分：</span>
                <span className="text-neon-red font-bold">
                  ⭐ {selectedMovie.vote_average.toFixed(1)} / 10
                </span>
              </div>
              <div>
                <span className="text-gray-400">簡介：</span>
                <p className="text-gray-300 mt-2 leading-relaxed">
                  {selectedMovie.overview || '暫無簡介'}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400">上映日期：</span>
                <span className="text-white">{selectedMovie.release_date || '未定'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400">目前訊號數：</span>
                <span className="text-neon-cyan font-bold">
                  {signalStats[selectedMovie.id] || 0} 個
                </span>
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleViewSignals}
                >
                  查看訊號
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setIsModalOpen(false)}
                >
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
