<template>
  <div class="timeline-view">
    <!-- 时间线容器 -->
    <div class="timeline-container">
      <!-- 时间槽（每小时） -->
      <div 
        v-for="slot in timeSlots" 
        :key="slot.hour"
        class="time-slot"
        :class="{ 'current-hour': slot.isCurrent }"
      >
        <!-- 时间标签 -->
        <div class="time-label">
          <span class="hour">{{ formatHour(slot.hour) }}</span>
          <span class="period">{{ slot.period }}</span>
        </div>
        
        <!-- 任务气泡区域 -->
        <div class="slot-content">
          <transition-group name="task-bubble">
            <TaskBubble
              v-for="task in getTasksForHour(slot.hour)"
              :key="task.id"
              :task="task"
              @click="$emit('task-click', task)"
              @complete="$emit('task-complete', task)"
            />
          </transition-group>
          
          <!-- 添加任务快捷按钮 -->
          <button 
            v-if="!hasTaskAtHour(slot.hour)"
            class="add-quick-btn"
            @click="addTaskAtHour(slot.hour)"
          >
            <span>+</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 收件箱（未安排任务） -->
    <div class="inbox-section" v-if="unscheduledTasks.length > 0">
      <div class="inbox-header">
        <span class="inbox-icon">📥</span>
        <span class="inbox-title">收件箱</span>
        <span class="inbox-count">{{ unscheduledTasks.length }}</span>
      </div>
      <div class="inbox-tasks">
        <TaskBubble
          v-for="task in unscheduledTasks"
          :key="task.id"
          :task="task"
          compact
          @click="$emit('task-click', task)"
          @complete="$emit('task-complete', task)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import TaskBubble from './TaskBubble.vue'

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
  tasks: Task[]
}>()

defineEmits<{
  (e: 'task-click', task: Task): void
  (e: 'task-complete', task: Task): void
  (e: 'add-task', hour: number): void
}>()

// 当前时间
const currentHour = ref(new Date().getHours())

// 更新时间
const updateCurrentTime = () => {
  currentHour.value = new Date().getHours()
}

onMounted(() => {
  const interval = setInterval(updateCurrentTime, 60000)
  onUnmounted(() => clearInterval(interval))
})

// 时间槽（6:00 - 24:00）
const timeSlots = computed(() => {
  const slots = []
  for (let hour = 6; hour <= 24; hour++) {
    slots.push({
      hour,
      period: hour < 12 ? '上午' : hour < 14 ? '中午' : hour < 18 ? '下午' : '晚上',
      isCurrent: hour === currentHour.value
    })
  }
  return slots
})

// 获取某小时的任务
const getTasksForHour = (hour: number) => {
  return props.tasks.filter(task => {
    if (task.completed) return false
    if (task.scheduledHour === hour) return true
    if (task.dueTime) {
      const taskHour = parseInt(task.dueTime.split(':')[0])
      return taskHour === hour
    }
    return false
  })
}

// 检查某小时是否有任务
const hasTaskAtHour = (hour: number) => {
  return getTasksForHour(hour).length > 0
}

// 获取未安排任务
const unscheduledTasks = computed(() => {
  return props.tasks.filter(task => {
    return !task.completed && !task.scheduledHour && !task.dueTime
  })
})

// 格式化小时显示
const formatHour = (hour: number) => {
  if (hour === 12) return '12:00'
  if (hour === 24) return '24:00'
  return hour > 12 ? `${hour - 12}:00` : `${hour}:00`
}

// 添加任务到指定时间
const addTaskAtHour = (hour: number) => {
  defineEmits<any>()
  // 这里会触发添加任务事件
}
</script>

<style scoped>
.timeline-view {
  padding: 16px 0;
}

.timeline-container {
  position: relative;
}

/* 时间轴线 */
.timeline-container::before {
  content: '';
  position: absolute;
  left: 50px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(249, 115, 22, 0.3) 10%,
    rgba(249, 115, 22, 0.5) 50%,
    rgba(249, 115, 22, 0.3) 90%,
    transparent
  );
}

.time-slot {
  display: flex;
  min-height: 100px;
  margin-bottom: 8px;
  position: relative;
}

.time-slot.current-hour .time-label {
  background: linear-gradient(135deg, #f97316, #f472b6);
  color: white;
  box-shadow: 0 0 20px rgba(249, 115, 22, 0.5);
}

.time-label {
  width: 60px;
  padding: 8px;
  text-align: center;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  margin-right: 16px;
  flex-shrink: 0;
  transition: all 0.3s;
}

.time-label .hour {
  display: block;
  font-size: 18px;
  font-weight: bold;
}

.time-label .period {
  display: block;
  font-size: 10px;
  opacity: 0.8;
}

.slot-content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
}

.add-quick-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px dashed rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.05);
  color: rgba(249, 115, 22, 0.5);
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-quick-btn:hover {
  border-color: #f97316;
  color: #f97316;
  background: rgba(249, 115, 22, 0.1);
}

/* 收件箱 */
.inbox-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px dashed rgba(249, 115, 22, 0.2);
}

.inbox-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.inbox-icon {
  font-size: 24px;
}

.inbox-title {
  font-size: 18px;
  font-weight: bold;
  background: linear-gradient(135deg, #f97316, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.inbox-count {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
}

.inbox-tasks {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* 动画 */
.task-bubble-enter-active,
.task-bubble-leave-active {
  transition: all 0.3s ease;
}

.task-bubble-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.task-bubble-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

@media (max-width: 768px) {
  .time-label {
    width: 50px;
  }
  
  .time-label .hour {
    font-size: 16px;
  }
  
  .time-label .period {
    font-size: 9px;
  }
}
</style>
