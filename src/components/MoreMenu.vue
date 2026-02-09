<template>
  <div>
    <!-- 更多按钮 -->
    <button 
      class="more-btn"
      @click="isOpen = !isOpen"
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
            v-for="item in moreItems"
            :key="item.path"
            :to="item.path"
            class="menu-item"
            @click="close"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <div class="menu-info">
              <span class="menu-name">{{ item.name }}</span>
              <span class="menu-desc">{{ item.desc }}</span>
            </div>
            <span class="menu-arrow">→</span>
          </router-link>
        </div>
        
        <!-- 用户信息 -->
        <div class="user-section">
          <div class="user-avatar">📚</div>
          <div class="user-info">
            <span class="user-name">考研伴侣</span>
            <span class="user-status">陪你一起上岸</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

// 使用外部控制的 isOpen，监听 prop 变化
const isOpen = ref(props.isOpen)

watch(() => props.isOpen, (newVal) => {
  isOpen.value = newVal
})

const moreItems = [
  { name: '日历', path: '/calendar', icon: '📆', desc: '学习日程安排' },
  { name: 'AI学习计划', path: '/plan', icon: '🧠', desc: '智能生成学习计划' },
  { name: '专注计时', path: '/focus', icon: '⏱️', desc: '番茄钟专注模式' },
  { name: '学习心得', path: '/journal', icon: '📔', desc: '记录每日感悟' },
  { name: '成就徽章', path: '/achievements', icon: '🏆', desc: '解锁你的成就' },
  { name: '积分中心', path: '/points', icon: '💎', desc: '查看积分明细' },
  { name: '数据统计', path: '/stats', icon: '📊', desc: '学习数据分析' },
  { name: '设置', path: '/settings', icon: '⚙️', desc: '个性化设置' }
]

const close = () => {
  isOpen.value = false
  emit('close')
}
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
  transition: all 0.3s;
}

.more-btn:hover {
  background: rgba(255, 255, 255, 0.8);
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
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
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
  transition: all 0.3s;
  margin-bottom: 8px;
}

.menu-item:hover {
  background: rgba(249, 115, 22, 0.1);
}

.menu-icon {
  font-size: 28px;
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
}

.menu-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.menu-arrow {
  color: var(--text-muted);
  font-size: 16px;
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
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #f472b6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
}

.user-status {
  font-size: 12px;
  color: var(--text-muted);
}

/* 动画 */
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

@media (max-width: 768px) {
  .drawer-menu {
    width: 85vw;
  }
}

/* ===== 深色模式适配 ===== */
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

.dark .more-btn {
  background: rgba(255, 255, 255, 0.15);
}

.dark .more-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.dark .user-section {
  background: rgba(249, 115, 22, 0.1);
}

.dark .drawer-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.dark .user-section {
  border-top-color: rgba(255, 255, 255, 0.1);
}
</style>
