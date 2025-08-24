<template>
  <div class="space-y-1">
    <label 
      v-if="label" 
      :for="id" 
      class="block text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    
    <div class="relative">
      <input
        :id="id"
        :name="name"
        :type="inputType"
        :placeholder="placeholder"
        :required="required"
        :autocomplete="autocomplete"
        :value="modelValue"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        class="input-field transition-all duration-200 ease-in-out"
        :class="[
          inputClasses,
          {
            'border-red-300 focus:border-red-500 focus:ring-red-500': hasError,
            'border-green-300 focus:border-green-500 focus:ring-green-500': isValid && touched,
            'pr-10': type === 'password' || hasError || (isValid && touched)
          }
        ]"
      />
      
      <!-- Password toggle button -->
      <button
        v-if="type === 'password'"
        type="button"
        @click="togglePasswordVisibility"
        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
      >
        <svg 
          class="h-5 w-5" 
          :class="{ 'hidden': showPassword, 'block': !showPassword }"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <svg 
          class="h-5 w-5" 
          :class="{ 'block': showPassword, 'hidden': !showPassword }"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
        </svg>
      </button>
      
      <!-- Validation icons -->
      <div 
        v-else-if="hasError || (isValid && touched)"
        class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
      >
        <svg 
          v-if="hasError"
          class="h-5 w-5 text-red-500" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fill-rule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
            clip-rule="evenodd" 
          />
        </svg>
        <svg 
          v-else-if="isValid && touched"
          class="h-5 w-5 text-green-500" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fill-rule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
            clip-rule="evenodd" 
          />
        </svg>
      </div>
    </div>
    
    <!-- Error message -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 transform -translate-y-1"
      enter-to-class="opacity-100 transform translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 transform translate-y-0"
      leave-to-class="opacity-0 transform -translate-y-1"
    >
      <p v-if="hasError" class="text-sm text-red-600 dark:text-red-400">
        {{ errorMessage }}
      </p>
    </transition>
    
    <!-- Help text -->
    <p v-if="helpText && !hasError" class="text-sm text-gray-500 dark:text-gray-400">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  id: string
  name: string
  type: string
  label?: string
  placeholder?: string
  required?: boolean
  autocomplete?: string
  modelValue: string
  errorMessage?: string
  helpText?: string
  validator?: (value: string) => boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'blur'): void
  (e: 'focus'): void
}

const props = withDefaults(defineProps<Props>(), {
  required: false
})

const emit = defineEmits<Emits>()

const showPassword = ref(false)
const touched = ref(false)
const focused = ref(false)

const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

const hasError = computed(() => {
  return touched.value && !!props.errorMessage
})

const isValid = computed(() => {
  if (!props.validator || !props.modelValue) return false
  return props.validator(props.modelValue)
})

const inputClasses = computed(() => {
  return {
    'transform scale-105': focused.value,
    'shadow-lg': focused.value
  }
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = () => {
  touched.value = true
  focused.value = false
  emit('blur')
}

const handleFocus = () => {
  focused.value = true
  emit('focus')
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>