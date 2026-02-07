<template>
  <div class="max-w-7xl mx-auto">
    <div class="glass-card p-8">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h2 class="text-2xl font-bold text-gray-800">📊 学习数据统计</h2>
        <div class="flex gap-2">
          <button
            @click="activePeriod = 'week'"
            :class="activePeriod === 'week' ? 'bg-orange-500 text-white' : 'bg-white/40 text-gray-600'"
            class="px-4 py-2 rounded-xl font-medium transition-all"
          >
            本周
          </button>
          <button
            @click="activePeriod = 'month'"
            :class="activePeriod === 'month' ? 'bg-orange-500 text-white' : 'bg-white/40 text-gray-600'"
            class="px-4 py-2 rounded-xl font-medium transition-all"
          >
            本月
          </button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-gradient-to-br from-orange-100/50 to-pink-100/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30">
          <div class="text-4xl mb-2">📚</div>
          <div class="text-3xl font-bold text-orange-600">{{ stats.tasks }}</div>
          <div class="text-gray-600 text-sm">完成任务</div>
        </div>
        <div class="bg-gradient-to-br from-blue-100/50 to-indigo-100/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30">
          <div class="text-4xl mb-2">⏱️</div>
          <div class="text-3xl font-bold text-blue-600">{{ stats.focusHours }}</div>
          <div class="text-gray-600 text-sm">专注小时</div>
        </div>
        <div class="bg-gradient-to-br from-green-100/50 to-emerald-100/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30">
          <div class="text-4xl mb-2">✅</div>
          <div class="text-3xl font-bold text-green-600">{{ stats.checkins }}</div>
          <div class="text-gray-600 text-sm">打卡天数</div>
        </div>
        <div class="bg-gradient-to-br from-purple-100/50 to-pink-100/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30">
          <div class="text-4xl mb-2">💰</div>
          <div class="text-3xl font-bold text-purple-600">{{ stats.points }}</div>
          <div class="text-gray-600 text-sm">获得积分</div>
        </div>
      </div>

      <!-- 专注时长柱状图 -->
      <div class="mb-8">
        <h3 class="text-lg font-bold text-gray-700 mb-4">📈 每日专注时长</h3>
        <div class="flex items-end justify-between gap-2 h-48">
          <div
            v-for="(day, index) in focusData"
            :key="index"
            class="flex-1 flex flex-col items-center"
          >
            <div
              class="w-full bg-gradient-to-t from-orange-400 to-pink-400 rounded-t-lg transition-all hover:opacity-80"
              :style="{ height: (day.minutes / maxMinutes * 100) + '%' }"
            ></div>
            <span class="text-xs text-gray-500 mt-2">{{ day.label }}</span>
            <span class="text-xs text-gray-400">{{ day.minutes }}m</span>
          </div>
        </div>
      </div>

      <!-- 任务分类统计 -->
      <div class="mb-8">
        <h3 class="text-lg font-bold text-gray-700 mb-4">📊 任务分类占比</h3>
        <div class="flex gap-6 items-center flex-wrap">
          <div class="flex-1 min-w-[200px]">
            <div class="space-y-3">
              <div
                v-for="category in categoryStats"
                :key="category.name"
                class="flex items-center gap-3"
              >
                <span class="text-xl">{{ category.icon }}</span>
                <div class="flex-1">
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600">{{ category.name }}</span>
                    <span class="font-bold text-orange-600">{{ category.count }} ({{ category.percentage }}%)</span>
                  </div>
                  <div class="h-3 bg-white/30 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-orange-400 to-pink-400 rounded-full transition-all"
                      :style="{ width: category.percentage + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 饼图 -->
          <div class="w-40 h-40 relative">
            <svg viewBox="0 0 100 100" class="transform -rotate-90">
              <circle
                v-for="(category, index) in pieData"
                :key="index"
                cx="50"
                cy="50"
                r="40"
                fill="none"
                :stroke="category.color"
                stroke-width="20"
                :stroke-dasharray="category.dashArray"
                :stroke-dashoffset="category.dashOffset"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- 专注效率 -->
      <div class="border-t border-white/20 pt-6">
        <h3 class="text-lg font-bold text-gray-700 mb-4">⚡ 专注效率</h3>
        <div class="grid md:grid-cols-3 gap-4">
          <div class="text-center p-4 bg-white/30 rounded-xl">
            <div class="text-2xl font-bold text-orange-600">{{ stats.avgSessionLength }}</div>
            <div class="text-gray-500 text-sm">平均单次时长</div>
          </div>
          <div class="text-center p-4 bg-white/30 rounded-xl">
            <div class="text-2xl font-bold text-green-600">{{ stats.completionRate }}%</div>
            <div class="text-gray-500 text-sm">任务完成率</div>
          </div>
          <div class="text-center p-4 bg-white/30 rounded-xl">
            <div class="text-2xl font-bold text-blue-600">{{ stats.bestDay }}</div>
            <div class="text-gray-500 text-sm">效率最高日</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const activePeriod = ref('week')
const tasks = ref([])
const pieRotation = ref(0)

const stats = computed(() => {
  const days = activePeriod.value === 'week' ? 7 : 30
  
  // 计算任务统计
  const completedTasks = tasks.value.filter(t => t.completed).length
  const totalTasks = tasks.value.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  // 计算专注统计
  let totalMinutes = 0
  let totalSessions = 0
  
  try {
    const focusData = JSON.parse(localStorage.getItem('focusHistory') || '{}')
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()
      if (focusData[dateStr]) {
        totalMinutes += focusData[dateStr].minutes || 0
        totalSessions += focusData[dateStr].sessions || 0
      }
    }
  } catch (error) {}
  
  // 计算打卡统计
  let checkinDays = 0
  try {
    const checkinData = JSON.parse(localStorage.getItem('checkinHistory') || '{}')
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()
      if (checkinData[dateStr] && checkinData[dateStr].total >= 2) {
        checkinDays++
      }
    }
  } catch (error) {}
  
  // 计算积分
  const points = completedTasks * 10 + checkinDays * 5
  
  return {
    tasks: completedTasks,
    focusHours: (totalMinutes / 60).toFixed(1),
    checkins: checkinDays,
    points,
    avgSessionLength: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
    completionRate,
    bestDay: '周二'
  }
})

const focusData = computed(() => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const data = []
  
  try {
    const focusHistory = JSON.parse(localStorage.getItem('focusHistory') || '{}')
    const today = new Date()
    const dayOfWeek = today.getDay() || 7
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - dayOfWeek + i)
      const dateStr = date.toDateString()
      
      data.push({
        label: days[i - 1],
        minutes: focusHistory[dateStr]?.minutes || 0
      })
    }
  } catch (error) {
    days.forEach((day, i) => {
      data.push({ label: day, minutes: 0 })
    })
  }
  
  return data
})

const maxMinutes = computed(() => {
  return Math.max(...focusData.value.map(d => d.minutes), 60)
})

const categoryStats = computed(() => {
  const categories = [
    { value: 'study', name: '学习', icon: '📚' },
    { value: 'english', name: '英语', icon: '🔤' },
    { value: 'politics', name: '政治', icon: '📰' },
    { value: 'major', name: '专业课', icon: '🎓' },
    { value: 'exercise', name: '运动', icon: '🏃' }
  ]
  
  return categories.map(cat => {
    const count = tasks.value.filter(t => t.category === cat.value).length
    const total = tasks.value.filter(t => t.category).length || 1
    return {
      ...cat,
      count,
      percentage: Math.round((count / total) * 100)
    }
  })
})

const pieData = computed(() => {
  const categories = [
    { name: '学习', color: '#f97316', value: categoryStats.value[0]?.count || 0 },
    { name: '英语', color: '#3b82f6', value: categoryStats.value[1]?.count || 0 },
    { name: '政治', color: '#10b981', value: categoryStats.value[2]?.count || 0 },
    { name: '专业课', color: '#8b5cf6', value: categoryStats.value[3]?.count || 0 }
  ]
  
  const total = categories.reduce((sum, cat) => sum + cat.value, 0) || 1
  let currentOffset = 0
  
  return categories.map(cat => {
    const percentage = cat.value / total
    const dashArray = `${percentage * 251.2} 251.2`
    const dashOffset = -currentOffset * 251.2
    currentOffset += percentage
    return {
      ...cat,
      percentage: Math.round(percentage * 100),
      dashArray,
      dashOffset
    }
  })
})

const loadTasks = () => {
  try {
    const saved = localStorage.getItem('tasks')
    if (saved) {
      tasks.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Error loading tasks:', error)
  }
}

onMounted(loadTasks)
</script>
