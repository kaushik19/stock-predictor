import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Stock, StockRecommendation, StockQuality } from '@/types'
import { stocksApi, recommendationsApi, stockQualityApi } from '@/services/api'

export const useStocksStore = defineStore('stocks', () => {
  // State
  const stocks = ref<Stock[]>([])
  const currentStock = ref<Stock | null>(null)
  const recommendations = ref<{
    daily: StockRecommendation[]
    weekly: StockRecommendation[]
    monthly: StockRecommendation[]
    yearly: StockRecommendation[]
  }>({
    daily: [],
    weekly: [],
    monthly: [],
    yearly: []
  })
  const stockOfTheWeek = ref<StockRecommendation | null>(null)
  const stockOfTheMonth = ref<StockRecommendation | null>(null)
  const stockQuality = ref<StockQuality | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const topGainers = computed(() => 
    stocks.value
      .filter(stock => stock.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 10)
  )

  const topLosers = computed(() => 
    stocks.value
      .filter(stock => stock.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 10)
  )

  const mostActive = computed(() => 
    stocks.value
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10)
  )

  // Actions
  async function fetchStocks() {
    isLoading.value = true
    error.value = null

    try {
      const response = await stocksApi.getStocks()
      if (response.success) {
        stocks.value = response.data
      } else {
        error.value = response.message || 'Failed to fetch stocks'
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch stocks'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchStock(symbol: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await stocksApi.getStock(symbol)
      if (response.success) {
        currentStock.value = response.data
      } else {
        error.value = response.message || 'Failed to fetch stock'
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch stock'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRecommendations() {
    isLoading.value = true
    error.value = null

    try {
      const [daily, weekly, monthly, yearly] = await Promise.all([
        recommendationsApi.getDailyRecommendations(),
        recommendationsApi.getWeeklyRecommendations(),
        recommendationsApi.getMonthlyRecommendations(),
        recommendationsApi.getYearlyRecommendations()
      ])

      if (daily.success) recommendations.value.daily = daily.data.recommendations
      if (weekly.success) recommendations.value.weekly = weekly.data.recommendations
      if (monthly.success) recommendations.value.monthly = monthly.data.recommendations
      if (yearly.success) recommendations.value.yearly = yearly.data.recommendations

    } catch (err: any) {
      error.value = err.message || 'Failed to fetch recommendations'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchStockOfTheWeek() {
    try {
      const response = await recommendationsApi.getStockOfTheWeek()
      if (response.success) {
        stockOfTheWeek.value = response.data.stockOfTheWeek
      }
    } catch (err: any) {
      console.error('Failed to fetch stock of the week:', err)
    }
  }

  async function fetchStockOfTheMonth() {
    try {
      const response = await recommendationsApi.getStockOfTheMonth()
      if (response.success) {
        stockOfTheMonth.value = response.data.stockOfTheMonth
      }
    } catch (err: any) {
      console.error('Failed to fetch stock of the month:', err)
    }
  }

  async function fetchStockQuality(symbol: string, sector?: string) {
    try {
      const response = await stockQualityApi.getStockQuality(symbol, sector)
      if (response.success) {
        stockQuality.value = response.data
      }
    } catch (err: any) {
      console.error('Failed to fetch stock quality:', err)
    }
  }

  async function searchStocks(query: string) {
    try {
      const response = await stocksApi.searchStocks(query)
      if (response.success) {
        return response.data
      }
      return []
    } catch (err: any) {
      console.error('Failed to search stocks:', err)
      return []
    }
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentStock() {
    currentStock.value = null
    stockQuality.value = null
  }

  return {
    // State
    stocks,
    currentStock,
    recommendations,
    stockOfTheWeek,
    stockOfTheMonth,
    stockQuality,
    isLoading,
    error,

    // Getters
    topGainers,
    topLosers,
    mostActive,

    // Actions
    fetchStocks,
    fetchStock,
    fetchRecommendations,
    fetchStockOfTheWeek,
    fetchStockOfTheMonth,
    fetchStockQuality,
    searchStocks,
    clearError,
    clearCurrentStock
  }
})