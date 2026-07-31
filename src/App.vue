<script setup lang="ts">
import { useRoute } from 'vue-router'
import UserHeader from './components/UserHeader.vue'

const route = useRoute()
</script>

<template>
  <div class="app-layout">
    <UserHeader v-if="route.name !== 'login'" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
/* 全局基础重置 */
html, body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>
