<template>
  <div>
    <!-- 更多按钮 -->
    <button
      class="more-btn"
      @click="toggleDrawer"
    >
      <span class="more-icon">⋮</span>
    </button>

    <!-- 抽屉遮罩 -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="drawer-overlay"
        @click="close"
      ></div>
    </Transition>

    <!-- 抽屉菜单 -->
    <Transition name="slide">
      <div v-if="isOpen" class="drawer-menu glass-card">
        <div class="drawer-header">
          <h3>更多功能</h3>
          <button class="close-btn" @click="close">×</button>
        </div>

        <div class="drawer-content">
          <router-link
            v-for="(item, index) in moreItems"
            :key="item.path"
            :to="item.path"
            class="menu-item"
            :class="{ active: isActive(item.path) }"
            :style="{ '--item-index': index }"
            @click="close"
          >
            <span class="menu-icon-wrapper">
              <span class="menu-icon">{{ item.icon }}</span>
              <span class="menu-icon-glow"></span>
            </span>
            <div class="menu-info">
              <span class="menu-name">{{ item.name }}</span>
              <span class="menu-desc">{{ item.desc }}</span>
            </div>
            <span class="menu-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
          </router-link>
        </div>

        <!-- 用户信息 -->
        <div class="user-section">
          <div class="user-avatar">
            <span>📚</span>
            <span class="avatar-ring"></span>
          </div>
          <div class="user-info">
            <span class="user-name">学习伴侣</span>
            <span class="user-status">陪你一起上岸</span>
          </div>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ userStats.level }}</span>
              <span class="stat-label">等级</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userStats.points }}</span>
              <span class="stat-label">积分</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

interface MenuItem {
  name: string
  path: string
  icon: string
  desc: string
}

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

// 使用外部控制的 isOpen，监听 prop 变化
const isOpen = ref(props.isOpen)
const route = useRoute()

// 用户统计数据 - 从 localStorage 读取真实数据
const userStats = ref({
  level: 1,
  points: 0
})

// 根据积分计算等级
const calculateLevel = (points) => {
  const totalExp = points / 10
  return Math.floor(Math.sqrt(totalExp / 10)) + 1
}

// 加载用户统计数据
const loadUserStats = () => {
  try {
    const savedPoints = localStorage.getItem('lovePoints')
    if (savedPoints) {
      const points = parseInt(savedPoints)
      userStats.value.points = points
      userStats.value.level = calculateLevel(points)
    }
  } catch (error) {
    console.error('Error loading user stats:', error)
  }
}

// 数据初始化事件处理
const handleDataInitialized = () => {
  loadUserStats()
}

watch(() => props.isOpen, (newVal) => {
  isOpen.value = newVal
  // 触发触感反馈
  if (newVal && navigator.vibrate) {
    navigator.vibrate(10)
  }
})

const moreItems: MenuItem[] = [
  { name: '日历', path: '/calendar', icon: '📆', desc: '学习日程安排' },
  { name: 'AI学习计划', path: '/plan', icon: '🧠', desc: '智能生成学习计划' },
  { name: '专注计时', path: '/focus', icon: '⏱️', desc: '番茄钟专注模式' },
  { name: '学习心得', path: '/journal', icon: '📔', desc: '记录每日感悟' },
  { name: '成就徽章', path: '/achievements', icon: '🏆', desc: '解锁你的成就' },
  { name: '积分中心', path: '/points', icon: '💎', desc: '查看积分明细' },
  { name: '数据统计', path: '/stats', icon: '📊', desc: '学习数据分析' },
  { name: '设置', path: '/settings', icon: '⚙️', desc: '个性化设置' }
]

// Check if route is active
const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

// Toggle drawer
const toggleDrawer = () => {
  if (navigator.vibrate) {
    navigator.vibrate(5)
  }
  isOpen.value = !isOpen.value
  if (!isOpen.value) {
    emit('close')
  }
}

// Close drawer
const close = () => {
  isOpen.value = false
  emit('close')
}

// 页面加载时读取用户数据
onMounted(() => {
  loadUserStats()
  // 监听数据初始化事件
  window.addEventListener('dataInitialized', handleDataInitialized)
})

// 清理事件监听
onUnmounted(() => {
  window.removeEventListener('dataInitialized', handleDataInitialized)
})
</script>

<style scoped>
.more-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
}

.more-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.1);
}

.more-btn:active {
  transform: scale(0.95);
}

.more-icon {
  font-size: 20px;
  color: var(--text-muted);
  font-weight: bold;
}

.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 60;
  backdrop-filter: blur(4px);
}

.drawer-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  max-width: 85vw;
  height: 100vh;
  z-index: 70;
  border-radius: 24px 0 0 24px;
  display: flex;
  flex-direction: column;
  animation: drawerSlideIn 0.3s ease;
}

@keyframes drawerSlideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.drawer-header h3 {
  font-size: 18px;
  font-weight: bold;
  background: linear-gradient(135deg, #f97316, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  font-size: 24px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  transform: rotate(90deg);
}

.drawer-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 8px;
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.1) 0%, transparent 100%);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.menu-item:hover::before {
  transform: translateX(0);
}

.menu-item:hover {
  transform: translateX(4px);
}

.menu-item.active {
  background: rgba(249, 115, 22, 0.1);
}

.menu-item.active::before {
  transform: translateX(0);
}

.menu-item.active .menu-icon-wrapper {
  transform: scale(1.1);
}

.menu-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.menu-icon {
  font-size: 24px;
  position: relative;
  z-index: 1;
}

.menu-icon-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(244, 114, 182, 0.2));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.menu-item:hover .menu-icon-glow,
.menu-item.active .menu-icon-glow {
  opacity: 1;
}

.menu-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.menu-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 15px;
  position: relative;
  z-index: 1;
}

.menu-desc {
  font-size: 12px;
  color: var(--text-muted);
  position: relative;
  z-index: 1;
}

.menu-arrow {
  color: var(--text-muted);
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.menu-arrow svg {
  width: 18px;
  height: 18px;
}

.menu-item:hover .menu-arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(249, 115, 22, 0.05);
}

.user-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #f472b6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.avatar-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid transparent;
  background: linear-gradient(135deg, #f97316, #f472b6) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: avatarRingPulse 2s ease-in-out infinite;
}

@keyframes avatarRingPulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
}

.user-status {
  font-size: 12px;
  color: var(--text-muted);
}

.user-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.stat-value {
  font-weight: 700;
  font-size: 16px;
  color: var(--color-primary);
}

.stat-label {
  font-size: 10px;
  color: var(--text-muted);
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* Menu item stagger animation */
.menu-item {
  animation: menuItemSlideIn 0.4s ease backwards;
  animation-delay: calc(var(--item-index) * 0.05s);
}

@keyframes menuItemSlideIn {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .drawer-menu {
    width: 85vw;
  }
}

/* Dark mode适配 */
.dark .close-btn {
  background: rgba(255, 255, 255, 0.15);
  color: #94a3b8;
}

.dark .close-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.dark .menu-item:hover {
  background: rgba(249, 115, 22, 0.15);
}

.dark .menu-item.active {
  background: rgba(249, 115, 22, 0.15);
}

.dark .more-btn {
  background: rgba(255, 255, 255, 0.15);
}

.dark .more-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.dark .user-section {
  background: rgba(249, 115, 22, 0.1);
}

.dark .menu-icon-wrapper {
  background: rgba(255, 255, 255, 0.1);
}

.dark .stat-item {
  background: rgba(255, 255, 255, 0.1);
}

.dark .drawer-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.dark .user-section {
  border-top-color: rgba(255, 255, 255, 0.1);
}
</style>
