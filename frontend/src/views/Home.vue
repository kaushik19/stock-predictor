<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <!-- Navigation -->
    <nav class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-primary-600 dark:text-primary-400">
              📈 Stock Predictor
            </h1>
          </div>
          <div class="flex items-center space-x-4">
            <button @click="toggleTheme" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <span v-if="isDark">🌞</span>
              <span v-else>🌙</span>
            </button>
            <router-link to="/login" class="btn-secondary">Login</router-link>
            <router-link to="/register" class="btn-primary">Get Started</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center">
        <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Predict Indian Stock Market
          <span class="text-primary-600 dark:text-primary-400">with AI</span>
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Get intelligent stock recommendations for daily, weekly, monthly, and yearly investments. 
          Powered by comprehensive analysis of live data, financial metrics, and market sentiment.
        </p>
        <div class="flex justify-center space-x-4">
          <router-link to="/register" class="btn-primary text-lg px-8 py-3">
            Start Predicting
          </router-link>
          <button class="btn-secondary text-lg px-8 py-3">
            View Demo
          </button>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div class="card p-6 text-center hover:shadow-xl transition-shadow duration-300">
          <div class="text-4xl mb-4">📊</div>
          <h3 class="text-lg font-semibold mb-2">Real-time Analysis</h3>
          <p class="text-gray-600 dark:text-gray-400">Live market data with instant price updates and volume analysis</p>
        </div>
        
        <div class="card p-6 text-center hover:shadow-xl transition-shadow duration-300">
          <div class="text-4xl mb-4">🎯</div>
          <h3 class="text-lg font-semibold mb-2">Multi-timeframe</h3>
          <p class="text-gray-600 dark:text-gray-400">Daily, weekly, monthly, and yearly investment recommendations</p>
        </div>
        
        <div class="card p-6 text-center hover:shadow-xl transition-shadow duration-300">
          <div class="text-4xl mb-4">📰</div>
          <h3 class="text-lg font-semibold mb-2">News Sentiment</h3>
          <p class="text-gray-600 dark:text-gray-400">AI-powered news analysis and market sentiment tracking</p>
        </div>
        
        <div class="card p-6 text-center hover:shadow-xl transition-shadow duration-300">
          <div class="text-4xl mb-4">💼</div>
          <h3 class="text-lg font-semibold mb-2">Portfolio Tracking</h3>
          <p class="text-gray-600 dark:text-gray-400">Monitor your investments with detailed P&L analysis</p>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="mt-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div class="text-3xl font-bold text-primary-600 dark:text-primary-400">500+</div>
            <div class="text-gray-600 dark:text-gray-400">Indian Stocks Covered</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-success-600 dark:text-success-400">85%</div>
            <div class="text-gray-600 dark:text-gray-400">Prediction Accuracy</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">24/7</div>
            <div class="text-gray-600 dark:text-gray-400">Market Monitoring</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'Home',
  setup() {
    const isDark = ref(false)

    const toggleTheme = () => {
      isDark.value = !isDark.value
      if (isDark.value) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    }

    onMounted(() => {
      isDark.value = document.documentElement.classList.contains('dark')
    })

    return {
      isDark,
      toggleTheme
    }
  }
}
</script>