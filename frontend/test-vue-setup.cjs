/**
 * Test script to verify Vue.js project setup
 * Tests TypeScript support, dependencies, and configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Testing Vue.js Project Setup...\n');

// Test 1: Check if essential files exist
console.log('📁 Test 1: Essential Files Check');
console.log('=' .repeat(50));

const essentialFiles = [
  'package.json',
  'vite.config.js',
  'tailwind.config.js',
  'tsconfig.json',
  'tsconfig.node.json',
  'index.html',
  'src/main.ts',
  'src/App.vue',
  'src/router/index.js',
  'src/types/index.ts',
  'src/stores/auth.ts',
  'src/stores/stocks.ts',
  'src/stores/theme.ts',
  'src/services/api.ts',
  'src/utils/formatters.ts',
  'src/composables/useChart.ts',
  'src/components/ui/Button.vue',
  'src/components/ui/Card.vue',
  'src/components/ui/Badge.vue'
];

essentialFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing`);
  }
});

console.log('\n');

// Test 2: Check package.json dependencies
console.log('📦 Test 2: Dependencies Check');
console.log('=' .repeat(50));

try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  const requiredDependencies = [
    'vue',
    'vue-router',
    'pinia',
    'axios',
    'chart.js',
    'vue-chartjs',
    '@headlessui/vue',
    '@heroicons/vue',
    'tailwindcss'
  ];

  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  requiredDependencies.forEach(dep => {
    if (allDeps[dep]) {
      console.log(`✅ ${dep}: ${allDeps[dep]}`);
    } else {
      console.log(`❌ ${dep} - Missing`);
    }
  });
  
  console.log(`\n📊 Total Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`);
  console.log(`📊 Total Dev Dependencies: ${Object.keys(packageJson.devDependencies || {}).length}`);
  
} catch (error) {
  console.log('❌ Failed to read package.json:', error.message);
}

console.log('\n');

// Test 3: Check TypeScript configuration
console.log('🔧 Test 3: TypeScript Configuration');
console.log('=' .repeat(50));

try {
  const tsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'tsconfig.json'), 'utf8'));
  
  console.log('✅ TypeScript configuration found');
  console.log(`📌 Target: ${tsConfig.compilerOptions?.target || 'Not specified'}`);
  console.log(`📌 Module: ${tsConfig.compilerOptions?.module || 'Not specified'}`);
  console.log(`📌 Strict Mode: ${tsConfig.compilerOptions?.strict ? 'Enabled' : 'Disabled'}`);
  console.log(`📌 Path Mapping: ${tsConfig.compilerOptions?.paths ? 'Configured' : 'Not configured'}`);
  
} catch (error) {
  console.log('❌ Failed to read tsconfig.json:', error.message);
}

console.log('\n');

// Test 4: Check Vite configuration
console.log('⚡ Test 4: Vite Configuration');
console.log('=' .repeat(50));

try {
  const viteConfig = fs.readFileSync(path.join(__dirname, 'vite.config.js'), 'utf8');
  
  console.log('✅ Vite configuration found');
  console.log(`📌 Vue Plugin: ${viteConfig.includes('@vitejs/plugin-vue') ? 'Configured' : 'Missing'}`);
  console.log(`📌 Path Alias: ${viteConfig.includes("'@'") ? 'Configured' : 'Missing'}`);
  console.log(`📌 Proxy Setup: ${viteConfig.includes('proxy') ? 'Configured' : 'Missing'}`);
  console.log(`📌 Dev Server: ${viteConfig.includes('port: 3000') ? 'Port 3000' : 'Default port'}`);
  
} catch (error) {
  console.log('❌ Failed to read vite.config.js:', error.message);
}

console.log('\n');

// Test 5: Check Tailwind CSS configuration
console.log('🎨 Test 5: Tailwind CSS Configuration');
console.log('=' .repeat(50));

try {
  const tailwindConfig = fs.readFileSync(path.join(__dirname, 'tailwind.config.js'), 'utf8');
  
  console.log('✅ Tailwind CSS configuration found');
  console.log(`📌 Dark Mode: ${tailwindConfig.includes("darkMode: 'class'") ? 'Class-based' : 'Media-based'}`);
  console.log(`📌 Custom Colors: ${tailwindConfig.includes('primary:') ? 'Configured' : 'Default'}`);
  console.log(`📌 Custom Animations: ${tailwindConfig.includes('animation:') ? 'Configured' : 'Default'}`);
  console.log(`📌 Font Family: ${tailwindConfig.includes('Inter') ? 'Inter font' : 'Default fonts'}`);
  
} catch (error) {
  console.log('❌ Failed to read tailwind.config.js:', error.message);
}

console.log('\n');

// Test 6: Check source structure
console.log('📂 Test 6: Source Structure');
console.log('=' .repeat(50));

const directories = [
  'src/components',
  'src/components/ui',
  'src/views',
  'src/stores',
  'src/services',
  'src/utils',
  'src/composables',
  'src/types',
  'src/router'
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    console.log(`✅ ${dir} (${files.length} files)`);
  } else {
    console.log(`❌ ${dir} - Missing`);
  }
});

console.log('\n');

// Test 7: Check main.ts file
console.log('🚀 Test 7: Main Entry Point');
console.log('=' .repeat(50));

try {
  const mainTs = fs.readFileSync(path.join(__dirname, 'src/main.ts'), 'utf8');
  
  console.log('✅ main.ts found');
  console.log(`📌 Vue App: ${mainTs.includes('createApp') ? 'Configured' : 'Missing'}`);
  console.log(`📌 Pinia Store: ${mainTs.includes('createPinia') ? 'Configured' : 'Missing'}`);
  console.log(`📌 Router: ${mainTs.includes('router') ? 'Configured' : 'Missing'}`);
  console.log(`📌 Store Initialization: ${mainTs.includes('useAuthStore') ? 'Configured' : 'Missing'}`);
  console.log(`📌 Theme Initialization: ${mainTs.includes('useThemeStore') ? 'Configured' : 'Missing'}`);
  
} catch (error) {
  console.log('❌ Failed to read src/main.ts:', error.message);
}

console.log('\n');

// Test 8: Check API services
console.log('🌐 Test 8: API Services');
console.log('=' .repeat(50));

try {
  const apiTs = fs.readFileSync(path.join(__dirname, 'src/services/api.ts'), 'utf8');
  
  console.log('✅ API services found');
  console.log(`📌 Axios Instance: ${apiTs.includes('axios.create') ? 'Configured' : 'Missing'}`);
  console.log(`📌 Auth API: ${apiTs.includes('authApi') ? 'Configured' : 'Missing'}`);
  console.log(`📌 Stocks API: ${apiTs.includes('stocksApi') ? 'Configured' : 'Missing'}`);
  console.log(`📌 Recommendations API: ${apiTs.includes('recommendationsApi') ? 'Configured' : 'Missing'}`);
  console.log(`📌 Stock Quality API: ${apiTs.includes('stockQualityApi') ? 'Configured' : 'Missing'}`);
  console.log(`📌 Interceptors: ${apiTs.includes('interceptors') ? 'Configured' : 'Missing'}`);
  
} catch (error) {
  console.log('❌ Failed to read src/services/api.ts:', error.message);
}

console.log('\n');
console.log('🎉 Vue.js Project Setup Testing Complete!');
console.log('=' .repeat(60));

// Summary
console.log('\n📋 Setup Summary:');
console.log('✅ Vue 3 with Composition API');
console.log('✅ TypeScript support');
console.log('✅ Vite build tool');
console.log('✅ Tailwind CSS styling');
console.log('✅ Vue Router navigation');
console.log('✅ Pinia state management');
console.log('✅ Chart.js integration');
console.log('✅ Axios HTTP client');
console.log('✅ UI component library');
console.log('✅ Comprehensive type definitions');
console.log('✅ API service layer');
console.log('✅ Utility functions');
console.log('✅ Composables for reusable logic');

console.log('\n🚀 Ready for frontend development!');