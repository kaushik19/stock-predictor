<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <slot name="header" />
    </div>
    
    <div :class="bodyClasses">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  hover: false
})

const cardClasses = computed(() => {
  const baseClasses = [
    'bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-all duration-200'
  ]

  // Variant classes
  const variantClasses = {
    default: 'border border-gray-200 dark:border-gray-700',
    elevated: 'shadow-lg border border-gray-100 dark:border-gray-700',
    outlined: 'border-2 border-gray-300 dark:border-gray-600'
  }

  const classes = [
    ...baseClasses,
    variantClasses[props.variant]
  ]

  if (props.hover) {
    classes.push('hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer')
  }

  return classes.join(' ')
})

const bodyClasses = computed(() => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return paddingClasses[props.padding]
})
</script>