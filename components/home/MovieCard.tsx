'use client'

import Image from 'next/image'
import { TMDBMovie } from '@/lib/tmdb/types'
import { getTMDBImageUrl } from '@/lib/tmdb/types'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Activity } from 'lucide-react'

interface MovieCardProps {
  movie: TMDBMovie
  signalCount?: number
  onClick?: () => void
}

export default function MovieCard({ movie, signalCount = 0, onClick }: MovieCardProps) {
  const posterUrl = getTMDBImageUrl(movie.poster_path, 'poster', 'medium')

  return (
    <Card
      variant="neon"
      className="group relative overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* 電影海報 */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-4">
        <Image
          src={posterUrl}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* 評分標籤 */}
        <div className="absolute top-2 right-2">
          <Badge variant="red" size="sm">
            ⭐ {movie.vote_average.toFixed(1)}
          </Badge>
        </div>

        {/* 訊號計數器 */}
        {signalCount > 0 && (
          <div className="absolute bottom-2 left-2">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-neon-red/90 backdrop-blur-sm rounded-full animate-pulse-slow">
              <Activity size={16} className="text-white" />
              <span className="text-sm font-bold text-white">
                {signalCount} 訊號
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 電影資訊 */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-neon-red transition-colors">
          {movie.title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2">
          {movie.overview || '暫無簡介'}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{movie.release_date || '未定'}</span>
          <span>{movie.vote_count} 評論</span>
        </div>
      </div>

      {/* Hover 光效 */}
      <div className="absolute inset-0 bg-gradient-to-t from-neon-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  )
}
