<template>
  <div :class="containerClasses">
    <div :class="spinnerClasses" class="relative">
      <!-- Outer ring -->
      <div class="animate-spin rounded-full border-2 border-current opacity-20"></div>
      <!-- Inner spinning ring -->
      <div class="animate-spin rounded-full border-2 border-current border-t-transparent absolute inset-0" style="animation-duration: 1s;"></div>
      <!-- Pulse effect -->
      <div class="absolute inset-0 rounded-full border-2 border-current opacity-30 animate-ping" style="animation-duration: 2s;"></div>
    </div>
    <span v-if="text" :class="textClasses" class="animate-pulse">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'white'
  text?: string
  center?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'primary',
  center: false
})

const containerClasses = computed(() => {
  const baseClasses = ['flex items-center']
  
  if (props.center) {
    baseClasses.push('justify-center')
  }
  
  if (props.text) {
    baseClasses.push('space-x-2')
  }
  
  return baseClasses.join(' ')
})

const spinnerClasses = computed(() => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const variantClasses = {
    primary: 'text-primary-600',
    secondary: 'text-gray-600 dark:text-gray-400',
    white: 'text-white'
  }

  return [
    sizeClasses[props.size],
    variantClasses[props.variant]
  ].join(' ')
})

const textClasses = computed(() => {
  const variantClasses = {
    primary: 'text-gray-700 dark:text-gray-300',
    secondary: 'text-gray-600 dark:text-gray-400',
    white: 'text-white'
  }

  return [
    'text-sm font-medium',
    variantClasses[props.variant]
  ].join(' ')
})
</script>