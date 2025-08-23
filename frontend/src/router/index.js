import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Dashboard - Indian Stock Predictor'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: 'Login - Indian Stock Predictor'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: {
      title: 'Register - Indian Stock Predictor'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: {
      title: 'Dashboard - Indian Stock Predictor',
      requiresAuth: true
    }
  },
  {
    path: '/stock/:symbol',
    name: 'StockDetail',
    component: () => import('../views/StockDetail.vue'),
    meta: {
      title: 'Stock Analysis - Indian Stock Predictor'
    }
  },
  {
    path: '/portfolio',
    name: 'Portfolio',
    component: () => import('../views/Portfolio.vue'),
    meta: {
      title: 'Portfolio - Indian Stock Predictor',
      requiresAuth: true
    }
  },
  {
    path: '/watchlist',
    name: 'Watchlist',
    component: () => import('../views/Watchlist.vue'),
    meta: {
      title: 'Watchlist - Indian Stock Predictor',
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  // Update page title
  document.title = to.meta.title || 'Indian Stock Predictor'
  
  // Check authentication requirement
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/login')
      return
    }
  }
  
  next()
})

export default router