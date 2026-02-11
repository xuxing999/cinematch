// @ts-nocheck
import { TMDBTrendingResponse, TMDBGenresResponse } from './types'

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_API_BASE_URL = process.env.NEXT_PUBLIC_TMDB_API_BASE_URL || 'https://api.themoviedb.org/3'

/**
 * TMDB API 客戶端
 */
class TMDBClient {
  private apiKey: string
  private baseUrl: string

  constructor() {
    if (!TMDB_API_KEY) {
      throw new Error('TMDB API Key is not configured')
    }
    this.apiKey = TMDB_API_KEY
    this.baseUrl = TMDB_API_BASE_URL
  }

  /**
   * 發送 GET 請求
   */
  private async get<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    url.searchParams.append('api_key', this.apiKey)
    url.searchParams.append('language', 'zh-TW') // 使用繁體中文

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // 快取 1 小時
    })

    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 取得今日趨勢電影
   */
  async getTrendingMovies(page = 1): Promise<TMDBTrendingResponse> {
    return this.get<TMDBTrendingResponse>('/trending/movie/day', {
      page: page.toString(),
    })
  }

  /**
   * 取得本週趨勢電影
   */
  async getTrendingMoviesWeek(page = 1): Promise<TMDBTrendingResponse> {
    return this.get<TMDBTrendingResponse>('/trending/movie/week', {
      page: page.toString(),
    })
  }

  /**
   * 取得現正熱映電影
   */
  async getNowPlayingMovies(page = 1): Promise<TMDBTrendingResponse> {
    return this.get<TMDBTrendingResponse>('/movie/now_playing', {
      page: page.toString(),
      region: 'TW', // 限定台灣地區
    })
  }

  /**
   * 取得即將上映電影
   */
  async getUpcomingMovies(page = 1): Promise<TMDBTrendingResponse> {
    return this.get<TMDBTrendingResponse>('/movie/upcoming', {
      page: page.toString(),
      region: 'TW',
    })
  }

  /**
   * 取得電影詳細資訊
   */
  async getMovieDetails(movieId: number) {
    return this.get(`/movie/${movieId}`)
  }

  /**
   * 搜尋電影
   */
  async searchMovies(query: string, page = 1): Promise<TMDBTrendingResponse> {
    return this.get<TMDBTrendingResponse>('/search/movie', {
      query,
      page: page.toString(),
    })
  }

  /**
   * 取得電影類型列表
   */
  async getGenres(): Promise<TMDBGenresResponse> {
    return this.get<TMDBGenresResponse>('/genre/movie/list')
  }
}

// 匯出單例實例
export const tmdbClient = new TMDBClient()
