'use client'

import { logger } from '@/lib/utils/logger'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { TMDBMovie } from '@/lib/tmdb/types'
import { getTMDBImageUrl } from '@/lib/tmdb/types'
import Input from '@/components/ui/Input'
import { Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface MovieSearchProps {
  onSelectMovie: (movie: TMDBMovie) => void
  selectedMovie?: TMDBMovie | null
}

export default function MovieSearch({ onSelectMovie, selectedMovie }: MovieSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (query.trim() === '') {
      setResults([])
      setShowResults(false)
      return
    }

    const timer = setTimeout(() => {
      searchMovies(query)
    }, 500) // 防抖：500ms 後才搜尋

    return () => clearTimeout(timer)
  }, [query])

  const searchMovies = async (searchQuery: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tmdb/search?query=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setResults(data.results || [])
      setShowResults(true)
    } catch (error) {
      logger.error('Error searching movies:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMovie = (movie: TMDBMovie) => {
    onSelectMovie(movie)
    setQuery('')
    setShowResults(false)
  }

  return (
    <div className="relative">
      {/* 已選擇的電影 */}
      {selectedMovie && (
        <div className="mb-4 p-4 bg-dark-100 rounded-lg border border-neon-red">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden">
              <Image
                src={getTMDBImageUrl(selectedMovie.poster_path, 'poster', 'small')}
                alt={selectedMovie.title}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white line-clamp-1">{selectedMovie.title}</p>
              <p className="text-sm text-gray-400">{selectedMovie.release_date || '未定'}</p>
            </div>
            <button
              type="button"
              onClick={() => onSelectMovie(null!)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 搜尋輸入框 */}
      <div className="relative">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <Input
            type="text"
            placeholder="搜尋電影名稱..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setShowResults(true)}
            className="pl-12 pr-12"
          />
          {loading && (
            <Loader2
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neon-red animate-spin"
            />
          )}
        </div>

        {/* 搜尋結果下拉選單 */}
        {showResults && results.length > 0 && (
          <div className="absolute z-50 w-full mt-2 max-h-96 overflow-y-auto bg-dark-200 border border-dark-100 rounded-lg shadow-2xl">
            {results.map((movie) => (
              <button
                key={movie.id}
                type="button"
                onClick={() => handleSelectMovie(movie)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 hover:bg-dark-100 transition-colors border-b border-dark-100 last:border-b-0',
                  selectedMovie?.id === movie.id && 'bg-neon-red/20'
                )}
              >
                <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-dark-300">
                  <Image
                    src={getTMDBImageUrl(movie.poster_path, 'poster', 'small')}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium text-white line-clamp-1">{movie.title}</p>
                  <p className="text-sm text-gray-400 line-clamp-1">
                    {movie.release_date || '未定'} • ⭐ {movie.vote_average.toFixed(1)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 無結果提示 */}
        {showResults && !loading && query && results.length === 0 && (
          <div className="absolute z-50 w-full mt-2 p-4 bg-dark-200 border border-dark-100 rounded-lg text-center">
            <p className="text-gray-400">找不到相關電影</p>
          </div>
        )}
      </div>
    </div>
  )
}
