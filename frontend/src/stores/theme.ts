import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // State
  const isDark = ref(false)
  
  // Getters
  const theme = computed(() => isDark.value ? 'dark' : 'light')
  const themeIcon = computed(() => isDark.value ? 'sun' : 'moon')
  
  // Actions
  function toggleTheme() {
    isDark.value = !isDark.value
    updateTheme()
  }
  
  function setTheme(dark: boolean) {
    isDark.value = dark
    updateTheme()
  }
  
  function updateTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }
  
  function initializeTheme() {
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setTheme(true)
    } else {
      setTheme(false)
    }
  }
  
  return {
    // State
    isDark,
    
    // Getters
    theme,
    themeIcon,
    
    // Actions
    toggleTheme,
    setTheme,
    initializeTheme
  }
})