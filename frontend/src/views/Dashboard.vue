<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Navigation will be added in next tasks -->
    <div class="p-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Dashboard
        </h1>
        
        <!-- Placeholder content -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="card p-6">
            <h3 class="text-lg font-semibold mb-2">Portfolio Value</h3>
            <p class="text-2xl font-bold text-success-600">₹1,25,000</p>
            <p class="text-sm text-gray-500">+2.5% today</p>
          </div>
          
          <div class="card p-6">
            <h3 class="text-lg font-semibold mb-2">Day's P&L</h3>
            <p class="text-2xl font-bold text-success-600">+₹3,125</p>
            <p class="text-sm text-gray-500">+2.5%</p>
          </div>
          
          <div class="card p-6">
            <h3 class="text-lg font-semibold mb-2">Watchlist</h3>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">12</p>
            <p class="text-sm text-gray-500">stocks tracked</p>
          </div>
          
          <div class="card p-6">
            <h3 class="text-lg font-semibold mb-2">Alerts</h3>
            <p class="text-2xl font-bold text-primary-600">3</p>
            <p class="text-sm text-gray-500">new notifications</p>
          </div>
        </div>

        <!-- Recommendations placeholder -->
        <div class="mt-8 card p-6">
          <h2 class="text-xl font-bold mb-4">Today's Recommendations</h2>
          <div class="text-center py-8 text-gray-500">
            Recommendations will be loaded here...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard'
}
</script>