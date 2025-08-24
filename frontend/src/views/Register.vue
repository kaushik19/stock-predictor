<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header with animation -->
      <div class="text-center animate-fade-in-up">
        <router-link to="/" class="text-3xl font-bold text-primary-600 dark:text-primary-400 hover:scale-105 transition-transform duration-200 inline-block">
          📈 Stock Predictor
        </router-link>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Already have an account?
          <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors duration-200">
            Sign in here
          </router-link>
        </p>
      </div>
      
      <!-- Registration Form Card -->
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

        <form class="space-y-6" @submit.prevent="handleRegister">
          <FormInput
            id="name"
            name="name"
            type="text"
            label="Full Name"
            placeholder="Enter your full name"
            v-model="form.name"
            :error-message="errors.name"
            required
          />

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

          <div>
            <FormInput
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Create a password"
              v-model="form.password"
              :error-message="errors.password"
              required
            />
            
            <!-- Password Strength Indicator -->
            <PasswordStrengthIndicator 
              v-if="form.password"
              :password="form.password" 
            />
          </div>

          <FormInput
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            v-model="form.confirmPassword"
            :error-message="errors.confirmPassword"
            required
          />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="experience" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Investment Experience <span class="text-red-500">*</span>
              </label>
              <select
                id="experience"
                name="experience"
                v-model="form.experience"
                class="input-field transition-all duration-200"
                :class="{ 'border-red-300 focus:border-red-500': errors.experience }"
              >
                <option value="">Select experience level</option>
                <option value="beginner">Beginner (0-1 years)</option>
                <option value="intermediate">Intermediate (1-5 years)</option>
                <option value="expert">Expert (5+ years)</option>
              </select>
              <p v-if="errors.experience" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ errors.experience }}
              </p>
            </div>

            <div>
              <label for="riskTolerance" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Risk Tolerance <span class="text-red-500">*</span>
              </label>
              <select
                id="riskTolerance"
                name="riskTolerance"
                v-model="form.riskTolerance"
                class="input-field transition-all duration-200"
                :class="{ 'border-red-300 focus:border-red-500': errors.riskTolerance }"
              >
                <option value="">Select risk tolerance</option>
                <option value="low">Low - Conservative</option>
                <option value="medium">Medium - Balanced</option>
                <option value="high">High - Aggressive</option>
              </select>
              <p v-if="errors.riskTolerance" class="mt-1 text-sm text-red-600 dark:text-red-400">
                {{ errors.riskTolerance }}
              </p>
            </div>
          </div>

          <div class="flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              v-model="form.acceptTerms"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1 transition-colors duration-200"
              :class="{ 'border-red-300': errors.acceptTerms }"
            />
            <label for="terms" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              I agree to the
              <a href="#" class="text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors duration-200">Terms of Service</a>
              and
              <a href="#" class="text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors duration-200">Privacy Policy</a>
            </label>
          </div>
          <p v-if="errors.acceptTerms" class="text-sm text-red-600 dark:text-red-400">
            {{ errors.acceptTerms }}
          </p>

          <div>
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="w-full btn-primary flex justify-center items-center transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
            >
              <span v-if="loading" class="loading-spinner mr-2"></span>
              {{ loading ? 'Creating account...' : 'Create account' }}
            </button>
          </div>
        </form>

        <!-- Social Registration Section -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">Or register with</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <SocialLoginButton 
              provider="Google" 
              :loading="socialLoading.google"
              @click="handleSocialRegister('google')"
            />
            <SocialLoginButton 
              provider="Facebook" 
              :loading="socialLoading.facebook"
              @click="handleSocialRegister('facebook')"
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
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator.vue'
import SocialLoginButton from '@/components/auth/SocialLoginButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  experience: '',
  riskTolerance: '',
  acceptTerms: false
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  experience: '',
  riskTolerance: '',
  acceptTerms: ''
})

const socialLoading = reactive({
  google: false,
  facebook: false
})

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const validatePassword = (password: string) => {
  return password.length >= 8 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /\d/.test(password)
}

const isFormValid = computed(() => {
  return form.name.trim() &&
         form.email &&
         validateEmail(form.email) &&
         form.password &&
         validatePassword(form.password) &&
         form.confirmPassword &&
         form.password === form.confirmPassword &&
         form.experience &&
         form.riskTolerance &&
         form.acceptTerms
})

const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
  
  let isValid = true

  if (!form.name.trim()) {
    errors.name = 'Full name is required'
    isValid = false
  }

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
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long'
    isValid = false
  } else if (!validatePassword(form.password)) {
    errors.password = 'Password must contain uppercase, lowercase, and number'
    isValid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  if (!form.experience) {
    errors.experience = 'Please select your investment experience'
    isValid = false
  }

  if (!form.riskTolerance) {
    errors.riskTolerance = 'Please select your risk tolerance'
    isValid = false
  }

  if (!form.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and conditions'
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) return

  loading.value = true
  error.value = ''
  
  try {
    const success = await authStore.register(form.name, form.email, form.password)
    
    if (success) {
      router.push('/dashboard')
    } else {
      error.value = authStore.error || 'Registration failed. Please try again.'
    }
  } catch (err: any) {
    error.value = err.message || 'An unexpected error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleSocialRegister = async (provider: 'google' | 'facebook') => {
  socialLoading[provider] = true
  
  try {
    // TODO: Implement social registration
    console.log(`${provider} registration clicked`)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // For now, show a message
    alert(`${provider} registration will be implemented soon!`)
  } catch (err) {
    console.error(`${provider} registration error:`, err)
    error.value = `Failed to register with ${provider}. Please try again.`
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