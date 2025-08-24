import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// Import stores for initialization
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize stores after pinia is installed
const authStore = useAuthStore()
const themeStore = useThemeStore()

// Initialize theme
themeStore.initializeTheme()

// Initialize auth state
authStore.initializeAuth()

app.mount('#app')