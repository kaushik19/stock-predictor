<template>
  <div 
    id="app" 
    class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-500"
    :class="{ 'theme-transitioning': isThemeTransitioning }"
  >
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const isThemeTransitioning = ref(false)

// Watch for theme changes and add transition effect
watch(() => themeStore.isDark, () => {
  isThemeTransitioning.value = true
  
  // Remove transition class after animation completes
  setTimeout(() => {
    isThemeTransitioning.value = false
  }, 500)
})

onMounted(() => {
  // Theme is already initialized in main.ts
  // Add any additional app-level initialization here
})
</script>

<style>
/* Global theme transition styles */
.theme-transitioning * {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease !important;
}

/* Smooth page transitions */
.router-enter-active,
.router-leave-active {
  transition: all 0.3s ease;
}

.router-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.router-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>