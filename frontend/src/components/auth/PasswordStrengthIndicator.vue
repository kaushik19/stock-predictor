<template>
  <div class="mt-2">
    <div class="flex items-center space-x-2 mb-2">
      <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          class="h-2 rounded-full transition-all duration-300 ease-in-out"
          :class="strengthColor"
          :style="{ width: `${strengthPercentage}%` }"
        ></div>
      </div>
      <span class="text-xs font-medium" :class="strengthTextColor">
        {{ strengthText }}
      </span>
    </div>
    
    <div class="space-y-1">
      <div 
        v-for="requirement in requirements" 
        :key="requirement.text"
        class="flex items-center text-xs transition-colors duration-200"
        :class="requirement.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'"
      >
        <svg 
          class="w-3 h-3 mr-2 transition-transform duration-200"
          :class="requirement.met ? 'scale-100' : 'scale-75 opacity-50'"
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            v-if="requirement.met"
            fill-rule="evenodd" 
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
            clip-rule="evenodd"
          />
          <circle v-else cx="10" cy="10" r="2"/>
        </svg>
        {{ requirement.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  password: string
}

const props = defineProps<Props>()

const requirements = computed(() => [
  {
    text: 'At least 8 characters',
    met: props.password.length >= 8
  },
  {
    text: 'Contains uppercase letter',
    met: /[A-Z]/.test(props.password)
  },
  {
    text: 'Contains lowercase letter',
    met: /[a-z]/.test(props.password)
  },
  {
    text: 'Contains number',
    met: /\d/.test(props.password)
  },
  {
    text: 'Contains special character',
    met: /[!@#$%^&*(),.?":{}|<>]/.test(props.password)
  }
])

const metRequirements = computed(() => 
  requirements.value.filter(req => req.met).length
)

const strengthPercentage = computed(() => 
  (metRequirements.value / requirements.value.length) * 100
)

const strengthLevel = computed(() => {
  const met = metRequirements.value
  if (met <= 1) return 'weak'
  if (met <= 2) return 'fair'
  if (met <= 3) return 'good'
  if (met <= 4) return 'strong'
  return 'excellent'
})

const strengthText = computed(() => {
  const levels = {
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
    excellent: 'Excellent'
  }
  return levels[strengthLevel.value]
})

const strengthColor = computed(() => {
  const colors = {
    weak: 'bg-red-500',
    fair: 'bg-orange-500',
    good: 'bg-yellow-500',
    strong: 'bg-blue-500',
    excellent: 'bg-green-500'
  }
  return colors[strengthLevel.value]
})

const strengthTextColor = computed(() => {
  const colors = {
    weak: 'text-red-600 dark:text-red-400',
    fair: 'text-orange-600 dark:text-orange-400',
    good: 'text-yellow-600 dark:text-yellow-400',
    strong: 'text-blue-600 dark:text-blue-400',
    excellent: 'text-green-600 dark:text-green-400'
  }
  return colors[strengthLevel.value]
})
</script>