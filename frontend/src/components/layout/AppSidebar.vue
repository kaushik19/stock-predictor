<template>
  <!-- Mobile sidebar overlay -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-40 lg:hidden"
    @click="closeSidebar"
  >
    <div class="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
  </div>

  <!-- Sidebar -->
  <div
    :class="[
      'sidebar fixed inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 shadow-xl lg:shadow-none',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
  >
    <div class="flex flex-col h-full">
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 lg:hidden">
        <div class="flex items-center animate-slide-up">
          <div class="relative h-10 w-10 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
            <ChartBarIcon class="h-6 w-6 text-white" />
            <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
          </div>
          <div class="ml-3">
            <h1 class="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Stock Predictor
            </h1>
          </div>
        </div>
        <button
          @click="closeSidebar"
          class="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <XMarkIcon class="h-6 w-6 transition-transform duration-200 hover:rotate-90" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <!-- Main Navigation -->
        <div class="space-y-1">
          <h3 class="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Main
          </h3>
          <router-link
            v-for="(item, index) in mainNavigation"
            :key="item.name"
            :to="item.href"
            :class="[
              'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden',
              isActiveRoute(item.href)
                ? 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 dark:from-primary-900 dark:to-primary-800 dark:text-primary-200 shadow-sm'
                : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
            :style="{ animationDelay: `${index * 50}ms` }"
            class="animate-slide-up"
            @click="closeSidebar"
          >
            <component
              :is="item.icon"
              :class="[
                'mr-3 h-5 w-5 flex-shrink-0 transition-all duration-200',
                isActiveRoute(item.href)
                  ? 'text-primary-500 dark:text-primary-400 scale-110'
                  : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300 group-hover:scale-110'
              ]"
            />
            <span class="transition-all duration-200">{{ item.name }}</span>
            <Badge
              v-if="item.badge"
              :variant="item.badgeVariant"
              size="sm"
              class="ml-auto animate-pulse"
            >
              {{ item.badge }}
            </Badge>
            <!-- Active indicator -->
            <div
              v-if="isActiveRoute(item.href)"
              class="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-l-full"
            ></div>
          </router-link>
        </div>

        <!-- Analysis Section -->
        <div class="space-y-1 pt-6">
          <h3 class="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Analysis
          </h3>
          <router-link
            v-for="(item, index) in analysisNavigation"
            :key="item.name"
            :to="item.href"
            :class="[
              'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden',
              isActiveRoute(item.href)
                ? 'bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 dark:from-primary-900 dark:to-primary-800 dark:text-primary-200 shadow-sm'
                : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
            :style="{ animationDelay: `${(index + 4) * 50}ms` }"
            class="animate-slide-up"
            @click="closeSidebar"
          >
            <component
              :is="item.icon"
              :class="[
                'mr-3 h-5 w-5 flex-shrink-0 transition-all duration-200',
                isActiveRoute(item.href)
                  ? 'text-primary-500 dark:text-primary-400 scale-110'
                  : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300 group-hover:scale-110'
              ]"
            />
            <span class="transition-all duration-200">{{ item.name }}</span>
            <!-- Active indicator -->
            <div
              v-if="isActiveRoute(item.href)"
              class="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-l-full"
            ></div>
          </router-link>
        </div>

        <!-- Quick Actions -->
        <div class="space-y-1 pt-6">
          <h3 class="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Quick Actions
          </h3>
          <div class="space-y-2">
            <button
              @click="handleQuickAction('stock-of-week')"
              class="w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <StarIcon class="mr-3 h-5 w-5 flex-shrink-0 text-yellow-500 group-hover:text-yellow-600 transition-all duration-200 group-hover:scale-110 group-hover:rotate-12" />
              <span class="transition-all duration-200">Stock of the Week</span>
            </button>
            <button
              @click="handleQuickAction('stock-of-month')"
              class="w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <TrophyIcon class="mr-3 h-5 w-5 flex-shrink-0 text-yellow-500 group-hover:text-yellow-600 transition-all duration-200 group-hover:scale-110 group-hover:-rotate-12" />
              <span class="transition-all duration-200">Stock of the Month</span>
            </button>
          </div>
        </div>

        <!-- Market Status -->
        <div class="pt-6">
          <div class="px-4 py-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Market Status</h4>
              <div class="relative">
                <div :class="[
                  'h-3 w-3 rounded-full transition-all duration-300',
                  marketStatus.isOpen ? 'bg-green-400 shadow-green-400/50' : 'bg-red-400 shadow-red-400/50'
                ]" class="shadow-lg"></div>
                <div :class="[
                  'absolute inset-0 h-3 w-3 rounded-full animate-ping',
                  marketStatus.isOpen ? 'bg-green-400' : 'bg-red-400'
                ]"></div>
              </div>
            </div>
            <p :class="[
              'text-sm font-medium mb-1',
              marketStatus.isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            ]">
              {{ marketStatus.isOpen ? 'Market Open' : 'Market Closed' }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ marketStatus.nextSession }}
            </p>
          </div>
        </div>
      </nav>

      <!-- Sidebar Footer -->
      <div class="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div v-if="isAuthenticated" class="flex items-center">
          <div class="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {{ userInitials }}
          </div>
          <div class="ml-3 flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ user?.name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ user?.email }}
            </p>
          </div>
        </div>
        <div v-else class="text-center">
          <router-link
            to="/login"
            class="w-full bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200 inline-block"
            @click="closeSidebar"
          >
            Sign In
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Badge from '@/components/ui/Badge.vue'
import {
  ChartBarIcon,
  XMarkIcon,
  HomeIcon,
  ChartPieIcon,
  BriefcaseIcon,
  BookmarkIcon,
  NewspaperIcon,
  TrendingUpIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  StarIcon,
  TrophyIcon
} from '@heroicons/vue/24/outline'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

// Stores
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const userInitials = computed(() => authStore.userInitials)

// Market status (mock data - would be real-time in production)
const marketStatus = ref({
  isOpen: false,
  nextSession: 'Opens at 9:15 AM IST'
})

// Navigation items
const mainNavigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon 
  },
  { 
    name: 'Portfolio', 
    href: '/portfolio', 
    icon: BriefcaseIcon,
    badge: '5',
    badgeVariant: 'primary' as const
  },
  { 
    name: 'Watchlist', 
    href: '/watchlist', 
    icon: BookmarkIcon,
    badge: '12',
    badgeVariant: 'secondary' as const
  },
  { 
    name: 'News', 
    href: '/news', 
    icon: NewspaperIcon,
    badge: 'New',
    badgeVariant: 'success' as const
  }
]

const analysisNavigation = [
  { 
    name: 'Technical Analysis', 
    href: '/analysis/technical', 
    icon: TrendingUpIcon 
  },
  { 
    name: 'Fundamental Analysis', 
    href: '/analysis/fundamental', 
    icon: ScaleIcon 
  },
  { 
    name: 'Stock Quality', 
    href: '/analysis/quality', 
    icon: ChartPieIcon 
  },
  { 
    name: 'Recommendations', 
    href: '/recommendations', 
    icon: CurrencyDollarIcon 
  }
]

// Methods
function closeSidebar() {
  emit('close')
}

function isActiveRoute(href: string): boolean {
  return route.path === href || route.path.startsWith(href + '/')
}

function handleQuickAction(action: string) {
  closeSidebar()
  
  switch (action) {
    case 'stock-of-week':
      router.push('/recommendations/stock-of-week')
      break
    case 'stock-of-month':
      router.push('/recommendations/stock-of-month')
      break
  }
}

// Check market status on mount
onMounted(() => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = currentHour * 60 + currentMinute
  
  // Indian market hours: 9:15 AM to 3:30 PM IST (Monday to Friday)
  const marketOpen = 9 * 60 + 15  // 9:15 AM
  const marketClose = 15 * 60 + 30 // 3:30 PM
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5
  
  marketStatus.value.isOpen = isWeekday && currentTime >= marketOpen && currentTime <= marketClose
  
  if (!marketStatus.value.isOpen) {
    if (isWeekday && currentTime < marketOpen) {
      marketStatus.value.nextSession = 'Opens at 9:15 AM IST'
    } else if (isWeekday && currentTime > marketClose) {
      marketStatus.value.nextSession = 'Opens tomorrow at 9:15 AM IST'
    } else {
      marketStatus.value.nextSession = 'Opens Monday at 9:15 AM IST'
    }
  } else {
    marketStatus.value.nextSession = 'Closes at 3:30 PM IST'
  }
})
</script>