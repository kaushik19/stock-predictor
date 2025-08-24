<template>
  <div 
    class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover-lift cursor-pointer transition-all duration-200"
    @click="$emit('click')"
  >
    <div class="flex items-center space-x-3">
      <div class="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
        <span class="text-primary-600 dark:text-primary-400 font-semibold text-xs">
          {{ symbol.slice(0, 3) }}
        </span>
      </div>
      <div>
        <p class="font-medium text-gray-900 dark:text-white text-sm">{{ symbol }}</p>
        <div v-if="recommendation" class="flex items-center space-x-2">
          <Badge :variant="getRecommendationVariant(recommendation)" size="xs">
            {{ recommendation.replace('_', ' ').toUpperCase() }}
          </Badge>
          <span v-if="confidence" class="text-xs text-gray-500">{{ confidence }}%</span>
        </div>
        <p v-else-if="name" class="text-xs text-gray-500">{{ name.slice(0, 25) }}...</p>
      </div>
    </div>
    <div class="text-right">
      <p class="font-semibold text-gray-900 dark:text-white text-sm">₹{{ formatPrice(price) }}</p>
      <p v-if="targetPrice" class="text-xs text-success-600">Target: ₹{{ formatPrice(targetPrice) }}</p>
      <p v-else-if="changePercent !== undefined" :class="['text-xs', changePercent >= 0 ? 'text-success-600' : 'text-red-600']">
        {{ changePercent >= 0 ? '+' : '' }}{{ changePercent.toFixed(2) }}%
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Badge from '@/components/ui/Badge.vue'

interface Props {
  symbol: string
  name?: string
  price: number
  targetPrice?: number
  changePercent?: number
  recommendation?: string
  confidence?: number
}

defineProps<Props>()
defineEmits<{
  click: []
}>()

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN').format(price)
}

const getRecommendationVariant = (recommendation: string) => {
  switch (recommendation) {
    case 'strong_buy':
      return 'success'
    case 'buy':
      return 'success'
    case 'hold':
      return 'warning'
    case 'sell':
      return 'danger'
    case 'strong_sell':
      return 'danger'
    default:
      return 'secondary'
  }
}
</script>
</template>