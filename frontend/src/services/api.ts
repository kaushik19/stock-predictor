import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import type { 
  ApiResponse, 
  User, 
  Stock, 
  StockRecommendation, 
  StockQuality,
  Portfolio,
  Watchlist,
  NewsArticle 
} from '@/types'

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

// Authentication API
export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return api.post('/auth/login', { email, password })
  },

  async register(name: string, email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return api.post('/auth/register', { 
      email, 
      password, 
      profile: { 
        name 
      } 
    })
  },

  async logout(): Promise<ApiResponse<null>> {
    return api.post('/auth/logout')
  },

  async getProfile(): Promise<ApiResponse<User>> {
    return api.get('/auth/me')
  },

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return api.post('/auth/refresh')
  },

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    return api.put('/auth/profile', profileData)
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    return api.put('/auth/change-password', { currentPassword, newPassword })
  }
}

// Stocks API
export const stocksApi = {
  async getStocks(): Promise<ApiResponse<Stock[]>> {
    return api.get('/stocks')
  },

  async getStock(symbol: string): Promise<ApiResponse<Stock>> {
    return api.get(`/stocks/${symbol}`)
  },

  async searchStocks(query: string): Promise<ApiResponse<Stock[]>> {
    return api.get(`/stocks/search?q=${encodeURIComponent(query)}`)
  },

  async getStockPrice(symbol: string): Promise<ApiResponse<{ currentPrice: number; change: number; changePercent: number }>> {
    return api.get(`/stocks/${symbol}/price`)
  },

  async getHistoricalData(symbol: string, period: string = '1y'): Promise<ApiResponse<any>> {
    return api.get(`/stocks/${symbol}/historical?period=${period}`)
  }
}

// Recommendations API
export const recommendationsApi = {
  async getDailyRecommendations(limit: number = 10): Promise<ApiResponse<{ recommendations: StockRecommendation[] }>> {
    return api.get(`/recommendations/daily?limit=${limit}`)
  },

  async getWeeklyRecommendations(limit: number = 15): Promise<ApiResponse<{ recommendations: StockRecommendation[] }>> {
    return api.get(`/recommendations/weekly?limit=${limit}`)
  },

  async getMonthlyRecommendations(limit: number = 15): Promise<ApiResponse<{ recommendations: StockRecommendation[] }>> {
    return api.get(`/recommendations/monthly?limit=${limit}`)
  },

  async getYearlyRecommendations(limit: number = 20): Promise<ApiResponse<{ recommendations: StockRecommendation[] }>> {
    return api.get(`/recommendations/yearly?limit=${limit}`)
  },

  async getAllRecommendations(): Promise<ApiResponse<{
    daily: { recommendations: StockRecommendation[] }
    weekly: { recommendations: StockRecommendation[] }
    monthly: { recommendations: StockRecommendation[] }
    yearly: { recommendations: StockRecommendation[] }
  }>> {
    return api.get('/recommendations/all')
  },

  async getStockOfTheWeek(): Promise<ApiResponse<{ stockOfTheWeek: StockRecommendation }>> {
    return api.get('/recommendations/stock-of-the-week')
  },

  async getStockOfTheMonth(): Promise<ApiResponse<{ stockOfTheMonth: StockRecommendation }>> {
    return api.get('/recommendations/stock-of-the-month')
  },

  async analyzeStock(symbol: string, timeHorizon: string = 'monthly'): Promise<ApiResponse<StockRecommendation>> {
    return api.get(`/recommendations/analyze/${symbol}?timeHorizon=${timeHorizon}`)
  },

  async getDetailedAnalysis(symbol: string, timeHorizon: string = 'monthly'): Promise<ApiResponse<any>> {
    return api.get(`/recommendations/detailed-analysis/${symbol}?timeHorizon=${timeHorizon}`)
  },

  async getTopPicks(limit: number = 5): Promise<ApiResponse<{ topPicks: StockRecommendation[] }>> {
    return api.get(`/recommendations/top-picks?limit=${limit}`)
  }
}

// Stock Quality API
export const stockQualityApi = {
  async getStockQuality(symbol: string, sector?: string): Promise<ApiResponse<StockQuality>> {
    const params = sector ? `?sector=${sector}` : ''
    return api.get(`/stock-quality/${symbol}${params}`)
  },

  async getQualityDimensions(symbol: string, sector?: string): Promise<ApiResponse<{
    qualityDimensions: StockQuality['qualityDimensions']
    overallScore: number
    grade: string
  }>> {
    const params = sector ? `?sector=${sector}` : ''
    return api.get(`/stock-quality/${symbol}/dimensions${params}`)
  },

  async getStockEvaluation(symbol: string, sector?: string): Promise<ApiResponse<{
    evaluation: StockQuality['evaluation']
  }>> {
    const params = sector ? `?sector=${sector}` : ''
    return api.get(`/stock-quality/${symbol}/evaluation${params}`)
  },

  async getFinancialTrends(symbol: string, sector?: string): Promise<ApiResponse<{
    financialTrends: StockQuality['financialTrends']
  }>> {
    const params = sector ? `?sector=${sector}` : ''
    return api.get(`/stock-quality/${symbol}/trends${params}`)
  },

  async getSectorComparison(symbol: string, sector?: string): Promise<ApiResponse<{
    sectorComparison: StockQuality['sectorComparison']
  }>> {
    const params = sector ? `?sector=${sector}` : ''
    return api.get(`/stock-quality/${symbol}/sector-comparison${params}`)
  },

  async getBatchQuality(symbols: string[], sector?: string): Promise<ApiResponse<Array<{
    symbol: string
    qualityScore: number
    qualityGrade: string
    evaluation: string
    overallTrend: string
  }>>> {
    return api.post('/stock-quality/batch', { symbols, sector })
  }
}

// News API
export const newsApi = {
  async getFinancialNews(page: number = 1, pageSize: number = 20): Promise<ApiResponse<NewsArticle[]>> {
    return api.get(`/news/financial?page=${page}&pageSize=${pageSize}`)
  },

  async getStockNews(symbol: string, companyName: string): Promise<ApiResponse<NewsArticle[]>> {
    return api.get(`/news/stock/${symbol}?companyName=${encodeURIComponent(companyName)}`)
  },

  async searchNews(query: string): Promise<ApiResponse<NewsArticle[]>> {
    return api.get(`/news/search?q=${encodeURIComponent(query)}`)
  },

  async getMarketSentiment(): Promise<ApiResponse<{
    sentiment: any
    articleCount: number
    timeframe: string
  }>> {
    return api.get('/news/market-sentiment')
  }
}

// Portfolio API (placeholder for future implementation)
export const portfolioApi = {
  async getPortfolio(): Promise<ApiResponse<Portfolio>> {
    return api.get('/portfolio')
  },

  async addHolding(symbol: string, quantity: number, price: number): Promise<ApiResponse<Portfolio>> {
    return api.post('/portfolio/holdings', { symbol, quantity, price })
  },

  async updateHolding(symbol: string, quantity: number, price: number): Promise<ApiResponse<Portfolio>> {
    return api.put(`/portfolio/holdings/${symbol}`, { quantity, price })
  },

  async removeHolding(symbol: string): Promise<ApiResponse<Portfolio>> {
    return api.delete(`/portfolio/holdings/${symbol}`)
  }
}

// Watchlist API (placeholder for future implementation)
export const watchlistApi = {
  async getWatchlists(): Promise<ApiResponse<Watchlist[]>> {
    return api.get('/watchlist')
  },

  async createWatchlist(name: string): Promise<ApiResponse<Watchlist>> {
    return api.post('/watchlist', { name })
  },

  async addToWatchlist(watchlistId: string, symbol: string): Promise<ApiResponse<Watchlist>> {
    return api.post(`/watchlist/${watchlistId}/stocks`, { symbol })
  },

  async removeFromWatchlist(watchlistId: string, symbol: string): Promise<ApiResponse<Watchlist>> {
    return api.delete(`/watchlist/${watchlistId}/stocks/${symbol}`)
  }
}

export default api