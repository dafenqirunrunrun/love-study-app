<template>
  <div class="max-w-7xl mx-auto">
    <!-- 庆祝特效 -->
    <ConfettiEffect ref="confettiRef" @complete="onConfettiComplete" />
    
    <!-- 骨架屏加载状态 -->
    <template v-if="isLoading">
      <div class="glass-card p-8">
        <div class="flex items-center justify-between mb-8">
          <div class="skeleton-pulse rounded h-8 w-48" :class="isDarkMode ? 'bg-white/20' : 'bg-white/40'"></div>
          <div class="skeleton-pulse rounded-xl px-6 py-2" :class="isDarkMode ? 'bg-white/15' : 'bg-white/30'"></div>
        </div>
        <SkeletonLoader type="stats" :dark-mode="isDarkMode" />
        <div class="mt-8">
          <SkeletonLoader type="list" :rows="4" :dark-mode="isDarkMode" />
        </div>
      </div>
    </template>

    <!-- 真实内容 -->
    <template v-else>
      <div class="glass-card p-8">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span class="text-2xl">📅</span>
            <span class="text-rainbow">每日打卡</span>
          </h2>
          <div class="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl">
            <span class="text-2xl animate-bounce-soft">🔥</span>
            <div class="text-center">
              <div class="text-orange-600 font-bold text-2xl">{{ consecutiveDays }}</div>
              <div class="text-xs text-gray-500">连续打卡</div>
            </div>
          </div>
        </div>

        <!-- 本周进度 -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-700 flex items-center gap-2">
              <span class="text-2xl">📊</span>
              <span class="text-rainbow">本周进度</span>
            </h3>
            <span class="text-orange-600 font-bold">{{ weeklyProgress }} / 7 天</span>
          </div>
          
          <div class="flex flex-wrap items-center gap-6">
            <!-- 大环形图 -->
            <CircularProgress
              :percentage="weeklyProgressPercentage"
              :size="120"
              :stroke-width="10"
              color="linear-gradient(135deg, #10b981, #06b6d4)"
              :current="weeklyProgress"
              :max="7"
            />
            
            <!-- 星期进度条 -->
            <div class="flex-1 min-w-[200px]">
              <div class="flex gap-2">
                <div
                  v-for="(day, index) in weekDays"
                  :key="index"
                  class="flex-1 text-center"
                >
                  <div
                    class="h-12 rounded-xl flex items-center justify-center text-lg mb-1 transition-all transform hover:scale-105 cursor-pointer"
                    :class="day.checked 
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg' 
                      : 'bg-white/40 text-gray-300'"
                    @click="goToToday(index)"
                  >
                    <span v-if="day.checked" class="animate-bounce-soft">✓</span>
                    <span v-else>{{ day.date }}</span>
                  </div>
                  <span class="text-[10px] text-gray-500">{{ day.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 习惯列表 -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-700 flex items-center gap-2">
              <span class="text-2xl">🎯</span>
              <span class="text-rainbow">今日习惯</span>
            </h3>
            <button
              @click="showAddHabit = true"
              class="jelly-button bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm"
            >
              ➕ 添加习惯
            </button>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <div
              v-for="habit in habits"
              :key="habit.id"
              class="relative p-5 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20 transition-all hover:bg-white/40 hover:shadow-lg cursor-pointer group"
              @click="toggleHabit(habit)"
              :style="{ '--habit-color': habit.color }"
            >
              <div class="flex items-center gap-4">
                <div
                  class="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all transform group-hover:scale-110"
                  :style="{ background: habit.todayCompleted ? `linear-gradient(135deg, ${habit.color}, ${adjustColor(habit.color, -30)})` : 'white/50' }"
                >
                  <span class="animate-float" :style="{ color: habit.todayCompleted ? 'white' : 'inherit' }">{{ habit.icon }}</span>
                </div>
                <div class="flex-1">
                  <div class="font-bold text-gray-800 text-lg">{{ habit.name }}</div>
                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <span>🔥 连续 {{ habit.streak }} 天</span>
                    <span v-if="habit.bestStreak > habit.streak" class="text-xs text-orange-500">
                      最佳: {{ habit.bestStreak }}
                    </span>
                  </div>
                </div>
                <div
                  class="w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all"
                  :style="{ 
                    borderColor: habit.todayCompleted ? habit.color : '#d1d5db',
                    backgroundColor: habit.todayCompleted ? habit.color : 'white/50'
                  }"
                >
                  <span v-if="habit.todayCompleted" class="font-bold text-lg animate-bounce-soft" style="color: white">✓</span>
                </div>
              </div>
              <!-- 进度条 -->
              <div class="mt-4">
                <div class="flex justify-between text-xs text-gray-500 mb-1">
                  <span>📈 月度进度</span>
                  <span :style="{ color: habit.color }">{{ Math.min(100, habit.streak * 3) }}%</span>
                </div>
                <div class="h-2 bg-white/30 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :style="{ 
                      width: Math.min(100, habit.streak * 3) + '%',
                      background: `linear-gradient(90deg, ${habit.color}, ${adjustColor(habit.color, -20)})`
                    }"
                  ></div>
                </div>
              </div>
              
              <!-- 删除按钮 -->
              <button
                v-if="!habit.todayCompleted"
                @click.stop="deleteHabit(habit.id)"
                class="absolute -top-2 -right-2 w-8 h-8 bg-red-400 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- 打卡日历 -->
        <div class="border-t border-white/20 pt-6">
          <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span class="text-2xl">📜</span>
            <span class="text-rainbow">打卡日历</span>
          </h3>
          
          <!-- 月份选择 -->
          <div class="flex items-center justify-between mb-4">
            <button @click="changeMonth(-1)" class="p-2 hover:bg-white/30 rounded-lg transition-all">
              <span class="text-xl">◀</span>
            </button>
            <span class="font-bold text-gray-700">{{ currentMonthName }}</span>
            <button @click="changeMonth(1)" class="p-2 hover:bg-white/30 rounded-lg transition-all">
              <span class="text-xl">▶</span>
            </button>
          </div>
          
          <!-- 星期标题 -->
          <div class="grid grid-cols-7 gap-2 mb-2">
            <div v-for="dayName in ['日', '一', '二', '三', '四', '五', '六']" :key="dayName" class="text-center text-sm text-gray-500 font-medium">
              {{ dayName }}
            </div>
          </div>
          
          <!-- 日历网格 -->
          <div class="grid grid-cols-7 gap-2">
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              class="aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all"
              :class="day.completed 
                ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg' 
                : day.today
                ? 'bg-gradient-to-br from-orange-400 to-pink-400 text-white shadow-lg'
                : day.isCurrentMonth
                ? 'bg-white/40 text-gray-700 hover:bg-white/60'
                : 'bg-white/10 text-gray-400'"
            >
              {{ day.day }}
              <div 
                v-if="day.completed" 
                class="absolute bottom-1 w-1 h-1 bg-white rounded-full"
              ></div>
            </div>
          </div>
          
          <!-- 图例 -->
          <div class="flex justify-center gap-6 mt-4 text-sm text-gray-500">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded bg-gradient-to-br from-green-400 to-emerald-500"></div>
              <span>已完成</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded bg-gradient-to-br from-orange-400 to-pink-400"></div>
              <span>今日</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded bg-white/40"></div>
              <span>未完成</span>
            </div>
          </div>
        </div>

        <!-- 热力图 -->
        <div class="border-t border-white/20 pt-6 mt-6">
          <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span class="text-2xl">🔥</span>
            <span class="text-rainbow">打卡热力图</span>
          </h3>
          
          <div class="checkin-heatmap">
            <!-- 月份标签 -->
            <div class="heatmap-months">
              <span v-for="month in heatmapMonths" :key="month">{{ month }}</span>
            </div>
            
            <div class="heatmap-grid">
              <!-- 星期标签 -->
              <div class="heatmap-weekdays">
                <span>周一</span>
                <span>周三</span>
                <span>周五</span>
                <span>周日</span>
              </div>
              
              <!-- 星期行 -->
              <div class="heatmap-weeks">
                <div 
                  v-for="(week, wIndex) in heatmapData" 
                  :key="wIndex" 
                  class="heatmap-week"
                >
                  <div 
                    v-for="(day, dIndex) in week" 
                    :key="dIndex"
                    class="heatmap-day"
                    :class="'heatmap-level-' + day.level"
                    :title="day.date + ': ' + day.count + '个习惯'"
                  ></div>
                </div>
              </div>
            </div>
            
            <!-- 图例 -->
            <div class="heatmap-legend">
              <span class="legend-text">少</span>
              <div class="legend-squares">
                <div class="heatmap-day heatmap-level-0"></div>
                <div class="heatmap-day heatmap-level-1"></div>
                <div class="heatmap-day heatmap-level-2"></div>
                <div class="heatmap-day heatmap-level-3"></div>
                <div class="heatmap-day heatmap-level-4"></div>
              </div>
              <span class="legend-text">多</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 添加习惯对话框 -->
      <div v-if="showAddHabit" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click.self="showAddHabit = false">
        <div class="glass-card p-6 w-full max-w-md mx-4 animate-scale-in">
          <h3 class="text-xl font-bold text-gray-800 mb-4">添加新习惯</h3>
          <input
            v-model="newHabitName"
            type="text"
            placeholder="习惯名称（如：早起背单词）"
            class="w-full px-4 py-3 bg-white/50 border-2 border-white/30 rounded-xl focus:border-orange-400 focus:outline-none mb-4"
          />
          <div class="flex gap-2 mb-6">
            <button
              v-for="icon in availableIcons"
              :key="icon"
              @click="newHabitIcon = icon"
              class="w-12 h-12 rounded-xl text-xl transition-all"
              :class="newHabitIcon === icon ? 'bg-orange-500 text-white' : 'bg-white/40 hover:bg-white/60'"
            >
              {{ icon }}
            </button>
          </div>
          
          <!-- 颜色选择 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-600 mb-2">选择颜色</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="color in availableColors"
                :key="color.value"
                @click="newHabitColor = color.value"
                class="w-8 h-8 rounded-full transition-all transform hover:scale-110"
                :style="{ backgroundColor: color.value }"
                :class="newHabitColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''"
                :title="color.name"
              ></button>
            </div>
          </div>
          <div class="flex gap-3">
            <button @click="showAddHabit = false" class="flex-1 py-3 rounded-xl font-bold bg-white/40 text-gray-600 hover:bg-white/60 transition-all">
              取消
            </button>
            <button @click="addHabit" class="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90 transition-all">
              添加
            </button>
          </div>
        </div>
      </div>

      <!-- 撤销提示 -->
      <UndoToast
        ref="undoToastRef"
        message="打卡已取消"
        undo-text="撤销"
        :duration="5000"
        :on-undo="executeUndo"
        :on-close="clearUndoneHabit"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import UndoToast from '../components/UndoToast.vue'
import ConfettiEffect from '../components/ConfettiEffect.vue'
import CircularProgress from '../components/CircularProgress.vue'

// 辅助函数：调整颜色亮度
const adjustColor = (color, amount) => {
  const hex = color.replace('#', '')
  const num = parseInt(hex, 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
  return '#' + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)
}

const emit = defineEmits(['updatePoints'])

const habits = ref([
  { id: 1, name: '早起学习', icon: '🌅', streak: 0, todayCompleted: false, bestStreak: 0, color: '#10b981' },
  { id: 2, name: '英语学习', icon: '🔤', streak: 0, todayCompleted: false, bestStreak: 0, color: '#3b82f6' },
  { id: 3, name: '运动锻炼', icon: '🏃', streak: 0, todayCompleted: false, bestStreak: 0, color: '#f97316' },
  { id: 4, name: '早睡休息', icon: '🌙', streak: 0, todayCompleted: false, bestStreak: 0, color: '#8b5cf6' }
])

const weekDays = ref([
  { name: '周一', checked: false, date: 1 },
  { name: '周二', checked: false, date: 2 },
  { name: '周三', checked: false, date: 3 },
  { name: '周四', checked: false, date: 4 },
  { name: '周五', checked: false, date: 5 },
  { name: '周六', checked: false, date: 6 },
  { name: '周日', checked: false, date: 0 }
])

const isLoading = ref(true)
const isDarkMode = ref(false)
const confettiRef = ref(null)
const undoToastRef = ref(null)

// 添加习惯相关
const showAddHabit = ref(false)
const newHabitName = ref('')
const newHabitIcon = ref('✨')
const newHabitColor = ref('#10b981')
const availableIcons = ['🌅', '📚', '🔤', '🏃', '🌙', '💪', '🎯', '✨', '📖', '💻', '🎨', '🎵']
const availableColors = [
  { name: '薄荷绿', value: '#10b981' },
  { name: '天蓝色', value: '#3b82f6' },
  { name: '橙红色', value: '#f97316' },
  { name: '粉红色', value: '#ec4899' },
  { name: '紫色', value: '#8b5cf6' },
  { name: '红色', value: '#ef4444' },
  { name: '青色', value: '#06b6d4' },
  { name: '黄色', value: '#eab308' }
]

// 月份导航
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

const currentMonthName = computed(() => {
  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  return `${currentYear.value}年 ${months[currentMonth.value]}`
})

// 热力图月份标签
const heatmapMonths = computed(() => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  return months
})

// 热力图数据
const heatmapData = computed(() => {
  const weeks = []
  const checkinHistory = JSON.parse(localStorage.getItem('checkinHistory') || '{}')
  const today = new Date()
  
  // 生成最近12周的数据
  for (let week = 11; week >= 0; week--) {
    const weekData = []
    for (let day = 0; day < 7; day++) {
      const date = new Date(today)
      date.setDate(today.getDate() - (week * 7) + day - today.getDay() + 1)
      const dateStr = date.toDateString()
      const checkins = checkinHistory[dateStr]?.total || 0
      
      // 计算热力等级 (0-4)
      let level = 0
      if (checkins === 1) level = 1
      else if (checkins === 2) level = 2
      else if (checkins === 3) level = 3
      else if (checkins >= 4) level = 4
      
      weekData.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        count: checkins,
        level
      })
    }
    weeks.push(weekData)
  }
  
  return weeks
})

const changeMonth = (delta) => {
  currentMonth.value += delta
  if (currentMonth.value > 11) {
    currentMonth.value = 0
    currentYear.value++
  } else if (currentMonth.value < 0) {
    currentMonth.value = 11
    currentYear.value--
  }
}

const goToToday = (dayIndex) => {
  // 跳转到今日对应的日期
  const today = new Date()
  currentMonth.value = today.getMonth()
  currentYear.value = today.getFullYear()
}

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

const weeklyProgressPercentage = computed(() => {
  return Math.round((weeklyProgress.value / 7) * 100)
})

const calendarDays = computed(() => {
  const days = []
  const today = new Date()
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDay = firstDay.getDay()
  
  // 填充空白
  for (let i = 0; i < startDay; i++) {
    days.push({ day: '', isCurrentMonth: false, completed: false, today: false })
  }
  
  // 填充日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    const dateStr = date.toDateString()
    const savedCheckins = JSON.parse(localStorage.getItem('checkinHistory') || '{}')
    const completed = savedCheckins[dateStr] && savedCheckins[dateStr].total >= 2
    
    days.push({
      day: i,
      isCurrentMonth: true,
      completed,
      today: dateStr === today.toDateString()
    })
  }
  
  return days
})

// 撤销功能状态
const undoneHabit = ref(null)

// 添加积分记录函数
const addPointsRecord = (points, description, icon) => {
  try {
    const pointsHistory = JSON.parse(localStorage.getItem('pointsHistory') || '[]')
    pointsHistory.unshift({
      points,
      description,
      icon,
      date: new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    })
    if (pointsHistory.length > 100) {
      pointsHistory.splice(100)
    }
    localStorage.setItem('pointsHistory', JSON.stringify(pointsHistory))
  } catch (error) {
    console.error('Error saving points history:', error)
  }
}

// 切换习惯（带撤销功能）
const toggleHabit = (habit) => {
  const wasCompleted = habit.todayCompleted
  
  habit.todayCompleted = !habit.todayCompleted
  
  if (habit.todayCompleted) {
    habit.streak++
    if (habit.streak > habit.bestStreak) {
      habit.bestStreak = habit.streak
    }
    const currentPoints = parseInt(localStorage.getItem('lovePoints') || '0')
    localStorage.setItem('lovePoints', (currentPoints + 5).toString())
    addPointsRecord(5, `完成习惯: ${habit.name}`, '🎯')
    emit('updatePoints')
    
    // 触发庆祝特效
    confettiRef.value?.trigger()
  } else {
    undoneHabit.value = { ...habit }
    habit.streak = Math.max(0, habit.streak - 1)
    showUndoToast()
  }
  
  saveToStorage()
  loadData()
}

// 添加习惯
const addHabit = () => {
  if (newHabitName.value.trim()) {
    const newId = Date.now()
    habits.value.push({
      id: newId,
      name: newHabitName.value.trim(),
      icon: newHabitIcon.value,
      streak: 0,
      todayCompleted: false,
      bestStreak: 0,
      color: newHabitColor.value
    })
    saveToStorage()
    newHabitName.value = ''
    newHabitIcon.value = '✨'
    newHabitColor.value = '#10b981'
    showAddHabit.value = false
  }
}

// 删除习惯
const deleteHabit = (habitId) => {
  if (confirm('确定要删除这个习惯吗？')) {
    habits.value = habits.value.filter(h => h.id !== habitId)
    saveToStorage()
  }
}

// 显示撤销提示
const showUndoToast = () => {
  undoToastRef.value?.show()
}

// 执行撤销
const executeUndo = () => {
  if (undoneHabit.value) {
    const habit = habits.value.find(h => h.id === undoneHabit.value.id)
    if (habit) {
      habit.todayCompleted = true
      habit.streak = undoneHabit.value.streak
      saveToStorage()
      loadData()
    }
    clearUndoneHabit()
  }
}

// 清除撤销状态
const clearUndoneHabit = () => {
  undoneHabit.value = null
}

const onConfettiComplete = () => {
  // 庆祝完成后的回调
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

const init = () => {
  isLoading.value = true
  
  try {
    isDarkMode.value = document.documentElement.classList.contains('dark')
  } catch (error) {
    console.error('Error initializing:', error)
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 300)
  }
}

onMounted(() => {
  loadData()
  init()
})
</script>

<style scoped>
/* 热力图样式 */
.checkin-heatmap {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 16px;
}

.heatmap-months {
  display: flex;
  margin-left: 48px;
  margin-bottom: 8px;
  gap: 24px;
}

.heatmap-months span {
  font-size: 11px;
  color: #666;
}

.heatmap-grid {
  display: flex;
  gap: 8px;
}

.heatmap-weekdays {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2px 0;
  font-size: 10px;
  color: #666;
}

.heatmap-weeks {
  display: flex;
  gap: 3px;
}

.heatmap-week {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.heatmap-day {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  transition: transform 0.1s ease;
  cursor: pointer;
}

.heatmap-day:hover {
  transform: scale(1.3);
  outline: 2px solid rgba(0, 0, 0, 0.2);
}

.heatmap-level-0 {
  background: #ebedf0;
}

.heatmap-level-1 {
  background: #9be9a8;
}

.heatmap-level-2 {
  background: #40c463;
}

.heatmap-level-3 {
  background: #30a14e;
}

.heatmap-level-4 {
  background: #216e39;
}

.dark .heatmap-level-0 {
  background: rgba(255, 255, 255, 0.15);
}

.dark .heatmap-months span,
.dark .heatmap-weekdays {
  color: #94a3b8;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.legend-text {
  font-size: 11px;
  color: #666;
}

.legend-squares {
  display: flex;
  gap: 3px;
}

.dark .legend-text {
  color: #94a3b8;
}

/* 页面过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.page-enter-to,
.page-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
