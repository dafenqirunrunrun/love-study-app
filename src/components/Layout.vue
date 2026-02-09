<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- 🎨 动态渐变背景 -->
    <div class="absolute inset-0 -z-10 animate-gradient-shift" 
         style="background: linear-gradient(-45deg, #ffecd2, #fcb69f, #ffecd2, #feada6, #f5efef, #a7bed3);">
    </div>
    
    <!-- ✨ 彩色光晕效果 -->
    <div class="absolute inset-0 -z-5 overflow-hidden">
      <div class="absolute top-20 left-20 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float"></div>
      <div class="absolute top-40 right-32 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float-delay"></div>
      <div class="absolute -bottom-20 left-1/3 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float"></div>
      <div class="absolute bottom-40 right-20 w-64 h-64 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delay"></div>
      <div class="absolute top-1/2 left-1/4 w-80 h-80 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-35 animate-pulse-soft"></div>
    </div>

    <!-- Toast 通知组件 -->
    <ToastNotification ref="toastRef" />

    <div class="relative z-10">
      <!-- 🎯 顶部品牌栏 -->
      <nav class="glass-card m-4 p-4 flex items-center justify-between animate-fade-in-down">
        <router-link to="/" class="flex items-center gap-3 group">
          <span class="text-3xl filter-drop-shadow-orange animate-bounce-soft">📚</span>
          <span class="text-2xl font-bold text-rainbow group-hover:text-glow transition-all duration-300">
            考研伴侣
          </span>
        </router-link>
        
        <!-- 🌙 夜间模式切换 -->
        <button
          @click="toggleDarkMode"
          class="group relative overflow-hidden jelly-button px-4 py-2 flex items-center gap-2"
        >
          <span class="text-lg transform group-hover:scale-125 transition-transform">{{ isDarkMode ? '☀️' : '🌙' }}</span>
          <span class="font-medium">{{ isDarkMode ? '日间' : '夜间' }}</span>
        </button>
      </nav>

      <!-- 💰 积分显示 - 可点击跳转 -->
      <div class="flex justify-end mx-4 mb-4 animate-fade-in-up" style="animation-delay: 0.1s;">
        <router-link 
          to="/points" 
          class="glass-card border-rainbow px-6 py-3 flex items-center gap-3 hover-lift cursor-pointer transition-transform hover:scale-105"
        >
          <div class="icon-bg bg-gradient-to-br from-orange-400 to-pink-500">
            <span class="text-xl">💰</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs text-gray-500 font-medium">我的积分</span>
            <span class="text-xl font-bold text-orange-600 text-rainbow">{{ lovePoints }}</span>
          </div>
          <div class="absolute -top-2 -right-2 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
            <span class="text-white text-xs">+</span>
          </div>
        </router-link>
      </div>

      <!-- 📄 页面内容区域 -->
      <main class="mx-4 pb-32 animate-fade-in-up" style="animation-delay: 0.2s;">
        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>

      <!-- 🎮 底部固定导航栏 - 简化版5Tab -->
      <div class="fixed bottom-0 left-0 right-0 glass-card-intense border-t border-white/30 p-2 md:hidden z-50 animate-slide-in-up">
        <div class="flex justify-around items-center">
          <template v-for="item in navItems" :key="item.path">
            <router-link
              v-if="!item.isMore"
              :to="item.path"
              class="relative flex flex-col items-center p-2 rounded-xl transition-all duration-300 min-w-[60px]"
              :class="isActive(item.path) 
                ? 'text-orange-500' 
                : 'text-gray-500 hover:text-orange-400'"
            >
              <span class="text-2xl mb-1 transition-transform duration-300" 
                    :class="{ 'animate-bounce-soft scale-125': isActive(item.path) }">{{ item.icon }}</span>
              <span class="text-[10px] font-medium truncate max-w-[60px]">{{ item.name }}</span>
              <!-- 激活指示器 -->
              <div 
                v-if="isActive(item.path)"
                class="absolute -top-1 w-8 h-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full shadow-lg"
              ></div>
            </router-link>
            
            <!-- 更多按钮 -->
            <button
              v-else
              @click="moreMenuOpen = true"
              class="relative flex flex-col items-center p-2 rounded-xl transition-all duration-300 min-w-[60px]"
              :class="isActive('/more') || isActive('/calendar') || isActive('/stats') || isActive('/plan') || isActive('/points') || isActive('/achievements') || isActive('/journal') || isActive('/settings')
                ? 'text-orange-500' 
                : 'text-gray-500 hover:text-orange-400'"
            >
              <span class="text-2xl mb-1 transition-transform duration-300" 
                    :class="{ 'animate-bounce-soft scale-125': isActive('/more') }">{{ item.icon }}</span>
              <span class="text-[10px] font-medium truncate max-w-[60px]">{{ item.name }}</span>
              <!-- 激活指示器 -->
              <div 
                v-if="isActive('/more') || isActive('/calendar') || isActive('/stats') || isActive('/plan') || isActive('/points') || isActive('/achievements') || isActive('/journal') || isActive('/settings')"
                class="absolute -top-1 w-8 h-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full shadow-lg"
              ></div>
            </button>
          </template>
        </div>
      </div>

      <!-- 更多菜单抽屉 -->
      <MoreMenu :is-open="moreMenuOpen" @close="moreMenuOpen = false" />

      <!-- 🎮 桌面端底部导航栏 - 简化版5Tab -->
      <div class="hidden md:flex fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up" style="animation-delay: 0.3s;">
        <nav class="glass-card px-2 py-2 flex items-center gap-1 shadow-2xl">
          <template v-for="(item, index) in navItems" :key="item.path">
            <router-link
              v-if="!item.isMore"
              :to="item.path"
              class="relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300"
              :class="isActive(item.path) 
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30' 
                : 'text-gray-600 hover:bg-white/30'"
              :style="{ animationDelay: `${index * 0.05}s` }"
            >
              <span class="text-lg" :class="{ 'animate-bounce-soft': isActive(item.path) }">{{ item.icon }}</span>
              <span class="font-medium text-sm">{{ item.name }}</span>
              <!-- 选中状态指示器 -->
              <div v-if="isActive(item.path)" class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
            </router-link>
            
            <!-- 更多按钮 -->
            <button
              v-else
              @click="moreMenuOpen = true"
              class="relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300"
              :class="isActive('/more') || isActive('/calendar') || isActive('/stats') || isActive('/plan') || isActive('/points') || isActive('/achievements') || isActive('/journal') || isActive('/settings')
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30' 
                : 'text-gray-600 hover:bg-white/30'"
              :style="{ animationDelay: `${index * 0.05}s` }"
            >
              <span class="text-lg" :class="{ 'animate-bounce-soft': isActive('/more') }">{{ item.icon }}</span>
              <span class="font-medium text-sm">{{ item.name }}</span>
              <!-- 选中状态指示器 -->
              <div 
                v-if="isActive('/more') || isActive('/calendar') || isActive('/stats') || isActive('/plan') || isActive('/points') || isActive('/achievements') || isActive('/journal') || isActive('/settings')"
                class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
              ></div>
            </button>
          </template>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ToastNotification from './ToastNotification.vue'
import MoreMenu from './MoreMenu.vue'

const route = useRoute()
const router = useRouter()
const isDarkMode = ref(false)
const lovePoints = ref(0)
const toastRef = ref(null)
const moreMenuOpen = ref(false)

// 5个核心Tab
const navItems = [
  { name: '首页', path: '/', icon: '🏠' },
  { name: '任务', path: '/tasks', icon: '📝' },
  { name: '专注', path: '/focus', icon: '⏱️' },
  { name: '打卡', path: '/checkin', icon: '✅' },
  { name: '更多', path: '/more', icon: '⋯', isMore: true }
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

// 全局Toast事件监听
const handleToastEvent = (event) => {
  const { message, type, title } = event.detail
  if (toastRef.value) {
    toastRef.value.addToast({ message, title, type })
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
    
    // 监听Toast事件
    window.addEventListener('showToast', handleToastEvent)
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
