<template>
  <div class="max-w-7xl mx-auto">
    <div class="glass-card p-8">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h2 class="text-2xl font-bold text-gray-800">📅 每日打卡</h2>
        <div class="flex items-center gap-2 text-orange-600">
          <span class="text-lg">🔥 连续打卡</span>
          <span class="text-3xl font-bold">{{ consecutiveDays }} 天</span>
        </div>
      </div>

      <!-- 本周进度 -->
      <div class="mb-8">
        <h3 class="text-lg font-bold text-gray-700 mb-4">📊 本周进度</h3>
        <div class="flex justify-between items-center mb-3">
          <span class="text-gray-600">完成天数</span>
          <span class="text-orange-600 font-bold">{{ weeklyProgress }} / 7 天</span>
        </div>
        <div class="flex gap-2">
          <div
            v-for="(day, index) in weekDays"
            :key="index"
            class="flex-1 text-center"
          >
            <div
              class="h-14 rounded-xl flex items-center justify-center text-2xl mb-2 transition-all"
              :class="day.checked 
                ? 'bg-gradient-to-br from-orange-400 to-pink-400 text-white shadow-lg' 
                : 'bg-white/40 text-gray-400'"
            >
              {{ day.checked ? '✓' : '' }}
            </div>
            <span class="text-sm text-gray-500">{{ day.name }}</span>
          </div>
        </div>
      </div>

      <!-- 习惯列表 -->
      <div class="mb-8">
        <h3 class="text-lg font-bold text-gray-700 mb-4">🎯 今日习惯</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <div
            v-for="habit in habits"
            :key="habit.id"
            class="relative p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20 transition-all hover:bg-white/40 hover:shadow-lg cursor-pointer"
            @click="toggleHabit(habit)"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all"
                :class="habit.todayCompleted 
                  ? 'bg-gradient-to-br from-green-400 to-emerald-400 text-white shadow-lg' 
                  : 'bg-white/50'"
              >
                {{ habit.icon }}
              </div>
              <div class="flex-1">
                <div class="font-bold text-gray-800 text-lg">{{ habit.name }}</div>
                <div class="text-sm text-gray-500">连续 {{ habit.streak }} 天</div>
              </div>
              <div
                class="w-10 h-10 rounded-full border-3 flex items-center justify-center transition-all"
                :class="habit.todayCompleted 
                  ? 'border-green-500 bg-green-500 text-white' 
                  : 'border-gray-300'"
              >
                <span v-if="habit.todayCompleted" class="font-bold">✓</span>
              </div>
            </div>
            <!-- 进度条 -->
            <div class="mt-4">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>月度进度</span>
                <span>{{ Math.min(100, habit.streak * 3) }}%</span>
              </div>
              <div class="h-2 bg-white/30 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-orange-400 to-pink-400 rounded-full transition-all"
                  :style="{ width: Math.min(100, habit.streak * 3) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 打卡历史 -->
      <div class="border-t border-white/20 pt-6">
        <h3 class="text-lg font-bold text-gray-700 mb-4">📜 打卡日历</h3>
        <div class="grid grid-cols-7 gap-2">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="aspect-square rounded-xl flex items-center justify-center text-sm font-medium"
            :class="day.completed 
              ? 'bg-gradient-to-br from-orange-400 to-pink-400 text-white' 
              : day.today
              ? 'bg-white/50 text-gray-700 border-2 border-orange-300'
              : 'bg-white/20 text-gray-400'"
          >
            {{ day.day }}
          </div>
        </div>
        <div class="flex justify-center gap-4 mt-4 text-sm text-gray-500">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-gradient-to-br from-orange-400 to-pink-400"></div>
            <span>已完成</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-white/50 border-2 border-orange-300"></div>
            <span>今日</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-white/20"></div>
            <span>未完成</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['updatePoints'])

const habits = ref([
  { id: 1, name: '早起学习', icon: '🌅', streak: 0, todayCompleted: false },
  { id: 2, name: '英语学习', icon: '🔤', streak: 0, todayCompleted: false },
  { id: 3, name: '运动锻炼', icon: '🏃', streak: 0, todayCompleted: false },
  { id: 4, name: '早睡休息', icon: '🌙', streak: 0, todayCompleted: false }
])

const weekDays = ref([
  { name: '周一', checked: false },
  { name: '周二', checked: false },
  { name: '周三', checked: false },
  { name: '周四', checked: false },
  { name: '周五', checked: false },
  { name: '周六', checked: false },
  { name: '周日', checked: false }
])

const consecutiveDays = computed(() => {
  let consecutive = 0
  const savedCheckins = JSON.parse(localStorage.getItem('checkinHistory') || '{}')
  
  for (let i = 0; i < 365; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toDateString()
    
    if (savedCheckins[dateStr] && savedCheckins[dateStr].total >= 2) {
      consecutive++
    } else if (i === 0) {
      continue
    } else {
      break
    }
  }
  return consecutive
})

const weeklyProgress = computed(() => {
  return weekDays.value.filter(d => d.checked).length
})

const calendarDays = computed(() => {
  const days = []
  const today = new Date()
  const currentDay = today.getDate()
  
  for (let i = 30; i >= 1; i--) {
    const date = new Date()
    date.setDate(today.getDate() - i)
    const dateStr = date.toDateString()
    
    const savedCheckins = JSON.parse(localStorage.getItem('checkinHistory') || '{}')
    const completed = savedCheckins[dateStr] && savedCheckins[dateStr].total >= 2
    
    days.push({
      day: date.getDate(),
      completed,
      today: date.getDate() === currentDay
    })
  }
  
  return days
})

const toggleHabit = (habit) => {
  habit.todayCompleted = !habit.todayCompleted
  
  if (habit.todayCompleted) {
    habit.streak++
    const currentPoints = parseInt(localStorage.getItem('lovePoints') || '0')
    localStorage.setItem('lovePoints', (currentPoints + 5).toString())
    emit('updatePoints')
  } else {
    habit.streak = Math.max(0, habit.streak - 1)
  }
  
  saveToStorage()
  loadData()
}

const saveToStorage = () => {
  localStorage.setItem('habits', JSON.stringify(habits.value))
  
  const today = new Date().toDateString()
  const savedCheckins = JSON.parse(localStorage.getItem('checkinHistory') || '{}')
  
  if (!savedCheckins[today]) {
    savedCheckins[today] = []
  }
  
  habits.value.forEach(habit => {
    if (habit.todayCompleted) {
      if (!savedCheckins[today].includes(habit.id)) {
        savedCheckins[today].push(habit.id)
      }
    } else {
      savedCheckins[today] = savedCheckins[today].filter(id => id !== habit.id)
    }
  })
  
  savedCheckins[today].total = savedCheckins[today].length
  localStorage.setItem('checkinHistory', JSON.stringify(savedCheckins))
}

const loadData = () => {
  try {
    const savedHabits = localStorage.getItem('habits')
    if (savedHabits) {
      habits.value = JSON.parse(savedHabits)
    }
    
    const savedCheckins = localStorage.getItem('checkinHistory')
    if (savedCheckins) {
      const checkins = JSON.parse(savedCheckins)
      const today = new Date().toDateString()
      const todayCheckins = checkins[today]
      
      if (todayCheckins) {
        habits.value.forEach(habit => {
          habit.todayCompleted = todayCheckins.includes(habit.id)
        })
      }
      
      // 更新本周进度
      const weekStart = getWeekStart(new Date())
      weekDays.value.forEach((day, index) => {
        const dayDate = new Date(weekStart)
        dayDate.setDate(dayDate.getDate() + index)
        const dayStr = dayDate.toDateString()
        day.checked = checkins[dayStr] && checkins[dayStr].total >= 2
      })
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

const getWeekStart = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

// 初始化
loadData()
</script>
