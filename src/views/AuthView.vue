<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  User,
  Lock,
  Message,
  Key,
  Right,
  Select,
  Platform,
} from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 当前卡片模式: 'login' | 'register'
const activeMode = ref<'login' | 'register'>('login')

// 切换模式
const switchMode = (mode: 'login' | 'register') => {
  activeMode.value = mode
  // 清理校验信息
  loginFormRef.value?.resetFields()
  registerFormRef.value?.resetFields()
}

// ---------------- 登录表单相关 ----------------
const loginFormRef = ref<FormInstance>()
const loginForm = reactive({
  username: 'admin',
  password: '123456',
  rememberMe: true,
})

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名或邮箱', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' },
  ],
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    const res = await authStore.login({
      username: loginForm.username.trim(),
      password: loginForm.password,
      rememberMe: loginForm.rememberMe,
    })

    if (res.success) {
      ElMessage.success(res.message)
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } else {
      ElMessage.error(res.message)
    }
  })
}

// 快速填充测试账号
const fillTestAccount = (user: string, pass: string) => {
  activeMode.value = 'login'
  loginForm.username = user
  loginForm.password = pass
  ElMessage.info(`已填充测试账号: ${user}`)
}

// ---------------- 注册表单相关 ----------------
const registerFormRef = ref<FormInstance>()
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false,
})

// 确认密码自定义校验
const validateConfirmPass = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 注册规则
const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为 3 至 20 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '设置密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于 6 位字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPass, trigger: 'blur' },
  ],
  agreeTerms: [
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error('请阅读并勾选服务条款'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
}

// 密码强度评估
const passwordStrength = computed(() => {
  const p = registerForm.password
  if (!p) return 0
  let score = 0
  if (p.length >= 6) score += 1
  if (p.length >= 10) score += 1
  if (/[A-Z]/.test(p) || /[0-9]/.test(p)) score += 1
  if (/[^A-Za-z0-9]/.test(p)) score += 1
  return score
})

const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 1:
      return { label: '弱', color: '#f56c6c' }
    case 2:
      return { label: '中等', color: '#e6a23c' }
    case 3:
    case 4:
      return { label: '强', color: '#67c23a' }
    default:
      return { label: '极弱', color: '#909399' }
  }
})

const handleRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    const res = await authStore.register({
      username: registerForm.username.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password,
    })

    if (res.success) {
      ElMessage.success(res.message)
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } else {
      ElMessage.error(res.message)
    }
  })
}
</script>

<template>
  <div class="auth-container">
    <!-- 动态背景装饰圆球 -->
    <div class="background-decor">
      <div class="glow-sphere sphere-1"></div>
      <div class="glow-sphere sphere-2"></div>
      <div class="glow-sphere sphere-3"></div>
    </div>

    <!-- 登录注册卡片包围盒 -->
    <div class="auth-card-wrapper">
      <div class="brand-header">
        <div class="logo-badge">
          <el-icon :size="28" color="#ffffff"><Platform /></el-icon>
        </div>
        <h1 class="brand-title">Vue 3 个人工作台</h1>
        <p class="brand-subtitle">轻量·高效·极致体验的现代全栈前端平台</p>
      </div>

      <!-- 模式切换控制器 -->
      <div class="mode-tabs">
        <button
          class="tab-btn"
          :class="{ active: activeMode === 'login' }"
          @click="switchMode('login')"
        >
          账号登录
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeMode === 'register' }"
          @click="switchMode('register')"
        >
          免费注册
        </button>
        <div
          class="tab-slider"
          :style="{ transform: activeMode === 'login' ? 'translateX(0)' : 'translateX(100%)' }"
        ></div>
      </div>

      <!-- 表单卡片区域 -->
      <div class="card-content">
        <!-- 登录表单 -->
        <transition name="fade-slide" mode="out-in">
          <div v-if="activeMode === 'login'" key="login" class="form-container">
            <el-form
              ref="loginFormRef"
              :model="loginForm"
              :rules="loginRules"
              size="large"
              label-position="top"
              @keyup.enter="handleLogin"
            >
              <el-form-item label="账号 / 邮箱" prop="username">
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入用户名或注册邮箱"
                  :prefix-icon="User"
                  clearable
                />
              </el-form-item>

              <el-form-item label="登录密码" prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>

              <div class="form-options">
                <el-checkbox v-model="loginForm.rememberMe">记住登录状态</el-checkbox>
                <a href="javascript:void(0)" class="forgot-link" @click="ElMessage.info('请联系管理员重置密码 (admin/123456)')">
                  忘记密码？
                </a>
              </div>

              <el-button
                type="primary"
                class="submit-btn"
                :loading="authStore.loading"
                @click="handleLogin"
              >
                立即登录
                <el-icon class="el-icon--right"><Right /></el-icon>
              </el-button>
            </el-form>

            <!-- 快捷预置账号 -->
            <div class="preset-hints">
              <span class="hint-title">快捷测试账号点击充填：</span>
              <div class="hint-chips">
                <span class="chip" @click="fillTestAccount('admin', '123456')">
                  <el-icon><Select /></el-icon> 管理员 (admin)
                </span>
                <span class="chip" @click="fillTestAccount('vue_user', '123456')">
                  <el-icon><Select /></el-icon> 普通用户 (vue_user)
                </span>
              </div>
            </div>
          </div>

          <!-- 注册表单 -->
          <div v-else key="register" class="form-container">
            <el-form
              ref="registerFormRef"
              :model="registerForm"
              :rules="registerRules"
              size="large"
              label-position="top"
              @keyup.enter="handleRegister"
            >
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="registerForm.username"
                  placeholder="3-20 位字母/数字/下划线"
                  :prefix-icon="User"
                  clearable
                />
              </el-form-item>

              <el-form-item label="电子邮箱" prop="email">
                <el-input
                  v-model="registerForm.email"
                  placeholder="name@example.com"
                  :prefix-icon="Message"
                  clearable
                />
              </el-form-item>

              <el-form-item label="设置密码" prop="password">
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="不少于 6 位"
                  :prefix-icon="Lock"
                  show-password
                />
                <!-- 密码强度指示 -->
                <div v-if="registerForm.password" class="password-strength-bar">
                  <div class="strength-meter">
                    <div
                      class="meter-fill"
                      :style="{
                        width: `${(passwordStrength / 4) * 100}%`,
                        backgroundColor: passwordStrengthText.color,
                      }"
                    ></div>
                  </div>
                  <span class="strength-label" :style="{ color: passwordStrengthText.color }">
                    密码强度：{{ passwordStrengthText.label }}
                  </span>
                </div>
              </el-form-item>

              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  :prefix-icon="Key"
                  show-password
                />
              </el-form-item>

              <el-form-item prop="agreeTerms" class="terms-item">
                <el-checkbox v-model="registerForm.agreeTerms">
                  我已阅读并同意
                  <a href="javascript:void(0)" class="terms-link" @click.stop="ElMessage.info('已阅读服务条款与隐私策略')">
                    《服务条款与隐私政策》
                  </a>
                </el-checkbox>
              </el-form-item>

              <el-button
                type="success"
                class="submit-btn register-btn"
                :loading="authStore.loading"
                @click="handleRegister"
              >
                完成注册并登录
                <el-icon class="el-icon--right"><Right /></el-icon>
              </el-button>
            </el-form>
          </div>
        </transition>
      </div>

      <div class="auth-footer">
        <span>© 2026 Vue 3 Personal Workspace. Built with Modern Vite & Element Plus.</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 整个页面背景与布局 */
.auth-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0f172a;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #f8fafc;
  padding: 24px;
}

/* 酷炫动态光晕背景 */
.background-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.glow-sphere {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.45;
  animation: float 14s infinite ease-in-out alternate;
}

.sphere-1 {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, #6366f1 0%, #4f46e5 100%);
  top: -100px;
  left: -100px;
}

.sphere-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #06b6d4 0%, #3b82f6 100%);
  bottom: -100px;
  right: -80px;
  animation-delay: -5s;
}

.sphere-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #ec4899 0%, #8b5cf6 100%);
  top: 40%;
  left: 60%;
  animation-delay: -9s;
}

@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(40px, 30px) scale(1.08);
  }
  100% {
    transform: translate(-30px, 50px) scale(0.95);
  }
}

/* 主卡片布局 */
.auth-card-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 460px;
  background: rgba(30, 41, 59, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  padding: 36px 32px 28px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
              0 0 0 1px rgba(255, 255, 255, 0.05);
}

/* 品牌 Header */
.brand-header {
  text-align: center;
  margin-bottom: 28px;
}

.logo-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.35);
  margin-bottom: 14px;
}

.brand-title {
  font-size: 1.65rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 6px;
  letter-spacing: -0.5px;
}

.brand-subtitle {
  font-size: 0.88rem;
  color: #94a3b8;
  margin: 0;
}

/* 模式 Tab 切换器 */
.mode-tabs {
  position: relative;
  display: flex;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 14px;
  padding: 4px;
  margin-bottom: 28px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.tab-btn {
  flex: 1;
  position: relative;
  z-index: 2;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 10px 0;
  cursor: pointer;
  transition: color 0.3s ease;
}

.tab-btn.active {
  color: #ffffff;
}

.tab-slider {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc(50% - 4px);
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  border-radius: 10px;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

/* 表单容器 */
.form-container {
  width: 100%;
}

:deep(.el-form-item__label) {
  color: #cbd5e1 !important;
  font-weight: 500;
  font-size: 0.88rem;
  margin-bottom: 4px !important;
}

:deep(.el-input__wrapper) {
  background-color: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow: none !important;
  border-radius: 12px !important;
  padding: 4px 14px !important;
  transition: all 0.25s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(99, 102, 241, 0.5) !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25) !important;
}

:deep(.el-input__inner) {
  color: #f8fafc !important;
}

:deep(.el-input__prefix-icon) {
  color: #818cf8;
}

/* 选项区域 (记住密码 / 忘记密码) */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
}

:deep(.el-checkbox__label) {
  color: #94a3b8 !important;
  font-size: 0.88rem;
}

.forgot-link,
.terms-link {
  color: #818cf8;
  font-size: 0.88rem;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover,
.terms-link:hover {
  color: #a5b4fc;
  text-decoration: underline;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 46px;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 600;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  border: none;
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.register-btn {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.5);
}

.register-btn:hover {
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5);
}

/* 快捷密码测试提示 */
.preset-hints {
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
}

.hint-title {
  display: block;
  font-size: 0.82rem;
  color: #64748b;
  margin-bottom: 8px;
}

.hint-chips {
  display: flex;
  gap: 10px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: #6366f1;
  color: #ffffff;
}

/* 密码强度计 */
.password-strength-bar {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.strength-meter {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-label {
  font-size: 0.78rem;
}

/* 页脚信息 */
.auth-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 0.78rem;
  color: #64748b;
}

/* 过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
