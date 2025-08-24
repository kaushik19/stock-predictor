<template>
  <header class="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and Brand -->
        <div class="flex items-center">
          <button
            @click="toggleSidebar"
            data-sidebar-toggle
            class="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Bars3Icon class="h-6 w-6 transition-transform duration-200" :class="{ 'rotate-90': sidebarOpen }" />
          </button>
          
          <router-link to="/dashboard" class="flex items-center ml-2 lg:ml-0 group">
            <div class="flex-shrink-0 flex items-center">
              <div class="relative h-10 w-10 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <ChartBarIcon class="h-6 w-6 text-white" />
                <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
              </div>
              <div class="ml-3 hidden sm:block">
                <h1 class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Stock Predictor
                </h1>
                <p class="text-xs text-primary-600 dark:text-primary-400 font-medium -mt-1">
                  Indian Market Intelligence
                </p>
              </div>
            </div>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex space-x-8">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            :class="[
              'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
              isActiveRoute(item.href)
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
          >
            <component :is="item.icon" class="h-4 w-4 inline mr-2" />
            {{ item.name }}
          </router-link>
        </nav>

        <!-- Right side actions -->
        <div class="flex items-center space-x-4">
          <!-- Search -->
          <div class="relative hidden md:block">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-4 w-4 text-gray-400" />
            </div>
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Search stocks..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            
            <!-- Search Results Dropdown -->
            <div
              v-if="searchResults.length > 0 && searchQuery"
              class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
            >
              <router-link
                v-for="stock in searchResults"
                :key="stock.symbol"
                :to="`/stock/${stock.symbol}`"
                @click="clearSearch"
                class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-medium">{{ stock.symbol }}</span>
                    <span class="text-gray-500 dark:text-gray-400 ml-2">{{ stock.name }}</span>
                  </div>
                  <span class="text-sm font-medium">₹{{ stock.price }}</span>
                </div>
              </router-link>
            </div>
          </div>

          <!-- Notifications -->
          <button
            class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <BellIcon class="h-5 w-5" />
          </button>

          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 hover:scale-105 active:scale-95 group"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <div class="relative overflow-hidden">
              <SunIcon 
                v-if="isDark" 
                class="h-5 w-5 transition-all duration-500 transform"
                :class="isDark ? 'rotate-0 opacity-100' : 'rotate-180 opacity-0'"
              />
              <MoonIcon 
                v-else 
                class="h-5 w-5 transition-all duration-500 transform"
                :class="!isDark ? 'rotate-0 opacity-100' : '-rotate-180 opacity-0'"
              />
            </div>
            <div class="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <!-- User Menu -->
          <div v-if="isAuthenticated" class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <div class="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {{ userInitials }}
              </div>
            </button>

            <!-- User Dropdown -->
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  @click="showUserMenu = false"
                >
                  Profile
                </router-link>
                <router-link
                  to="/settings"
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  @click="showUserMenu = false"
                >
                  Settings
                </router-link>
                <hr class="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Sign out
                </button>
              </div>
            </transition>
          </div>

          <!-- Login Button -->
          <router-link
            v-else
            to="/login"
            class="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
          >
            Sign In
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useStocksStore } from '@/stores/stocks'
import { debounce } from '@/utils/formatters'
import {
  Bars3Icon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  HomeIcon,
  ChartPieIcon,
  BriefcaseIcon,
  BookmarkIcon,
  NewspaperIcon
} from '@heroicons/vue/24/outline'

// Stores
const authStore = useAuthStore()
const themeStore = useThemeStore()
const stocksStore = useStocksStore()
const router = useRouter()
const route = useRoute()

// Reactive state
const showUserMenu = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const sidebarOpen = ref(false)

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated)
const userInitials = computed(() => authStore.userInitials)
const isDark = computed(() => themeStore.isDark)

// Navigation items
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Analysis', href: '/analysis', icon: ChartPieIcon },
  { name: 'Portfolio', href: '/portfolio', icon: BriefcaseIcon },
  { name: 'Watchlist', href: '/watchlist', icon: BookmarkIcon },
  { name: 'News', href: '/news', icon: NewspaperIcon }
]

// Emits
const emit = defineEmits<{
  toggleSidebar: []
}>()

// Methods
function toggleSidebar() {
  emit('toggleSidebar')
}

function toggleTheme() {
  themeStore.toggleTheme()
}

function isActiveRoute(href: string): boolean {
  return route.path === href || route.path.startsWith(href + '/')
}

const handleSearch = debounce(async (event: Event) => {
  const query = (event.target as HTMLInputElement).value
  if (query.length >= 2) {
    try {
      const results = await stocksStore.searchStocks(query)
      searchResults.value = results.slice(0, 5) // Limit to 5 results
    } catch (error) {
      console.error('Search error:', error)
      searchResults.value = []
    }
  } else {
    searchResults.value = []
  }
}, 300)

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
}

async function handleLogout() {
  showUserMenu.value = false
  await authStore.logout()
  router.push('/')
}

// Close user menu when clicking outside
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>