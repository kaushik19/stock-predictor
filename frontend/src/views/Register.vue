<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <router-link to="/" class="text-3xl font-bold text-primary-600 dark:text-primary-400">
          📈 Stock Predictor
        </router-link>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Already have an account?
          <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
            Sign in here
          </router-link>
        </p>
      </div>
      
      <div class="card p-8">
        <form class="space-y-6" @submit.prevent="handleRegister">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              v-model="form.name"
              class="input-field mt-1"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              v-model="form.email"
              class="input-field mt-1"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              v-model="form.password"
              class="input-field mt-1"
              placeholder="Create a password"
            />
            <div class="mt-1 text-xs text-gray-500">
              Password must be at least 8 characters long
            </div>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              v-model="form.confirmPassword"
              class="input-field mt-1"
              placeholder="Confirm your password"
            />
          </div>

          <div>
            <label for="experience" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Investment Experience
            </label>
            <select
              id="experience"
              name="experience"
              v-model="form.experience"
              class="input-field mt-1"
            >
              <option value="">Select your experience level</option>
              <option value="beginner">Beginner (0-1 years)</option>
              <option value="intermediate">Intermediate (1-5 years)</option>
              <option value="expert">Expert (5+ years)</option>
            </select>
          </div>

          <div>
            <label for="riskTolerance" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Risk Tolerance
            </label>
            <select
              id="riskTolerance"
              name="riskTolerance"
              v-model="form.riskTolerance"
              class="input-field mt-1"
            >
              <option value="">Select your risk tolerance</option>
              <option value="low">Low - Conservative investments</option>
              <option value="medium">Medium - Balanced approach</option>
              <option value="high">High - Aggressive growth</option>
            </select>
          </div>

          <div class="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              v-model="form.acceptTerms"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label for="terms" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              I agree to the
              <a href="#" class="text-primary-600 hover:text-primary-500 dark:text-primary-400">Terms of Service</a>
              and
              <a href="#" class="text-primary-600 hover:text-primary-500 dark:text-primary-400">Privacy Policy</a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="w-full btn-primary flex justify-center items-center disabled:opacity-50"
            >
              <span v-if="loading" class="loading-spinner mr-2"></span>
              {{ loading ? 'Creating account...' : 'Create account' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const form = ref({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      experience: '',
      riskTolerance: '',
      acceptTerms: false
    })

    const isFormValid = computed(() => {
      return form.value.name &&
             form.value.email &&
             form.value.password &&
             form.value.confirmPassword &&
             form.value.password === form.value.confirmPassword &&
             form.value.password.length >= 8 &&
             form.value.experience &&
             form.value.riskTolerance &&
             form.value.acceptTerms
    })

    const handleRegister = async () => {
      if (!isFormValid.value) return
      
      loading.value = true
      
      try {
        // TODO: Implement actual registration API call
        console.log('Registration attempt:', form.value)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // For now, just redirect to dashboard
        router.push('/dashboard')
      } catch (error) {
        console.error('Registration error:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      isFormValid,
      handleRegister
    }
  }
}
</script>