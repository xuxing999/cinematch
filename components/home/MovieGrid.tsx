'use client'

import { TMDBMovie } from '@/lib/tmdb/types'
import MovieCard from './MovieCard'

interface MovieGridProps {
  movies: TMDBMovie[]
  signalStats: Record<number, number>
  onMovieClick: (movie: TMDBMovie) => void
}

export default function MovieGrid({ movies, signalStats, onMovieClick }: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">目前沒有電影資訊</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          signalCount={signalStats[movie.id] || 0}
          onClick={() => onMovieClick(movie)}
        />
      ))}
    </div>
  )
}
