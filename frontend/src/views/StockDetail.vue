<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="p-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Stock Analysis - {{ $route.params.symbol }}
        </h1>
        
        <div class="card p-6">
          <div class="text-center py-8 text-gray-500">
            Stock analysis will be implemented here...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StockDetail'
}
</script>