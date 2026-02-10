<template>
  <div class="calendar-page max-w-7xl mx-auto">
    <div class="glass-card p-8">
      <!-- 页面标题 -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span class="text-3xl animate-bounce-soft">📆</span>
          <span class="text-rainbow">日历视图</span>
        </h1>
      </div>

      <!-- 集成日历组件 -->
      <CalendarView 
        :events="calendarEvents"
        @event-click="onEventClick"
        @date-select="onDateSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CalendarView from '../components/CalendarView.vue'

interface CalendarEvent {
  id: string
  title: string
  time: string
  type: 'task' | 'focus' | 'checkin' | 'habit'
  completed?: boolean
}

// 任务事件
const tasks = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('tasks') || '[]')
  } catch {
    return []
  }
})

// 专注记录
const focusHistory = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('focusHistory') || '{}')
  } catch {
    return {}
  }
})

// 打卡记录
const checkinHistory = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('checkinHistory') || '{}')
  } catch {
    return {}
  }
})

// 习惯列表
const habits = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('habits') || '[]')
  } catch {
    return []
  }
})

// 组合日历事件
const calendarEvents = computed((): CalendarEvent[] => {
  const events: CalendarEvent[] = []
  
  // 添加任务事件
  tasks.value.forEach((task: any) => {
    // 兼容 date 和 dueDate 两种字段名
    const taskDate = task.dueDate || task.date
    if (taskDate && !task.completed) {
      // 确保日期格式正确 (YYYY-MM-DD)
      let dateStr = taskDate
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          dateStr = `${parts[0].padStart(4, '0')}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
        }
      }
      events.push({
        id: `task-${task.id}`,
        title: task.text,
        time: '截止日期',
        type: 'task',
        completed: task.completed,
        date: dateStr
      })
    }
  })
  
  return events
})

const onEventClick = (event: CalendarEvent) => {
  console.log('点击事件:', event)
}

const onDateSelect = (date: Date) => {
  console.log('选择日期:', date)
}
</script>

<style scoped>
.calendar-page {
  padding-bottom: 100px;
}
</style>
