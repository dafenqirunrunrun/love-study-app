<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="handleClose"
      >
        <!-- 遮罩层 -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        
        <!-- 弹窗内容 -->
        <div class="celebration-modal relative glass-card max-w-md w-full text-center animate-scale-in">
          <!-- 背景光效 -->
          <div class="celebration-glow"></div>
          
          <!-- 关闭按钮 -->
          <button 
            @click="handleClose"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-20"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          
          <!-- 成就图标 -->
          <div class="milestone-icon mb-4">
            <div class="icon-ring">
              <span class="icon-emoji">{{ milestone.icon }}</span>
            </div>
          </div>
          
          <!-- 标题 -->
          <h2 class="text-2xl font-bold text-rainbow mb-2">
            🎉 里程碑达成!
          </h2>
          
          <!-- 成就名称 -->
          <h3 class="text-xl font-bold text-orange-600 dark:text-orange-400 mb-4">
            {{ milestone.name }}
          </h3>
          
          <!-- 描述 -->
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            {{ getMilestoneDescription(milestone.id) }}
          </p>
          
          <!-- 进度提示 -->
          <div class="progress-hint">
            <span class="text-4xl">🚀</span>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
              继续努力，达成下一个里程碑!
            </p>
          </div>
          
          <!-- 确认按钮 -->
          <button 
            @click="handleClose"
            class="jelly-button bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg mt-6"
          >
            太棒了!
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface Milestone {
  id: string
  name: string
  icon: string
  condition: (count: number) => boolean
}

interface Props {
  isOpen: boolean
  milestone: Milestone | null
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  milestone: null
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const handleClose = () => {
  emit('close')
}

// 里程碑描述
const getMilestoneDescription = (id: string) => {
  const descriptions: Record<string, string> = {
    'first_task': '你完成了第一个任务!学习的旅程正式开始!',
    'task_10': '你已经完成了10个任务!继续保持这个节奏!',
    'task_50': '50个任务!你的努力正在积累,太棒了!',
    'task_100': '100个任务达成!你已经是一名学习达人了!',
    'task_500': '500个任务!这是非凡的成就!'
  }
  return descriptions[id] || '恭喜你达成新里程碑!'
}

// ESC键关闭
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.celebration-modal {
  @apply relative overflow-hidden;
  animation: modal-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modal-bounce {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.celebration-glow {
  position: absolute;
  inset: -50%;
  background: radial-gradient(
    circle,
    rgba(251, 146, 60, 0.15) 0%,
    transparent 50%
  );
  animation: glow-pulse 3s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.milestone-icon {
  @apply flex justify-center;
}

.icon-ring {
  @apply w-24 h-24 rounded-full;
  @apply bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30;
  @apply flex items-center justify-center;
  @apply ring-4 ring-orange-300 dark:ring-orange-700;
  animation: pulse-soft 2s ease-in-out infinite;
}

.icon-emoji {
  @apply text-5xl;
}

.progress-hint {
  @apply py-4;
}

/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .celebration-modal,
.modal-leave-to .celebration-modal {
  transform: scale(0.8);
}

/* 响应式 */
@media (max-width: 480px) {
  .celebration-modal {
    @apply max-w-sm;
  }
  
  .milestone-icon .icon-ring {
    @apply w-20 h-20;
  }
  
  .icon-emoji {
    @apply text-4xl;
  }
}
</style>
