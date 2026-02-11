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
      className="group relative overflow-hidden cursor-pointer p-0"
      onClick={onClick}
    >
      {/* 電影海報 */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={posterUrl}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
        />

        {/* 暗角漸層 */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-400/80 via-transparent to-transparent" />

        {/* 評分標籤 */}
        <div className="absolute top-2 right-2">
          <Badge variant="pink" size="sm">
            ★ {movie.vote_average.toFixed(1)}
          </Badge>
        </div>

        {/* 訊號計數器 */}
        {signalCount > 0 && (
          <div className="absolute bottom-2 left-2">
            <div className="flex items-center gap-1 px-2.5 py-1 bg-dark-300/90 border border-neon-red/30 backdrop-blur-sm rounded">
              <Activity size={12} className="text-neon-red" />
              <span className="text-xs font-medium text-neon-red">
                {signalCount} 訊號
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 電影資訊 */}
      <div className="p-3 space-y-1.5">
        <h3 className="text-sm font-serif font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-neon-red transition-colors duration-200">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-stone-500">
          <span>{movie.release_date?.slice(0, 4) || '未定'}</span>
          <span>{movie.vote_count} 評</span>
        </div>
      </div>
    </Card>
  )
}
