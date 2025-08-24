<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
    <!-- Sidebar -->
    <AppSidebar 
      :is-open="sidebarOpen" 
      @close="sidebarOpen = false" 
    />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col lg:ml-0">
      <!-- Header -->
      <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <!-- Breadcrumbs -->
          <nav v-if="showBreadcrumbs" class="flex mb-6" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
              <li v-for="(crumb, index) in breadcrumbs" :key="index" class="flex items-center">
                <router-link
                  v-if="crumb.href && index < breadcrumbs.length - 1"
                  :to="crumb.href"
                  class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium"
                >
                  {{ crumb.name }}
                </router-link>
                <span
                  v-else
                  class="text-gray-900 dark:text-white text-sm font-medium"
                >
                  {{ crumb.name }}
                </span>
                <ChevronRightIcon
                  v-if="index < breadcrumbs.length - 1"
                  class="h-4 w-4 text-gray-400 mx-2"
                />
              </li>
            </ol>
          </nav>

          <!-- Page Header -->
          <div v-if="pageTitle || pageDescription" class="mb-8">
            <div class="flex items-center justify-between">
              <div>
                <h1 v-if="pageTitle" class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ pageTitle }}
                </h1>
                <p v-if="pageDescription" class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {{ pageDescription }}
                </p>
              </div>
              <div v-if="$slots.actions" class="flex items-center space-x-3">
                <slot name="actions" />
              </div>
            </div>
          </div>

          <!-- Main Content Slot -->
          <div class="animate-fade-in">
            <slot />
          </div>
        </div>
      </main>

      <!-- Footer -->
      <AppFooter />
    </div>

    <!-- Loading Overlay -->
    <transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isLoading"
        class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl p-8 flex flex-col items-center space-y-4 shadow-2xl border border-gray-200 dark:border-gray-700 animate-slide-up">
          <div class="relative">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 dark:border-primary-800"></div>
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-primary-600 absolute inset-0"></div>
          </div>
          <div class="text-center">
            <span class="text-gray-900 dark:text-white font-semibold text-lg">Loading...</span>
            <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">Please wait while we fetch your data</p>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notifications Container -->
    <div id="toast-container" class="fixed top-4 right-4 z-50 space-y-2">
      <!-- Toasts will be rendered here -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import AppFooter from './AppFooter.vue'
import { ChevronRightIcon } from '@heroicons/vue/24/outline'

interface Props {
  pageTitle?: string
  pageDescription?: string
  showBreadcrumbs?: boolean
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showBreadcrumbs: true,
  isLoading: false
})

const route = useRoute()
const sidebarOpen = ref(false)

// Generate breadcrumbs from route
const breadcrumbs = computed(() => {
  const pathSegments = route.path.split('/').filter(segment => segment)
  const crumbs = [{ name: 'Home', href: '/dashboard' }]
  
  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    // Convert segment to readable name
    let name = segment.charAt(0).toUpperCase() + segment.slice(1)
    name = name.replace(/-/g, ' ')
    
    // Don't add href for the last segment (current page)
    const href = index === pathSegments.length - 1 ? undefined : currentPath
    
    crumbs.push({ name, href })
  })
  
  return crumbs.length > 1 ? crumbs : []
})

// Close sidebar when route changes (mobile)
watch(route, () => {
  sidebarOpen.value = false
})

// Close sidebar when clicking outside (mobile)
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (sidebarOpen.value && !target.closest('.sidebar') && !target.closest('[data-sidebar-toggle]')) {
    sidebarOpen.value = false
  }
}

// Add click outside listener for mobile
if (typeof window !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
}
</script>

<style scoped>
/* Custom scrollbar for webkit browsers */
main::-webkit-scrollbar {
  width: 6px;
}

main::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

main::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

main::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}
</style>