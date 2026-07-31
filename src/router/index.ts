import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 登录与注册
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/AuthView.vue'),
      meta: { requiresAuth: false },
    },
    // 股票页面
    {
      path: '/',
      name: 'stock',
      component: () => import('../views/StockView.vue'),
      meta: { requiresAuth: true },
    },
    // 用户管理测试页面
    {
      path: '/sqliteTest',
      name: 'sqliteTest',
      component: () => import('../views/sqliteTest.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// 路由守卫
router.beforeEach(async (to, _from) => {
  const authStore = useAuthStore()

  // 如果访问登录页，且已登录，则直接重定向到主页
  if (to.name === 'login' && authStore.isLoggedIn) {
    return { path: '/' }
  }

  // 如果目标路由需要登录鉴权，且未登录
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})


export default router

