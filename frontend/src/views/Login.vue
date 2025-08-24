<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header with animation -->
      <div class="text-center animate-fade-in-up">
        <router-link to="/" class="text-3xl font-bold text-primary-600 dark:text-primary-400 hover:scale-105 transition-transform duration-200 inline-block">
          📈 Stock Predictor
        </router-link>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Or
          <router-link to="/register" class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors duration-200">
            create a new account
          </router-link>
        </p>
      </div>
      
      <!-- Login Form Card -->
      <div class="card p-8 animate-fade-in-up animation-delay-200">
        <!-- Error Alert -->
        <transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="opacity-0 transform -translate-y-2"
          enter-to-class="opacity-100 transform translate-y-0"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100 transform translate-y-0"
          leave-to-class="opacity-0 transform -translate-y-2"
        >
          <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div class="flex">
              <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
              </div>
            </div>
          </div>
        </transition>

        <form class="space-y-6" @submit.prevent="handleLogin">
          <FormInput
            id="email"
            name="email"
            type="email"
            label="Email address"
            placeholder="Enter your email"
            autocomplete="email"
            v-model="form.email"
            :error-message="errors.email"
            :validator="validateEmail"
            required
          />

          <FormInput
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            autocomplete="current-password"
            v-model="form.password"
            :error-message="errors.password"
            required
          />

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                v-model="form.rememberMe"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors duration-200"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div class="text-sm">
              <a href="#" class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors duration-200">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="w-full btn-primary flex justify-center items-center transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
            >
              <span v-if="loading" class="loading-spinner mr-2"></span>
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>
        </form>

        <!-- Social Login Section -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <SocialLoginButton 
              provider="Google" 
              :loading="socialLoading.google"
              @click="handleSocialLogin('google')"
            />
            <SocialLoginButton 
              provider="Facebook" 
              :loading="socialLoading.facebook"
              @click="handleSocialLogin('facebook')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FormInput from '@/components/auth/FormInput.vue'
import SocialLoginButton from '@/components/auth/SocialLoginButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  email: '',
  password: ''
})

const socialLoading = reactive({
  google: false,
  facebook: false
})

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const isFormValid = computed(() => {
  return form.email && 
         form.password && 
         validateEmail(form.email) &&
         form.password.length >= 6
})

const validateForm = () => {
  errors.email = ''
  errors.password = ''
  
  let isValid = true

  if (!form.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!validateEmail(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return

  loading.value = true
  error.value = ''
  
  try {
    const success = await authStore.login(form.email, form.password)
    
    if (success) {
      router.push('/dashboard')
    } else {
      error.value = authStore.error || 'Login failed. Please check your credentials.'
    }
  } catch (err: any) {
    error.value = err.message || 'An unexpected error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleSocialLogin = async (provider: 'google' | 'facebook') => {
  socialLoading[provider] = true
  
  try {
    // TODO: Implement social login
    console.log(`${provider} login clicked`)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // For now, show a message
    alert(`${provider} login will be implemented soon!`)
  } catch (err) {
    console.error(`${provider} login error:`, err)
    error.value = `Failed to login with ${provider}. Please try again.`
  } finally {
    socialLoading[provider] = false
  }
}
</script>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out;
}

.animation-delay-200 {
  animation-delay: 0.2s;
  animation-fill-mode: both;
}
</style>