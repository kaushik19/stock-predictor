<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8">
        <div class="flex items-center space-x-4">
          <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {{ userInitials }}
          </div>
          <div>
            <h1 class="text-2xl font-bold text-white">{{ user?.name || 'User Profile' }}</h1>
            <p class="text-primary-100">{{ user?.email }}</p>
            <p class="text-primary-200 text-sm">Member since {{ formatDate(user?.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="flex space-x-8 px-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
            :class="activeTab === tab.id 
              ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="p-6">
        <!-- Personal Information Tab -->
        <div v-if="activeTab === 'personal'" class="space-y-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
          
          <form @submit.prevent="updateProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                id="name"
                name="name"
                type="text"
                label="Full Name"
                v-model="profileForm.name"
                :error-message="errors.name"
                required
              />
              
              <FormInput
                id="email"
                name="email"
                type="email"
                label="Email Address"
                v-model="profileForm.email"
                :error-message="errors.email"
                required
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Investment Experience
                </label>
                <select
                  v-model="profileForm.experience"
                  class="input-field"
                >
                  <option value="">Select experience level</option>
                  <option value="beginner">Beginner (0-1 years)</option>
                  <option value="intermediate">Intermediate (1-5 years)</option>
                  <option value="expert">Expert (5+ years)</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Risk Tolerance
                </label>
                <select
                  v-model="profileForm.riskTolerance"
                  class="input-field"
                >
                  <option value="">Select risk tolerance</option>
                  <option value="low">Low - Conservative</option>
                  <option value="medium">Medium - Balanced</option>
                  <option value="high">High - Aggressive</option>
                </select>
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="updating"
                class="btn-primary"
              >
                <span v-if="updating" class="loading-spinner mr-2"></span>
                {{ updating ? 'Updating...' : 'Update Profile' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Security Tab -->
        <div v-if="activeTab === 'security'" class="space-y-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h2>
          
          <form @submit.prevent="changePassword" class="space-y-4">
            <FormInput
              id="currentPassword"
              name="currentPassword"
              type="password"
              label="Current Password"
              v-model="passwordForm.currentPassword"
              :error-message="errors.currentPassword"
              required
            />

            <FormInput
              id="newPassword"
              name="newPassword"
              type="password"
              label="New Password"
              v-model="passwordForm.newPassword"
              :error-message="errors.newPassword"
              required
            />

            <PasswordStrengthIndicator 
              v-if="passwordForm.newPassword"
              :password="passwordForm.newPassword" 
            />

            <FormInput
              id="confirmNewPassword"
              name="confirmNewPassword"
              type="password"
              label="Confirm New Password"
              v-model="passwordForm.confirmNewPassword"
              :error-message="errors.confirmNewPassword"
              required
            />

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="changingPassword"
                class="btn-primary"
              >
                <span v-if="changingPassword" class="loading-spinner mr-2"></span>
                {{ changingPassword ? 'Changing...' : 'Change Password' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Preferences Tab -->
        <div v-if="activeTab === 'preferences'" class="space-y-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Preferences</h2>
          
          <div class="space-y-4">
            <div>
              <h3 class="text-md font-medium text-gray-900 dark:text-white mb-3">Notification Settings</h3>
              <div class="space-y-3">
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="preferences.emailNotifications"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Email notifications</span>
                </label>
                
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="preferences.pushNotifications"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Push notifications</span>
                </label>
                
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    v-model="preferences.marketAlerts"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Market alerts</span>
                </label>
              </div>
            </div>

            <div>
              <h3 class="text-md font-medium text-gray-900 dark:text-white mb-3">Display Settings</h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Default Time Horizon
                  </label>
                  <select
                    v-model="preferences.defaultTimeHorizon"
                    class="input-field max-w-xs"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency Display
                  </label>
                  <select
                    v-model="preferences.currency"
                    class="input-field max-w-xs"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="flex justify-end">
              <button
                @click="savePreferences"
                :disabled="savingPreferences"
                class="btn-primary"
              >
                <span v-if="savingPreferences" class="loading-spinner mr-2"></span>
                {{ savingPreferences ? 'Saving...' : 'Save Preferences' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import FormInput from './FormInput.vue'
import PasswordStrengthIndicator from './PasswordStrengthIndicator.vue'

const authStore = useAuthStore()

const activeTab = ref('personal')
const updating = ref(false)
const changingPassword = ref(false)
const savingPreferences = ref(false)

const tabs = [
  { id: 'personal', name: 'Personal Info' },
  { id: 'security', name: 'Security' },
  { id: 'preferences', name: 'Preferences' }
]

const user = computed(() => authStore.user)
const userInitials = computed(() => authStore.userInitials)

const profileForm = reactive({
  name: '',
  email: '',
  experience: '',
  riskTolerance: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

const preferences = reactive({
  emailNotifications: true,
  pushNotifications: false,
  marketAlerts: true,
  defaultTimeHorizon: 'monthly',
  currency: 'INR'
})

const errors = reactive({
  name: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const validateProfileForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  if (!profileForm.name.trim()) {
    errors.name = 'Name is required'
    isValid = false
  }

  if (!profileForm.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  return isValid
}

const validatePasswordForm = () => {
  // Reset errors
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmNewPassword = ''

  let isValid = true

  if (!passwordForm.currentPassword) {
    errors.currentPassword = 'Current password is required'
    isValid = false
  }

  if (!passwordForm.newPassword) {
    errors.newPassword = 'New password is required'
    isValid = false
  } else if (passwordForm.newPassword.length < 8) {
    errors.newPassword = 'Password must be at least 8 characters long'
    isValid = false
  }

  if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
    errors.confirmNewPassword = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

const updateProfile = async () => {
  if (!validateProfileForm()) return

  updating.value = true
  try {
    // TODO: Implement profile update API call
    console.log('Updating profile:', profileForm)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Show success message
    alert('Profile updated successfully!')
  } catch (error) {
    console.error('Profile update error:', error)
    alert('Failed to update profile. Please try again.')
  } finally {
    updating.value = false
  }
}

const changePassword = async () => {
  if (!validatePasswordForm()) return

  changingPassword.value = true
  try {
    // TODO: Implement password change API call
    console.log('Changing password')
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Reset form
    Object.keys(passwordForm).forEach(key => {
      passwordForm[key as keyof typeof passwordForm] = ''
    })
    
    // Show success message
    alert('Password changed successfully!')
  } catch (error) {
    console.error('Password change error:', error)
    alert('Failed to change password. Please try again.')
  } finally {
    changingPassword.value = false
  }
}

const savePreferences = async () => {
  savingPreferences.value = true
  try {
    // TODO: Implement preferences save API call
    console.log('Saving preferences:', preferences)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Show success message
    alert('Preferences saved successfully!')
  } catch (error) {
    console.error('Preferences save error:', error)
    alert('Failed to save preferences. Please try again.')
  } finally {
    savingPreferences.value = false
  }
}

onMounted(() => {
  // Initialize form with user data
  if (user.value) {
    profileForm.name = user.value.name
    profileForm.email = user.value.email
  }
})
</script>