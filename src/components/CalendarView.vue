<template>
  <div class="calendar-view">
    <!-- 月份导航 -->
    <div class="calendar-header">
      <button class="nav-btn" @click="prevMonth">
        ‹
      </button>
      <h2 class="month-title">
        {{ currentYear }}年{{ currentMonth + 1 }}月
      </h2>
      <button class="nav-btn" @click="nextMonth">
        ›
      </button>
      
      <div class="view-toggle">
        <button 
          :class="{ active: view === 'month' }"
          @click="view = 'month'"
        >
          月
        </button>
        <button 
          :class="{ active: view === 'week' }"
          @click="view = 'week'"
        >
          周
        </button>
      </div>
    </div>

    <!-- 周标题 -->
    <div class="weekdays">
      <span v-for="day in weekDays" :key="day" class="weekday">
        {{ day }}
      </span>
    </div>

    <!-- 日期网格 -->
    <div class="calendar-grid">
      <div 
        v-for="(day, index) in calendarDays"
        :key="index"
        class="day-cell"
        :class="{
          'other-month': !day.isCurrentMonth,
          'today': day.isToday,
          'has-events': day.events.length > 0,
          'selected': selectedDate?.toDateString() === day.date.toDateString(),
          ['density-' + getDensityLevel(day.events.length)]: day.events.length > 0
        }"
        @click="selectDate(day)"
      >
        <span class="day-number">{{ day.day }}</span>
        
        <!-- 事件点 -->
        <div class="event-dots">
          <span 
            v-for="event in day.events.slice(0, 3)"
            :key="event.id"
            class="event-dot"
            :style="{ backgroundColor: getEventColor(event.type) }"
          ></span>
          <span v-if="day.events.length > 3" class="more-events">
            +{{ day.events.length - 3 }}
          </span>
        </div>
      </div>
    </div>

    <!-- 选中日期详情 -->
    <transition name="slide-up">
      <div v-if="selectedDay" class="day-detail glass-card">
        <div class="detail-header">
          <h3>{{ formatSelectedDate }}</h3>
          <span class="day-summary">
            {{ selectedDay.events.length }} 个任务
          </span>
        </div>
        
        <div class="day-timeline">
          <div 
            v-for="event in selectedDay.events"
            :key="event.id"
            class="timeline-event"
            @click="$emit('event-click', event)"
          >
            <span class="event-time">{{ event.time }}</span>
            <span class="event-title">{{ event.title }}</span>
            <span class="event-type-icon">{{ getEventIcon(event.type) }}</span>
          </div>
        </div>
        
        <div v-if="selectedDay.events.length === 0" class="empty-day">
          <span>📅</span>
          <p>这天没有安排任务</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface CalendarEvent {
  id: string
  title: string
  time: string
  type: 'task' | 'focus' | 'checkin' | 'habit'
  completed?: boolean
  date?: string  // 添加日期字段
}

const props = defineProps<{
  events: CalendarEvent[]
}>()

defineEmits<{
  (e: 'event-click', event: CalendarEvent): void
  (e: 'date-select', date: Date): void
}>()

const currentDate = ref(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const view = ref<'month' | 'week'>('month')
const selectedDate = ref<Date | null>(null)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 获取某日期的事件
const getEventsForDate = (date: Date) => {
  // 修复：使用本地时区格式，避免日期偏移
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`
  
  return props.events.filter(event => {
    // 如果事件有date字段，直接匹配
    if (event.date) {
      return event.date === dateStr
    }
    // 如果没有date字段，尝试从其他属性推断
    return false
  })
}

// 日历日期计算
const calendarDays = computed(() => {
  const days = []
  const year = currentYear.value
  const month = currentMonth.value
  
  // 月第一天
  const firstDay = new Date(year, month, 1)
  // 月最后一天
  const lastDay = new Date(year, month + 1, 0)
  // 今天
  const today = new Date()
  
  // 填充上月的空白
  const startPadding = firstDay.getDay()
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i)
    days.push({
      date,
      day: date.getDate(),
      isCurrentMonth: false,
      isToday: false,
      events: getEventsForDate(date)
    })
  }
  
  // 当月日期
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day)
    days.push({
      date,
      day,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString(),
      events: getEventsForDate(date)
    })
  }
  
  // 填充下月的空白
  const endPadding = 42 - days.length
  for (let day = 1; day <= endPadding; day++) {
    const date = new Date(year, month + 1, day)
    days.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: false,
      events: getEventsForDate(date)
    })
  }
  
  return days
})

// 选中日期的详情
const selectedDay = computed(() => {
  if (!selectedDate.value) return null
  return calendarDays.value.find(d => 
    d.date.toDateString() === selectedDate.value?.toDateString()
  )
})

// 格式化选中日期
const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  return `${currentYear.value}年${currentMonth.value + 1}月${selectedDate.value.getDate()}日`
})

// 导航
const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const selectDate = (day: typeof calendarDays.value[0]) => {
  selectedDate.value = day.date
  defineEmits<any>()
}

// 事件颜色
const getEventColor = (type: string) => {
  const colors: Record<string, string> = {
    'task': '#f97316',
    'focus': '#22c55e',
    'checkin': '#3b82f6',
    'habit': '#8b5cf6'
  }
  return colors[type] || '#6b7280'
}

const getEventIcon = (type: string) => {
  const icons: Record<string, string> = {
    'task': '📝',
    'focus': '⏱️',
    'checkin': '✅',
    'habit': '🎯'
  }
  return icons[type] || '📌'
}

// 获取任务密度等级
const getDensityLevel = (count: number) => {
  if (count >= 5) return 4
  if (count >= 3) return 3
  if (count >= 2) return 2
  if (count >= 1) return 1
  return 0
}
</script>

<style scoped>
.calendar-view {
  padding: 20px 0;
}

/* 头部导航 */
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 24px;
}

.month-title {
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(135deg, #f97316, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-btn:hover {
  background: rgba(249, 115, 22, 0.2);
  color: #f97316;
}

.view-toggle {
  display: flex;
  gap: 8px;
  margin-left: 20px;
}

.view-toggle button {
  padding: 8px 16px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s;
}

.view-toggle button.active {
  background: linear-gradient(135deg, #f97316, #f472b6);
  color: white;
}

/* 周标题 */
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  padding: 8px;
}

/* 日期网格 */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  padding: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.day-cell:hover {
  background: rgba(249, 115, 22, 0.1);
  transform: scale(1.05);
}

.day-cell.other-month {
  opacity: 0.4;
}

.day-cell.today {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(244, 114, 182, 0.2));
}

.day-cell.today .day-number {
  background: linear-gradient(135deg, #f97316, #f472b6);
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-cell.selected {
  background: rgba(249, 115, 22, 0.2);
  border: 2px solid #f97316;
}

/* 任务密度背景 */
.day-cell.density-1 {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.05));
}

.day-cell.density-2 {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(249, 115, 22, 0.1));
}

.day-cell.density-3 {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(244, 114, 182, 0.1));
}

.day-cell.density-4 {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.4), rgba(244, 114, 182, 0.2));
}

.day-number {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

/* 事件点 */
.event-dots {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
  justify-content: center;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.more-events {
  font-size: 9px;
  color: #6b7280;
}

/* 日期详情 */
.day-detail {
  margin-top: 24px;
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-header h3 {
  font-size: 18px;
  font-weight: bold;
}

.day-summary {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
}

.day-timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-event {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.timeline-event:hover {
  background: rgba(249, 115, 22, 0.1);
}

.event-time {
  font-size: 12px;
  color: #6b7280;
  min-width: 60px;
}

.event-title {
  flex: 1;
  font-size: 14px;
}

.event-type-icon {
  font-size: 16px;
}

.empty-day {
  text-align: center;
  padding: 32px;
  color: #9ca3af;
}

.empty-day span {
  font-size: 48px;
  display: block;
  margin-bottom: 8px;
}

/* 动画 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 768px) {
  .calendar-header {
    gap: 12px;
  }
  
  .month-title {
    font-size: 20px;
  }
  
  .view-toggle {
    display: none;
  }
  
  .day-cell {
    padding: 4px;
  }
  
  .day-number {
    font-size: 12px;
  }
}
</style>
