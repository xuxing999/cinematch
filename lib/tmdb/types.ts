// @ts-nocheck
/**
 * TMDB API 回應類型定義
 */

export interface TMDBMovie {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  adult: boolean
  genre_ids: number[]
}

export interface TMDBTrendingResponse {
  page: number
  results: TMDBMovie[]
  total_pages: number
  total_results: number
}

export interface TMDBGenre {
  id: number
  name: string
}

export interface TMDBGenresResponse {
  genres: TMDBGenre[]
}

/**
 * 圖片尺寸配置
 */
export const TMDB_IMAGE_SIZES = {
  poster: {
    small: 'w185',
    medium: 'w342',
    large: 'w500',
    original: 'original',
  },
  backdrop: {
    small: 'w300',
    medium: 'w780',
    large: 'w1280',
    original: 'original',
  },
} as const

/**
 * 取得完整圖片 URL
 */
export function getTMDBImageUrl(
  path: string | null,
  type: 'poster' | 'backdrop' = 'poster',
  size: keyof typeof TMDB_IMAGE_SIZES.poster = 'medium'
): string {
  if (!path) return '/images/placeholder-movie.jpg'

  const baseUrl = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p'
  const imageSize = TMDB_IMAGE_SIZES[type][size]

  return `${baseUrl}/${imageSize}${path}`
}
