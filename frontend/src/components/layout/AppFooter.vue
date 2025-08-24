<template>
  <footer class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <!-- Left side - Brand and links -->
        <div class="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
          <div class="flex items-center">
            <div class="h-6 w-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded flex items-center justify-center">
              <ChartBarIcon class="h-4 w-4 text-white" />
            </div>
            <span class="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              Stock Predictor
            </span>
          </div>
          
          <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <router-link 
              to="/about" 
              class="hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              About
            </router-link>
            <router-link 
              to="/privacy" 
              class="hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              Privacy
            </router-link>
            <router-link 
              to="/terms" 
              class="hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              Terms
            </router-link>
            <router-link 
              to="/contact" 
              class="hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              Contact
            </router-link>
          </div>
        </div>

        <!-- Right side - Copyright and status -->
        <div class="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center space-x-4">
            <!-- Market Status Indicator -->
            <div class="flex items-center space-x-2">
              <div :class="[
                'h-2 w-2 rounded-full',
                marketStatus.isOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              ]"></div>
              <span class="text-xs">
                {{ marketStatus.isOpen ? 'Market Open' : 'Market Closed' }}
              </span>
            </div>
            
            <!-- Last Updated -->
            <div class="flex items-center space-x-1">
              <ClockIcon class="h-3 w-3" />
              <span class="text-xs">
                Updated {{ lastUpdated }}
              </span>
            </div>
          </div>
          
          <div class="text-center md:text-right">
            <p>&copy; {{ currentYear }} Stock Predictor. All rights reserved.</p>
            <p class="text-xs mt-1">
              <span class="text-yellow-600 dark:text-yellow-400 font-medium">⚠️ Investment Disclaimer:</span>
              Not financial advice. Trade at your own risk.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Additional Info Bar -->
      <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 text-xs text-gray-500 dark:text-gray-400">
          <div class="flex items-center space-x-4">
            <span>Data provided by Yahoo Finance & Alpha Vantage</span>
            <span>•</span>
            <span>Real-time quotes delayed by 15 minutes</span>
          </div>
          
          <div class="flex items-center space-x-4">
            <span>Version {{ appVersion }}</span>
            <span>•</span>
            <div class="flex items-center space-x-1">
              <div class="h-2 w-2 bg-green-400 rounded-full"></div>
              <span>System Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChartBarIcon, ClockIcon } from '@heroicons/vue/24/outline'

// Reactive state
const marketStatus = ref({
  isOpen: false,
  nextSession: 'Opens at 9:15 AM IST'
})

const lastUpdated = ref('Just now')
const appVersion = ref('1.0.0')

// Computed properties
const currentYear = computed(() => new Date().getFullYear())

// Update last updated time
function updateLastUpdatedTime() {
  const now = new Date()
  const timeString = now.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
  lastUpdated.value = timeString
}

// Check market status
function checkMarketStatus() {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = currentHour * 60 + currentMinute
  
  // Indian market hours: 9:15 AM to 3:30 PM IST (Monday to Friday)
  const marketOpen = 9 * 60 + 15  // 9:15 AM
  const marketClose = 15 * 60 + 30 // 3:30 PM
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5
  
  marketStatus.value.isOpen = isWeekday && currentTime >= marketOpen && currentTime <= marketClose
}

onMounted(() => {
  // Initial checks
  checkMarketStatus()
  updateLastUpdatedTime()
  
  // Update every minute
  setInterval(() => {
    checkMarketStatus()
    updateLastUpdatedTime()
  }, 60000)
})
</script>