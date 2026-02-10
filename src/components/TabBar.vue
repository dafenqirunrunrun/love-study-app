<template>
  <div class="tab-bar-wrapper">
    <!-- Search Trigger Button -->
    <button 
      class="search-trigger"
      @click="openSearch"
      :class="{ 'has-badge': hasUnfinishedTasks }"
    >
      <span class="search-icon">🔍</span>
      <span v-if="hasUnfinishedTasks" class="search-badge"></span>
    </button>
    
    <div class="tab-bar" :class="{ 'is-desktop': isDesktop }">
      <router-link
        v-for="item in items"
        :key="item.path"
        :to="item.path"
        class="tab-item"
        :class="{
          active: isActive(item.path),
          'has-badge': item.badge
        }"
        @click="handleTabClick(item.path)"
      >
        <!-- Icon container with press animation -->
        <span class="tab-icon-wrapper">
          <span class="tab-icon" :class="{ 'animate-bounce-soft': isActive(item.path) }">
            {{ item.icon }}
          </span>
          <!-- Glow effect for active tab -->
          <span v-if="isActive(item.path)" class="tab-glow"></span>
        </span>

        <span class="tab-label">{{ item.name }}</span>

        <!-- Active indicator with animation -->
        <Transition name="indicator">
          <div v-if="isActive(item.path)" class="active-indicator"></div>
        </Transition>

        <!-- Badge with pulse animation -->
        <Transition name="badge">
          <span v-if="item.badge" class="tab-badge" :class="{ 'badge-new': item.isNew }">
            {{ typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge }}
          </span>
        </Transition>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const emit = defineEmits(['open-search'])

interface TabItem {
  name: string
  path: string
  icon: string
  badge?: number | string
  isNew?: boolean
}

const props = defineProps<{
  items: TabItem[]
}>()

const emit = defineEmits<{
  tabChange: [path: string]
}>()

const route = useRoute()
const isDesktop = ref(window.innerWidth >= 768)
const prevPath = ref(route.path)

// Check for unfinished tasks
const hasUnfinishedTasks = computed(() => {
  try {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    return tasks.some((t: any) => !t.completed)
  } catch {
    return false
  }
})

// Handle responsive breakpoint
const handleResize = () => {
  isDesktop.value = window.innerWidth >= 768
}

// Open search modal
const openSearch = () => {
  emit('open-search')
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Check if tab is active
const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

// Handle tab click with haptic feedback
const handleTabClick = (path: string) => {
  // Trigger haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(8)
  }

  // Emit tab change event
  if (path !== prevPath.value) {
    emit('tabChange', path)
    prevPath.value = path
  }
}
</script>

<style scoped>
/* Tab Bar Wrapper */
.tab-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Search Trigger Button */
.search-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-trigger:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
}

.search-trigger:active {
  transform: scale(0.95);
}

.search-icon {
  font-size: 20px;
  transition: transform 0.2s ease;
}

.search-trigger:hover .search-icon {
  transform: rotate(15deg);
}

/* Search badge */
.search-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 50%;
  animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0);
  }
}

.tab-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 4px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* Desktop styles */
.tab-bar-wrapper.is-desktop {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.tab-bar-wrapper.is-desktop .search-trigger {
  width: 40px;
  height: 40px;
}

.tab-bar.is-desktop {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  border-radius: 16px;
  padding: 8px 16px;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.tab-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  border-radius: 16px;
  text-decoration: none;
  color: var(--text-muted, #6b7280);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 60px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.tab-item:hover {
  background: rgba(249, 115, 22, 0.08);
  color: var(--color-primary, #f97316);
  transform: translateY(-2px);
}

.tab-item.active {
  color: var(--color-primary, #f97316);
}

/* Icon wrapper with glow effect */
.tab-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.tab-icon {
  font-size: 24px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tab-item:hover .tab-icon {
  transform: scale(1.1);
}

.tab-item:active .tab-icon {
  transform: scale(0.9);
}

/* Glow effect for active tab */
.tab-glow {
  position: absolute;
  width: 40px;
  height: 40px;
  background: radial-gradient(
    circle,
    rgba(249, 115, 22, 0.2) 0%,
    rgba(249, 115, 22, 0) 70%
  );
  border-radius: 50%;
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.tab-label {
  font-size: 11px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* Active indicator */
.active-indicator {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary, #f97316), var(--color-pink, #f472b6));
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.5);
}

/* Indicator transition */
.indicator-enter-active,
.indicator-leave-active {
  transition: all 0.3s ease;
}

.indicator-enter-from,
.indicator-leave-to {
  width: 0;
  opacity: 0;
}

/* Badge styles */
.tab-badge {
  position: absolute;
  top: 2px;
  right: 6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 9px;
  font-size: 10px;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  animation: badgeSlideIn 0.3s ease-out;
}

.tab-badge.badge-new {
  animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgeSlideIn {
  from {
    transform: scale(0) translateY(-10px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes badgePulse {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  }
  50% {
    box-shadow: 0 2px 12px rgba(239, 68, 68, 0.7);
  }
}

/* Badge transition */
.badge-enter-active,
.badge-leave-active {
  transition: all 0.3s ease;
}

.badge-enter-from,
.badge-leave-to {
  transform: scale(0) translateY(-10px);
  opacity: 0;
}

/* Touch feedback for mobile */
@media (hover: none) and (pointer: coarse) {
  .tab-item:active {
    transform: scale(0.95);
  }

  .tab-item:active .tab-icon {
    transform: scale(0.9);
  }
}

/* Responsive styles */
@media (max-width: 768px) {
  .tab-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    border-radius: 20px 20px 0 0;
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  }

  .tab-item {
    padding: 6px 12px;
    min-width: 50px;
  }

  .tab-icon {
    font-size: 22px;
  }

  .tab-label {
    font-size: 10px;
  }

  .tab-glow {
    width: 36px;
    height: 36px;
  }
}

/* Dark mode */
.dark .search-trigger {
  background: rgba(30, 30, 50, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dark .search-trigger:hover {
  background: rgba(50, 50, 70, 0.9);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.dark .tab-bar {
  background: rgba(30, 30, 50, 0.95);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
}

.dark .tab-bar.is-desktop {
  background: rgba(30, 30, 50, 0.95);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.dark .tab-item {
  color: var(--text-muted, #94a3b8);
}

.dark .tab-item:hover {
  background: rgba(249, 115, 22, 0.12);
}

.dark .tab-item.active {
  color: var(--color-primary, #fb923c);
}

.dark .tab-glow {
  background: radial-gradient(
    circle,
    rgba(251, 146, 60, 0.3) 0%,
    rgba(251, 146, 60, 0) 70%
  );
}
</style>
