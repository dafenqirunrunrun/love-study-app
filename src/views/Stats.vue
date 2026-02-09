<template>
  <div class="max-w-7xl mx-auto">
    <!-- 骨架屏加载状态 -->
    <template v-if="isLoading">
      <div class="glass-card p-8">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div class="skeleton-pulse rounded h-8 w-48" :class="isDarkMode ? 'bg-white/20' : 'bg-white/40'"></div>
          <div class="flex gap-2">
            <div class="skeleton-pulse rounded-full px-6 py-2" :class="isDarkMode ? 'bg-white/15' : 'bg-white/40'"></div>
            <div class="skeleton-pulse rounded-full px-6 py-2" :class="isDarkMode ? 'bg-white/15' : 'bg-white/30'"></div>
          </div>
        </div>
        <SkeletonLoader type="stats" :dark-mode="isDarkMode" />
        <div class="mt-8">
          <SkeletonLoader type="list" :rows="7" :dark-mode="isDarkMode" />
        </div>
      </div>
    </template>

    <!-- 真实内容 -->
    <template v-else>
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
          <div class="bg-gradient-to-br from-orange-100/50 to-pink-100/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30 relative overflow-hidden">
            <div class="text-4xl mb-2">📚</div>
            <div class="text-3xl font-bold text-orange-600">{{ stats.tasks }}</div>
            <div class="text-gray-600 text-sm">完成任务</div>
            <!-- 对比箭头 -->
            <div class="comparison-arrow" :class="comparison.tasks >= 0 ? 'up' : 'down'">
              <span>{{ comparison.tasks >= 0 ? '↑' : '↓' }}</span>
              <span>{{ Math.abs(comparison.tasks) }}</span>
            </div>
          </div>
          <div class="bg-gradient-to-br from-blue-100/50 to-indigo-100/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30 relative overflow-hidden">
            <div class="text-4xl mb-2">⏱️</div>
            <div class="text-3xl font-bold text-blue-600">{{ stats.focusHours }}</div>
            <div class="text-gray-600 text-sm">专注小时</div>
            <!-- 对比箭头 -->
            <div class="comparison-arrow" :class="comparison.focus >= 0 ? 'up' : 'down'">
              <span>{{ comparison.focus >= 0 ? '↑' : '↓' }}</span>
              <span>{{ Math.abs(comparison.focus) }}h</span>
            </div>
          </div>
          <div class="bg-gradient-to-br from-green-100/50 to-emerald-100/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30 relative overflow-hidden">
            <div class="text-4xl mb-2">✅</div>
            <div class="text-3xl font-bold text-green-600">{{ stats.checkins }}</div>
            <div class="text-gray-600 text-sm">打卡天数</div>
            <!-- 对比箭头 -->
            <div class="comparison-arrow" :class="comparison.checkins >= 0 ? 'up' : 'down'">
              <span>{{ comparison.checkins >= 0 ? '↑' : '↓' }}</span>
              <span>{{ Math.abs(comparison.checkins) }}</span>
            </div>
          </div>
          <div class="bg-gradient-to-br from-purple-100/50 to-pink-100/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30 relative overflow-hidden">
            <div class="text-4xl mb-2">💰</div>
            <div class="text-3xl font-bold text-purple-600">{{ stats.points }}</div>
            <div class="text-gray-600 text-sm">获得积分</div>
            <!-- 对比箭头 -->
            <div class="comparison-arrow" :class="comparison.points >= 0 ? 'up' : 'down'">
              <span>{{ comparison.points >= 0 ? '↑' : '↓' }}</span>
              <span>{{ Math.abs(comparison.points) }}</span>
            </div>
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

        <!-- 学习热力图 -->
        <div class="border-t border-white/20 pt-6 mt-6">
          <h3 class="text-lg font-bold text-gray-700 mb-4">📅 学习热力图</h3>
          <div class="heatmap-container">
            <!-- 月份标签 -->
            <div class="heatmap-labels">
              <span v-for="month in heatmapMonths" :key="month" class="heatmap-month">{{ month }}</span>
            </div>
            <!-- 星期标签 -->
            <div class="heatmap-grid">
              <div class="heatmap-weekdays">
                <span class="weekday-label">周一</span>
                <span class="weekday-label">周三</span>
                <span class="weekday-label">周五</span>
                <span class="weekday-label">周日</span>
              </div>
              <div class="heatmap-weeks">
                <div 
                  v-for="(week, weekIndex) in heatmapData" 
                  :key="weekIndex" 
                  class="heatmap-week"
                >
                  <div 
                    v-for="(day, dayIndex) in week" 
                    :key="dayIndex"
                    class="heatmap-day"
                    :class="'heatmap-level-' + day.level"
                    :title="day.date + ': ' + day.minutes + '分钟'"
                  ></div>
                </div>
              </div>
            </div>
            <!-- 图例 -->
            <div class="heatmap-legend">
              <span class="legend-label">少</span>
              <div class="legend-squares">
                <div class="heatmap-day heatmap-level-0"></div>
                <div class="heatmap-day heatmap-level-1"></div>
                <div class="heatmap-day heatmap-level-2"></div>
                <div class="heatmap-day heatmap-level-3"></div>
                <div class="heatmap-day heatmap-level-4"></div>
              </div>
              <span class="legend-label">多</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'

const activePeriod = ref('week')
const tasks = ref([])
const pieRotation = ref(0)
const isLoading = ref(true)
const isDarkMode = ref(false)

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

// 与上周对比
const comparison = computed(() => {
  // 模拟上周数据（实际项目中应该从历史数据计算）
  const lastWeekTasks = Math.max(0, Math.floor(Math.random() * 10))
  const lastWeekFocus = Math.max(0, Math.floor(Math.random() * 15))
  const lastWeekCheckins = Math.max(0, Math.floor(Math.random() * 5))
  const lastWeekPoints = Math.max(0, Math.floor(Math.random() * 100))
  
  return {
    tasks: stats.value.tasks - lastWeekTasks,
    focus: parseFloat(stats.value.focusHours) - lastWeekFocus,
    checkins: stats.value.checkins - lastWeekCheckins,
    points: stats.value.points - lastWeekPoints
  }
})

const focusData = computed(() => {
  const data = []
  const daysCount = activePeriod.value === 'week' ? 7 : 30
  const dayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  
  try {
    const focusHistory = JSON.parse(localStorage.getItem('focusHistory') || '{}')
    const today = new Date()
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toDateString()
      
      // 每周显示周几，每月显示日期
      const label = activePeriod.value === 'week' 
        ? dayLabels[date.getDay()]
        : `${date.getMonth() + 1}/${date.getDate()}`
      
      data.push({
        label,
        minutes: focusHistory[dateStr]?.minutes || 0
      })
    }
  } catch (error) {
    for (let i = 0; i < daysCount; i++) {
      data.push({ label: '', minutes: 0 })
    }
  }
  
  return data
})

const maxMinutes = computed(() => {
  const max = Math.max(...focusData.value.map(d => d.minutes), 60)
  // 月视图显示更高的最大值
  return activePeriod.value === 'month' ? Math.max(max, 120) : max
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

// 热力图数据
const heatmapMonths = ['1月', '2月', '3月', '4月', '5月', '6月']

const heatmapData = computed(() => {
  const weeks = []
  const focusHistory = JSON.parse(localStorage.getItem('focusHistory') || '{}')
  const today = new Date()
  
  // 生成最近12周的数据
  for (let week = 11; week >= 0; week--) {
    const weekData = []
    for (let day = 0; day < 7; day++) {
      const date = new Date(today)
      date.setDate(today.getDate() - (week * 7) + day - today.getDay() + 1)
      const dateStr = date.toDateString()
      const minutes = focusHistory[dateStr]?.minutes || 0
      
      // 计算热力等级 (0-4)
      let level = 0
      if (minutes > 0) level = 1
      if (minutes >= 30) level = 2
      if (minutes >= 60) level = 3
      if (minutes >= 120) level = 4
      
      weekData.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        minutes,
        level
      })
    }
    weeks.push(weekData)
  }
  
  return weeks
})

const loadTasks = () => {
  // 显示骨架屏
  isLoading.value = true
  
  try {
    const saved = localStorage.getItem('tasks')
    if (saved) {
      tasks.value = JSON.parse(saved)
    }
    
    // 检查深色模式
    isDarkMode.value = document.documentElement.classList.contains('dark')
  } catch (error) {
    console.error('Error loading tasks:', error)
  } finally {
    // 隐藏骨架屏，显示内容
    setTimeout(() => {
      isLoading.value = false
    }, 300)
  }
}

onMounted(loadTasks)
</script>

<style scoped>
/* 热力图样式 */
.heatmap-container {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 16px;
}

.heatmap-labels {
  display: flex;
  margin-left: 40px;
  margin-bottom: 8px;
  gap: 28px;
}

.heatmap-month {
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
}

.weekday-label {
  font-size: 10px;
  color: #666;
  height: 12px;
}

.heatmap-weeks {
  display: flex;
  gap: 3px;
  flex: 1;
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

.dark .heatmap-month,
.dark .weekday-label {
  color: #94a3b8;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.legend-label {
  font-size: 11px;
  color: #666;
}

.legend-squares {
  display: flex;
  gap: 3px;
}

.dark .legend-label {
  color: #94a3b8;
}

/* 对比箭头样式 */
.comparison-arrow {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 8px;
}

.comparison-arrow.up {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.comparison-arrow.down {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
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
