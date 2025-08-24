<template>
  <button
    @click="toggleTheme"
    :class="[
      'relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 hover:scale-105 active:scale-95 group',
      isDark ? 'bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg shadow-primary-500/25' : 'bg-gradient-to-r from-gray-200 to-gray-300 shadow-lg shadow-gray-500/25'
    ]"
    role="switch"
    :aria-checked="isDark"
    aria-label="Toggle dark mode"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <!-- Background glow effect -->
    <div 
      :class="[
        'absolute inset-0 rounded-full transition-opacity duration-300',
        isDark ? 'bg-gradient-to-r from-blue-400/30 to-purple-400/30 opacity-100' : 'bg-gradient-to-r from-yellow-400/30 to-orange-400/30 opacity-0'
      ]"
    ></div>
    
    <!-- Toggle knob -->
    <span
      :class="[
        'relative inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 ease-out shadow-lg',
        isDark ? 'translate-x-6 shadow-primary-500/50' : 'translate-x-1 shadow-gray-500/50',
        'group-hover:scale-110'
      ]"
    >
      <!-- Icon container -->
      <span class="absolute inset-0 flex items-center justify-center overflow-hidden">
        <!-- Sun icon -->
        <SunIcon
          :class="[
            'h-3 w-3 text-yellow-500 absolute transition-all duration-300 transform',
            isDark ? 'opacity-0 rotate-180 scale-75' : 'opacity-100 rotate-0 scale-100'
          ]"
        />
        <!-- Moon icon -->
        <MoonIcon
          :class="[
            'h-3 w-3 text-primary-600 absolute transition-all duration-300 transform',
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-75'
          ]"
        />
      </span>
      
      <!-- Ripple effect -->
      <div 
        v-if="isAnimating"
        class="absolute inset-0 bg-current opacity-20 rounded-full animate-ping"
        style="animation-duration: 0.6s;"
      ></div>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

const themeStore = useThemeStore()
const isAnimating = ref(false)

const isDark = computed(() => themeStore.isDark)

async function toggleTheme() {
  isAnimating.value = true
  
  // Add a small delay for visual feedback
  setTimeout(() => {
    themeStore.toggleTheme()
  }, 100)
  
  // Reset animation state
  setTimeout(() => {
    isAnimating.value = false
  }, 600)
}
</script>