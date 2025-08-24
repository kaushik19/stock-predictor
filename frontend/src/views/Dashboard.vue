<template>
  <AppLayout 
    page-title="Dashboard" 
    page-description="Your investment overview and market insights"
    :is-loading="isLoading"
  >
    <!-- Quick stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div 
        v-for="(stat, index) in stats" 
        :key="stat.title"
        class="card p-6 hover-lift stagger-animation animate-slide-up"
        :class="`stagger-${index + 1}`"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ stat.title }}</h3>
          <component :is="stat.icon" class="h-5 w-5 text-gray-400" />
        </div>
        <p :class="['text-2xl font-bold mb-1', stat.valueColor]">{{ stat.value }}</p>
        <p :class="['text-sm flex items-center', stat.changeColor]">
          <component :is="stat.changeIcon" class="h-4 w-4 mr-1" />
          {{ stat.change }}
        </p>
      </div>
    </div>

    <!-- Main content grid -->
    <div class="grid grid-cols-1 xl:grid-cols-4 gap-8">
      <!-- Recommendations Section -->
      <div class="xl:col-span-3">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Today's Recommendations -->
          <div class="card p-6 animate-slide-up stagger-5">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Today's Picks</h2>
              <Badge variant="success" size="sm">{{ dailyRecommendations.length }} stocks</Badge>
            </div>
            
            <div class="space-y-4">
              <div 
                v-for="(rec, index) in dailyRecommendations.slice(0, 3)" 
                :key="index"
                class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover-lift cursor-pointer transition-all duration-200"
                @click="viewStockDetail(rec.symbol)"
              >
                <div class="flex items-center space-x-3">
                  <div class="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <span class="text-primary-600 dark:text-primary-400 font-semibold text-xs">{{ rec.symbol }}</span>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white text-sm">{{ rec.symbol }}</p>
                    <div class="flex items-center space-x-2">
                      <Badge :variant="getRecommendationVariant(rec.recommendation)" size="xs">
                        {{ rec.recommendation.replace('_', ' ').toUpperCase() }}
                      </Badge>
                      <span class="text-xs text-gray-500">{{ rec.confidence }}%</span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-gray-900 dark:text-white text-sm">₹{{ formatPrice(rec.currentPrice) }}</p>
                  <p class="text-xs text-success-600">Target: ₹{{ formatPrice(rec.targetPrice) }}</p>
                </div>
              </div>
            </div>
            
            <div v-if="stocksStore.isLoading" class="text-center py-8">
              <LoadingSpinner size="md" text="Loading recommendations..." />
            </div>
            
            <div v-if="dailyRecommendations.length === 0 && !stocksStore.isLoading" class="text-center py-8 text-gray-500">
              No recommendations available
            </div>
          </div>

          <!-- Stock of the Week -->
          <div class="card p-6 animate-slide-up stagger-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Stock of the Week</h2>
              <Badge variant="primary" size="sm">Featured</Badge>
            </div>
            
            <div v-if="stocksStore.stockOfTheWeek" class="space-y-4">
              <div class="text-center p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg">
                <div class="h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-white font-bold text-lg">{{ stocksStore.stockOfTheWeek.symbol.slice(0, 2) }}</span>
                </div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ stocksStore.stockOfTheWeek.symbol }}</h3>
                <div class="flex items-center justify-center space-x-4 mb-4">
                  <Badge :variant="getRecommendationVariant(stocksStore.stockOfTheWeek.recommendation)">
                    {{ stocksStore.stockOfTheWeek.recommendation.replace('_', ' ').toUpperCase() }}
                  </Badge>
                  <span class="text-sm font-medium text-primary-600">{{ stocksStore.stockOfTheWeek.confidence }}% confidence</span>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-gray-500">Current Price</p>
                    <p class="font-semibold">₹{{ formatPrice(stocksStore.stockOfTheWeek.currentPrice) }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500">Target Price</p>
                    <p class="font-semibold text-success-600">₹{{ formatPrice(stocksStore.stockOfTheWeek.targetPrice) }}</p>
                  </div>
                </div>
              </div>
              <Button @click="viewStockDetail(stocksStore.stockOfTheWeek.symbol)" class="w-full" variant="primary">
                View Analysis
              </Button>
            </div>
            
            <div v-else class="text-center py-8">
              <LoadingSpinner size="md" text="Loading featured stock..." />
            </div>
          </div>
        </div>

        <!-- Market Indices -->
        <div class="card p-6 animate-slide-up stagger-7">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Market Overview</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="index in marketIndices" :key="index.name" class="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{{ index.name }}</h3>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mb-1">{{ index.value }}</p>
              <p :class="['text-sm flex items-center justify-center', index.changeColor]">
                <component :is="index.changeIcon" class="h-4 w-4 mr-1" />
                {{ index.change }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="xl:col-span-1 space-y-6">
        <!-- Quick Actions -->
        <div class="card p-6 animate-slide-up stagger-4">
          <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <Button @click="viewStockOfWeek" class="w-full" variant="primary" size="sm">
              <TrendingUpIcon class="h-4 w-4 mr-2" />
              Stock of the Week
            </Button>
            <Button @click="viewPortfolio" class="w-full" variant="secondary" size="sm">
              <CurrencyDollarIcon class="h-4 w-4 mr-2" />
              View Portfolio
            </Button>
            <Button @click="viewWatchlist" class="w-full" variant="secondary" size="sm">
              <EyeIcon class="h-4 w-4 mr-2" />
              Manage Watchlist
            </Button>
            <Button @click="viewNews" class="w-full" variant="secondary" size="sm">
              <BellIcon class="h-4 w-4 mr-2" />
              Market News
            </Button>
          </div>
        </div>

        <!-- Top Gainers -->
        <div class="card p-6 animate-slide-up stagger-8">
          <h3 class="text-lg font-semibold mb-4">Top Gainers</h3>
          <div class="space-y-3">
            <div v-for="stock in topGainers.slice(0, 5)" :key="stock.symbol" 
                 class="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded"
                 @click="viewStockDetail(stock.symbol)">
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ stock.symbol }}</p>
                <p class="text-xs text-gray-500">{{ stock.name?.slice(0, 20) }}...</p>
              </div>
              <div class="text-right">
                <p class="font-semibold">₹{{ formatPrice(stock.price) }}</p>
                <p class="text-success-600 text-xs">+{{ stock.changePercent?.toFixed(2) }}%</p>
              </div>
            </div>
          </div>
          <div v-if="topGainers.length === 0" class="text-center py-4 text-gray-500 text-sm">
            Loading market data...
          </div>
        </div>

        <!-- Top Losers -->
        <div class="card p-6 animate-slide-up stagger-9">
          <h3 class="text-lg font-semibold mb-4">Top Losers</h3>
          <div class="space-y-3">
            <div v-for="stock in topLosers.slice(0, 5)" :key="stock.symbol" 
                 class="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded"
                 @click="viewStockDetail(stock.symbol)">
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ stock.symbol }}</p>
                <p class="text-xs text-gray-500">{{ stock.name?.slice(0, 20) }}...</p>
              </div>
              <div class="text-right">
                <p class="font-semibold">₹{{ formatPrice(stock.price) }}</p>
                <p class="text-red-600 text-xs">{{ stock.changePercent?.toFixed(2) }}%</p>
              </div>
            </div>
          </div>
          <div v-if="topLosers.length === 0" class="text-center py-4 text-gray-500 text-sm">
            Loading market data...
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import { useStocksStore } from '@/stores/stocks'
import { 
  CurrencyDollarIcon, 
  TrendingUpIcon, 
  EyeIcon, 
  BellIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const stocksStore = useStocksStore()

const isLoading = ref(false)

// Computed properties
const dailyRecommendations = computed(() => stocksStore.recommendations.daily)
const topGainers = computed(() => stocksStore.topGainers)
const topLosers = computed(() => stocksStore.topLosers)

const stats = ref([
  {
    title: 'Portfolio Value',
    value: '₹1,25,000',
    change: '+2.5% today',
    changeColor: 'text-success-600',
    valueColor: 'text-success-600',
    icon: CurrencyDollarIcon,
    changeIcon: ArrowUpIcon
  },
  {
    title: "Day's P&L",
    value: '+₹3,125',
    change: '+2.5%',
    changeColor: 'text-success-600',
    valueColor: 'text-success-600',
    icon: TrendingUpIcon,
    changeIcon: ArrowUpIcon
  },
  {
    title: 'Watchlist',
    value: '12',
    change: 'stocks tracked',
    changeColor: 'text-gray-500',
    valueColor: 'text-gray-900 dark:text-white',
    icon: EyeIcon,
    changeIcon: EyeIcon
  },
  {
    title: 'Alerts',
    value: '3',
    change: 'new notifications',
    changeColor: 'text-gray-500',
    valueColor: 'text-primary-600',
    icon: BellIcon,
    changeIcon: BellIcon
  }
])

const marketIndices = ref([
  {
    name: 'NIFTY 50',
    value: '19,674.25',
    change: '+0.85%',
    changeColor: 'text-success-600',
    changeIcon: ArrowUpIcon
  },
  {
    name: 'SENSEX',
    value: '66,230.15',
    change: '+0.92%',
    changeColor: 'text-success-600',
    changeIcon: ArrowUpIcon
  },
  {
    name: 'BANK NIFTY',
    value: '44,156.80',
    change: '-0.23%',
    changeColor: 'text-red-600',
    changeIcon: ArrowDownIcon
  }
])

// Helper functions
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN').format(price)
}

const getRecommendationVariant = (recommendation: string) => {
  switch (recommendation) {
    case 'strong_buy':
      return 'success'
    case 'buy':
      return 'success'
    case 'hold':
      return 'warning'
    case 'sell':
      return 'danger'
    case 'strong_sell':
      return 'danger'
    default:
      return 'secondary'
  }
}

// Navigation functions
const viewStockDetail = (symbol: string) => {
  router.push(`/stocks/${symbol}`)
}

const viewStockOfWeek = () => {
  if (stocksStore.stockOfTheWeek) {
    viewStockDetail(stocksStore.stockOfTheWeek.symbol)
  }
}

const viewPortfolio = () => {
  router.push('/portfolio')
}

const viewWatchlist = () => {
  router.push('/watchlist')
}

const viewNews = () => {
  router.push('/news')
}

// Load data on mount
onMounted(async () => {
  isLoading.value = true
  
  try {
    // Load all dashboard data in parallel
    await Promise.all([
      stocksStore.fetchRecommendations(),
      stocksStore.fetchStockOfTheWeek(),
      stocksStore.fetchStockOfTheMonth(),
      stocksStore.fetchStocks()
    ])
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    isLoading.value = false
  }
})
</script>