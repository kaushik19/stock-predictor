import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { authApi } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userInitials = computed(() => {
    if (!user.value?.profile?.name) return ''
    return user.value.profile.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
  })

  // Actions
  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.login(email, password)
      
      if (response.success) {
        token.value = response.data.token
        user.value = response.data.user
        localStorage.setItem('token', response.data.token)
        return true
      } else {
        error.value = response.message || 'Login failed'
        return false
      }
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function register(name: string, email: string, password: string, profile?: any) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.register(name, email, password)
      
      if (response.success) {
        token.value = response.data.token
        user.value = response.data.user
        localStorage.setItem('token', response.data.token)
        return true
      } else {
        error.value = response.message || 'Registration failed'
        return false
      }
    } catch (err: any) {
      error.value = err.message || 'Registration failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      if (token.value) {
        await authApi.logout()
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('token')
    }
  }

  async function fetchProfile() {
    if (!token.value) return

    try {
      const response = await authApi.getProfile()
      if (response.success) {
        user.value = response.data
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      // If token is invalid, logout
      await logout()
    }
  }

  async function updateProfile(profileData: Partial<User>) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.updateProfile(profileData)
      
      if (response.success) {
        user.value = { ...user.value, ...response.data }
        return true
      } else {
        error.value = response.message || 'Profile update failed'
        return false
      }
    } catch (err: any) {
      error.value = err.message || 'Profile update failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.changePassword(currentPassword, newPassword)
      
      if (response.success) {
        return true
      } else {
        error.value = response.message || 'Password change failed'
        return false
      }
    } catch (err: any) {
      error.value = err.message || 'Password change failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  // Initialize auth state
  function initializeAuth() {
    if (token.value) {
      fetchProfile()
    }
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    userInitials,
    
    // Actions
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
    changePassword,
    clearError,
    initializeAuth
  }
})