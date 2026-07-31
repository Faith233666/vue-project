<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  SwitchButton,
  DataAnalysis,
  CircleCheck,
  Platform,
} from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const profileDialogVisible = ref(false)

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '退出',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      authStore.logout()
      ElMessage.success('已安全退出登录')
      router.push('/login')
    })
    .catch(() => {})
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <header class="navbar-container">
    <div class="navbar-left" @click="navigateTo('/')">
      <div class="app-logo">
        <el-icon :size="20" color="#ffffff"><Platform /></el-icon>
      </div>
      <span class="app-name">Vue 3 Workspace</span>
    </div>

    <!-- 导航菜单 -->
    <nav class="navbar-center">
      <button
        class="nav-item"
        :class="{ active: route.path === '/' }"
        @click="navigateTo('/')"
      >
        <el-icon><DataAnalysis /></el-icon>
        <span>股票行情</span>
      </button>
      <button
        class="nav-item"
        :class="{ active: route.path === '/sqliteTest' }"
        @click="navigateTo('/sqliteTest')"
      >
        <el-icon><CircleCheck /></el-icon>
        <span>用户数据库测试</span>
      </button>
    </nav>

    <!-- 右侧用户信息 -->
    <div class="navbar-right">
      <div v-if="authStore.isLoggedIn" class="user-profile-menu">
        <el-dropdown trigger="click">
          <div class="avatar-trigger">
            <img
              :src="authStore.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'"
              alt="avatar"
              class="user-avatar"
            />
            <span class="user-name">{{ authStore.user?.username }}</span>
            <el-tag size="small" type="success" effect="dark" class="role-tag">
              {{ authStore.user?.role || '用户' }}
            </el-tag>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="custom-dropdown">
              <el-dropdown-item @click="profileDialogVisible = true">
                <el-icon><User /></el-icon> 个人资料
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <el-icon><SwitchButton /></el-icon> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div v-else class="auth-btn-group">
        <el-button type="primary" size="default" @click="navigateTo('/login')">
          去登录 / 注册
        </el-button>
      </div>
    </div>

    <!-- 个人资料弹窗 -->
    <el-dialog
      v-model="profileDialogVisible"
      title="个人资料详情"
      width="420px"
      align-center
      class="profile-dialog"
    >
      <div v-if="authStore.user" class="profile-card">
        <div class="profile-avatar-wrapper">
          <img :src="authStore.user.avatar" alt="avatar" class="large-avatar" />
        </div>
        <div class="profile-details">
          <div class="detail-row">
            <span class="label">用户名：</span>
            <span class="value">{{ authStore.user.username }}</span>
          </div>
          <div class="detail-row">
            <span class="label">电子邮箱：</span>
            <span class="value">{{ authStore.user.email }}</span>
          </div>
          <div class="detail-row">
            <span class="label">账户角色：</span>
            <el-tag size="small" type="primary">{{ authStore.user.role }}</el-tag>
          </div>
          <div class="detail-row">
            <span class="label">注册时间：</span>
            <span class="value">{{ authStore.user.createdAt }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="profileDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </header>
</template>

<style scoped>
.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 24px;
  background: #1e293b;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: #f8fafc;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.app-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.app-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
}

.navbar-center {
  display: flex;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.06);
}

.nav-item.active {
  color: #ffffff;
  background: #4f46e5;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.avatar-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: background 0.2s;
}

.avatar-trigger:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background: #334155;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #f1f5f9;
}

.role-tag {
  border-radius: 12px;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 12px 0;
}

.large-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.profile-details {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 0.9rem;
}

.detail-row .label {
  color: #64748b;
}

.detail-row .value {
  font-weight: 600;
  color: #1e293b;
}
</style>
