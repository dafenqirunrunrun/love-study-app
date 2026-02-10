<template>
  <div 
    class="task-bubble" 
    :class="[
      priorityClass,
      { completed: task.completed, compact }
    ]"
    @click="$emit('click', task)"
  >
    <!-- 优先级指示器 -->
    <div class="priority-indicator" v-if="!compact"></div>
    
    <!-- 任务内容 -->
    <div class="bubble-content">
      <!-- 分类图标 -->
      <span class="category-icon">{{ categoryIcon }}</span>
      
      <!-- 任务文本 -->
      <span class="task-text" :class="{ completed: task.completed }">
        {{ task.text }}
      </span>
      
      <!-- 截止时间 -->
      <span v-if="dueTime && !compact" class="due-time">
        ⏰ {{ dueTime }}
      </span>
    </div>
    
    <!-- 完成复选框 -->
    <button 
      class="complete-btn"
      :class="{ checked: task.completed }"
      @click.stop="$emit('complete', task)"
    >
      <span v-if="task.completed">✓</span>
    </button>
    
    <!-- 剩余时间环（今日任务） -->
    <div v-if="showProgress && !compact" class="progress-ring">
      <svg viewBox="0 0 36 36">
        <path
          class="circle-bg"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          class="circle"
          :stroke-dasharray="progressPercent + ', 100'"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <span class="progress-text">{{ remainingTasks }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Task {
  id: string
  text: string
  completed: boolean
  category: string
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
  dueTime?: string
  scheduledHour?: number
}

const props = defineProps<{
  task: Task
  compact?: boolean
  showProgress?: boolean
  remainingTasks?: number
}>()

defineEmits<{
  (e: 'click', task: Task): void
  (e: 'complete', task: Task): void
}>()

// 优先级样式
const priorityClass = computed(() => {
  switch (props.task.priority) {
    case 'high': return 'priority-high'
    case 'medium': return 'priority-medium'
    default: return 'priority-low'
  }
})

// 分类图标
const categoryIcon = computed(() => {
  const icons: Record<string, string> = {
    'study': '📚',
    'english': '🔤',
    'politics': '📰',
    'math': '🔢',
    'major': '🎓',
    'exercise': '🏃',
    'rest': '😴',
    'work': '💼',
    'life': '🏠'
  }
  return icons[props.task.category] || '📝'
})

// 截止时间
const dueTime = computed(() => {
  if (props.task.dueTime) return props.task.dueTime
  if (props.task.scheduledHour !== undefined) {
    const hour = props.task.scheduledHour
    return hour > 12 ? `${hour - 12}:00` : `${hour}:00`
  }
  return null
})

// 进度百分比（用于打卡进度）
const progressPercent = computed(() => {
  if (!props.remainingTasks) return 0
  const total = 4 // 假设每天4个任务
  return Math.round(((total - props.remainingTasks) / total) * 100)
})
</script>

<style scoped>
.task-bubble {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
  min-width: 200px;
  max-width: 400px;
}

.task-bubble:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* 紧凑模式 */
.task-bubble.compact {
  padding: 8px 12px;
  min-width: auto;
}

.task-bubble.compact .bubble-content {
  gap: 8px;
}

/* 优先级样式 */
.task-bubble.priority-high {
  border-color: rgba(239, 68, 68, 0.3);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(255, 255, 255, 0.9));
}

.task-bubble.priority-high .priority-indicator {
  background: #ef4444;
}

.task-bubble.priority-medium {
  border-color: rgba(249, 115, 22, 0.3);
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(255, 255, 255, 0.9));
}

.task-bubble.priority-medium .priority-indicator {
  background: #f97316;
}

.task-bubble.priority-low {
  border-color: rgba(34, 197, 94, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(255, 255, 255, 0.9));
}

.task-bubble.priority-low .priority-indicator {
  background: #22c55e;
}

/* 已完成状态 */
.task-bubble.completed {
  opacity: 0.6;
  background: rgba(34, 197, 94, 0.1);
}

.task-bubble.completed .priority-indicator {
  background: #22c55e;
}

/* 优先级指示器 */
.priority-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 16px 0 0 16px;
}

/* 内容区域 */
.bubble-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.category-icon {
  font-size: 18px;
}

.task-text {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  flex: 1;
}

.task-text.completed {
  text-decoration: line-through;
  color: #9ca3af;
}

.due-time {
  font-size: 12px;
  color: #f97316;
  background: rgba(249, 115, 22, 0.1);
  padding: 2px 8px;
  border-radius: 8px;
}

/* 完成按钮 */
.complete-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.complete-btn:hover {
  border-color: #22c55e;
}

.complete-btn.checked {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-color: transparent;
}

/* 进度环 */
.progress-ring {
  position: relative;
  width: 36px;
  height: 36px;
}

.progress-ring svg {
  transform: rotate(-90deg);
}

.circle-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.5);
  stroke-width: 3;
}

.circle {
  fill: none;
  stroke: linear-gradient(135deg, #f97316, #f472b6);
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  font-weight: bold;
  color: #f97316;
}

/* 动画 */
@keyframes pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.task-bubble:not(.completed):hover {
  animation: pop 0.3s ease;
}

@media (max-width: 768px) {
  .task-bubble {
    min-width: auto;
    max-width: 100%;
    padding: 10px 12px;
  }
  
  .task-text {
    font-size: 13px;
  }
}
</style>
