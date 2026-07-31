import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  type UserInfo,
  type LoginForm,
  type RegisterForm,
  loginApi,
  registerApi,
  getUserInfoApi,
} from '../api/auth'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref<UserInfo | null>(
    localStorage.getItem(USER_KEY) ? JSON.parse(localStorage.getItem(USER_KEY)!) : null
  )
  const loading = ref<boolean>(false)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  /**
   * 设置认证信息
   */
  const setAuth = (newToken: string, newUserInfo: UserInfo) => {
    token.value = newToken
    user.value = newUserInfo
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUserInfo))
  }

  /**
   * 清理认证状态
   */
  const clearAuth = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  /**
   * 登录
   */
  const login = async (form: LoginForm) => {
    loading.value = true
    try {
      const res = await loginApi(form)
      if (res.code === 200 && res.data) {
        setAuth(res.data.token, res.data.user)
        return { success: true, message: res.message }
      }
      return { success: false, message: res.message }
    } catch (error: any) {
      return { success: false, message: error?.message || '网络繁忙，请重试' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 注册
   */
  const register = async (form: RegisterForm) => {
    loading.value = true
    try {
      const res = await registerApi(form)
      if (res.code === 200 && res.data) {
        setAuth(res.data.token, res.data.user)
        return { success: true, message: res.message }
      }
      return { success: false, message: res.message }
    } catch (error: any) {
      return { success: false, message: error?.message || '网络繁忙，请重试' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 退出登录
   */
  const logout = () => {
    clearAuth()
  }

  /**
   * 恢复与检查登录状态
   */
  const checkAuth = async () => {
    if (!token.value) {
      clearAuth()
      return false
    }
    const userInfo = await getUserInfoApi(token.value)
    if (userInfo) {
      user.value = userInfo
      localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
      return true
    } else {
      clearAuth()
      return false
    }
  }

  return {
    token,
    user,
    loading,
    isLoggedIn,
    login,
    register,
    logout,
    checkAuth,
  }
})
