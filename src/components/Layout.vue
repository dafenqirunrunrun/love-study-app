<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- 简化背景 - 无动画 -->
    <div class="absolute inset-0 -z-10 bg-gradient-to-br from-rose-100 via-orange-100 to-sky-100"></div>
    
    <!-- 移除粒子效果 - 提升性能 -->
    <div ref="particlesContainer" class="absolute inset-0 -z-5"></div>

    <div class="relative z-10">
      <!-- 顶部导航栏 -->
      <nav class="glass-card m-4 p-4 flex flex-wrap items-center justify-between">
        <div class="flex items-center gap-4">
          <router-link to="/" class="text-2xl font-bold text-orange-600">
            📚 考研伴侣
          </router-link>
        </div>
        
        <!-- 夜间模式切换 -->
        <button
          @click="toggleDarkMode"
          class="glass-card px-4 py-2 flex items-center gap-2 cursor-pointer"
        >
          <span class="text-xl">{{ isDarkMode ? '☀️' : '🌙' }}</span>
          <span class="text-gray-700 font-medium">{{ isDarkMode ? '日间' : '夜间' }}</span>
        </button>
      </nav>

      <!-- 积分显示 -->
      <div class="flex justify-end mx-4 mb-4">
        <div class="glass-card px-6 py-3 flex items-center gap-3">
          <span class="text-2xl">💰</span>
          <span class="text-orange-600 font-bold text-lg">恋爱积分: {{ lovePoints }}</span>
        </div>
      </div>

      <!-- 主导航菜单 -->
      <nav class="glass-card mx-4 mb-4 p-4">
        <div class="flex flex-wrap gap-2 justify-center">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-2 px-4 py-3 rounded-xl transition-all"
            :class="isActive(item.path) 
              ? 'bg-orange-500 text-white' 
              : 'hover:bg-white/30 text-gray-700'"
          >
            <span class="text-xl">{{ item.icon }}</span>
            <span class="font-medium">{{ item.name }}</span>
          </router-link>
        </div>
      </nav>

      <!-- 页面内容 -->
      <main class="mx-4 pb-24">
        <router-view @updatePoints="updatePoints" />
      </main>

      <!-- 底部快捷导航（移动端） -->
      <div class="fixed bottom-0 left-0 right-0 glass-card p-2 md:hidden flex justify-around z-50">
        <router-link
          v-for="item in navItems.slice(0, 5)"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center p-2"
          :class="isActive(item.path) ? 'text-orange-500' : 'text-gray-500'"
        >
          <span class="text-xl">{{ item.icon }}</span>
          <span class="text-xs">{{ item.name }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isDarkMode = ref(false)
const lovePoints = ref(0)

const navItems = [
  { name: '首页', path: '/', icon: '🏠' },
  { name: '任务', path: '/tasks', icon: '📝' },
  { name: '专注', path: '/focus', icon: '⏱️' },
  { name: '打卡', path: '/checkin', icon: '📅' },
  { name: '统计', path: '/stats', icon: '📊' },
  { name: '奖励', path: '/rewards', icon: '🎁' },
  { name: '心得', path: '/journal', icon: '📔' },
  { name: '成就', path: '/achievements', icon: '🏆' }
]

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  localStorage.setItem('darkMode', isDarkMode.value.toString())
}

const updatePoints = () => {
  try {
    const savedPoints = localStorage.getItem('lovePoints')
    if (savedPoints) lovePoints.value = parseInt(savedPoints)
  } catch (error) {
    console.error('Error loading points:', error)
  }
}

const init = () => {
  try {
    const savedPoints = localStorage.getItem('lovePoints')
    if (savedPoints) lovePoints.value = parseInt(savedPoints)
    
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode === 'true') {
      isDarkMode.value = true
      document.documentElement.classList.add('dark')
    }
  } catch (error) {
    console.error('Error initializing:', error)
  }
}

provide('updatePoints', updatePoints)
provide('getPoints', () => lovePoints.value)
provide('addPoints', (points) => {
  lovePoints.value += points
  localStorage.setItem('lovePoints', lovePoints.value.toString())
})
provide('usePoints', (points) => {
  if (lovePoints.value >= points) {
    lovePoints.value -= points
    localStorage.setItem('lovePoints', lovePoints.value.toString())
    return true
  }
  return false
})

onMounted(init)
</script>
