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
          <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span class="text-3xl animate-bounce-soft">📊</span>
            <span class="text-rainbow">学习数据统计</span>
          </h2>
          <div class="flex gap-2">
            <button
              @click="activePeriod = 'week'"
              :class="activePeriod === 'week' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' : 'bg-white/40 text-gray-600 hover:bg-white/60'"
              class="px-4 py-2 rounded-xl font-medium transition-all"
            >
              本周
            </button>
            <button
              @click="activePeriod = 'month'"
              :class="activePeriod === 'month' ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' : 'bg-white/40 text-gray-600 hover:bg-white/60'"
              class="px-4 py-2 rounded-xl font-medium transition-all"
            >
              本月
            </button>
          </div>
        </div>

        <!-- 统计卡片 - 增强版 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="stat-card-enhanced group">
            <div class="stat-icon-wrapper bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30">
              <span class="stat-icon">📚</span>
            </div>
            <AnimatedCounter 
              :value="stats.tasks" 
              :size="'xl'"
              color="primary"
              class="stat-value"
            />
            <div class="stat-label">完成任务</div>
            <div class="stat-trend" :class="comparison.tasks >= 0 ? 'trend-up' : 'trend-down'">
              <span>{{ comparison.tasks >= 0 ? '↑' : '↓' }}</span>
              <span>{{ Math.abs(comparison.tasks) }}%</span>
            </div>
          </div>
          
          <div class="stat-card-enhanced group">
            <div class="stat-icon-wrapper bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
              <span class="stat-icon">⏱️</span>
            </div>
            <AnimatedCounter 
              :value="parseFloat(stats.focusHours)" 
              :size="'xl'"
              color="info"
              :decimals="1"
              class="stat-value"
              :suffix="'h'"
            />
            <div class="stat-label">专注小时</div>
            <div class="stat-trend" :class="comparison.focus >= 0 ? 'trend-up' : 'trend-down'">
              <span>{{ comparison.focus >= 0 ? '↑' : '↓' }}</span>
              <span>{{ Math.abs(comparison.focus) }}h</span>
            </div>
          </div>
          
          <div class="stat-card-enhanced group">
            <div class="stat-icon-wrapper bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
              <span class="stat-icon">✅</span>
            </div>
            <AnimatedCounter 
              :value="stats.checkins" 
              :size="'xl'"
              color="success"
              class="stat-value"
            />
            <div class="stat-label">打卡天数</div>
            <div class="stat-trend" :class="comparison.checkins >= 0 ? 'trend-up' : 'trend-down'">
              <span>{{ comparison.checkins >= 0 ? '↑' : '↓' }}</span>
              <span>{{ Math.abs(comparison.checkins) }}</span>
            </div>
          </div>
          
          <div class="stat-card-enhanced group">
            <div class="stat-icon-wrapper bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
              <span class="stat-icon">💰</span>
            </div>
            <AnimatedCounter 
              :value="stats.points" 
              :size="'xl'"
              color="warning"
              class="stat-value"
            />
            <div class="stat-label">获得积分</div>
            <div class="stat-trend" :class="comparison.points >= 0 ? 'trend-up' : 'trend-down'">
              <span>{{ comparison.points >= 0 ? '↑' : '↓' }}</span>
              <span>{{ Math.abs(comparison.points) }}</span>
            </div>
          </div>
        </div>

        <!-- 专注时长动画柱状图 -->
        <div class="mb-8">
          <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span class="text-xl">📈</span>
            <span class="text-rainbow">每日专注时长</span>
          </h3>
          <div class="bar-chart-container">
            <div class="bar-chart-y-axis">
              <span>{{ maxMinutes }}m</span>
              <span>{{ Math.round(maxMinutes / 2) }}m</span>
              <span>0m</span>
            </div>
            <div class="bar-chart">
              <div
                v-for="(day, index) in focusData"
                :key="index"
                class="bar-item group"
              >
                <div class="bar-wrapper">
                  <div
                    class="bar-fill"
                    :class="[getBarColor(index), { 'animate-grow': !isLoading }]"
                    :style="{ height: (day.minutes / maxMinutes * 100) + '%' }"
                    @mouseenter="hoveredBar = index"
                    @mouseleave="hoveredBar = null"
                  >
                    <!-- Tooltip -->
                    <div v-if="hoveredBar === index" class="bar-tooltip">
                      <div class="tooltip-content">
                        <span class="tooltip-day">{{ day.label }}</span>
                        <span class="tooltip-value">{{ day.minutes }}分钟</span>
                      </div>
                    </div>
                  </div>
                </div>
                <span class="bar-label">{{ day.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 任务分类统计 - 交互式饼图 -->
        <div class="mb-8">
          <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span class="text-xl">📊</span>
            <span class="text-rainbow">任务分类占比</span>
          </h3>
          <div class="flex gap-8 items-center flex-wrap">
            <!-- 交互式饼图 -->
            <div class="pie-chart-wrapper">
              <svg viewBox="0 0 200 200" class="pie-chart">
                <circle
                  v-for="(category, index) in pieData"
                  :key="index"
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  :stroke="category.color"
                  stroke-width="40"
                  :stroke-dasharray="category.dashArray"
                  :stroke-dashoffset="category.dashOffset"
                  class="pie-segment"
                  :class="{ 'pie-segment-hover': hoveredPie === index }"
                  @mouseenter="hoveredPie = index"
                  @mouseleave="hoveredPie = null"
                  @click="selectCategory(index)"
                />
                <!-- Center circle for donut effect -->
                <circle cx="100" cy="100" r="60" fill="var(--glass-bg, rgba(255,255,255,0.7))" />
              </svg>
              
              <!-- Center content -->
              <div class="pie-center">
                <AnimatedCounter 
                  :value="totalCategoryTasks" 
                  :size="'lg'"
                  color="primary"
                />
                <span class="pie-center-label">总计</span>
              </div>
            </div>
            
            <!-- 图例 -->
            <div class="pie-legend">
              <div
                v-for="(category, index) in pieData"
                :key="index"
                class="legend-item"
                :class="{ 'legend-item-active': hoveredPie === index || selectedCategory === index }"
                @mouseenter="hoveredPie = index"
                @mouseleave="hoveredPie = null"
                @click="selectCategory(index)"
              >
                <div class="legend-color" :style="{ backgroundColor: category.color }"></div>
                <span class="legend-name">{{ category.name }}</span>
                <span class="legend-value">{{ category.percentage }}%</span>
                <div class="legend-bar">
                  <div 
                    class="legend-bar-fill"
                    :style="{ 
                      width: category.percentage + '%',
                      backgroundColor: category.color 
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 专注效率 -->
        <div class="border-t border-white/20 pt-6 mb-8">
          <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span class="text-xl">⚡</span>
            <span class="text-rainbow">专注效率</span>
          </h3>
          <div class="grid md:grid-cols-3 gap-4">
            <div class="efficiency-card group">
              <div class="efficiency-icon">⏱️</div>
              <AnimatedCounter 
                :value="stats.avgSessionLength" 
                :size="'lg'"
                color="primary"
                :suffix="'min'"
              />
              <div class="efficiency-label">平均单次时长</div>
              <div class="efficiency-bar">
                <div 
                  class="efficiency-fill"
                  :style="{ width: Math.min((stats.avgSessionLength / 45) * 100, 100) + '%' }"
                ></div>
              </div>
            </div>
            
            <div class="efficiency-card group">
              <div class="efficiency-icon">🎯</div>
              <AnimatedCounter 
                :value="stats.completionRate" 
                :size="'lg'"
                color="success"
                :suffix="'%'"
              />
              <div class="efficiency-label">任务完成率</div>
              <ProgressRing
                v-model="stats.completionRate"
                :size="80"
                color="success"
                :show-percentage="false"
                :glow="true"
              />
            </div>
            
            <div class="efficiency-card group">
              <div class="efficiency-icon">🏆</div>
              <AnimatedCounter 
                :value="stats.bestDay" 
                :size="'lg'"
                color="warning"
              />
              <div class="efficiency-label">效率最高日</div>
              <div class="best-day-badge">
                <span>🔥</span>
                <span>超越{{ stats.bestDay === '周二' ? '80%' : '70%' }}的用户</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 学习热力图 - 增强版 -->
        <div class="border-t border-white/20 pt-6">
          <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span class="text-xl">📅</span>
            <span class="text-rainbow">学习热力图</span>
          </h3>
          <div class="heatmap-enhanced">
            <!-- 月份和星期标签 -->
            <div class="heatmap-header">
              <div class="heatmap-weekday-labels">
                <span></span>
                <span>周一</span>
                <span></span>
                <span>周三</span>
                <span></span>
                <span>周五</span>
                <span></span>
                <span>周日</span>
              </div>
              <div class="heatmap-month-labels">
                <span v-for="month in heatmapMonths" :key="month">{{ month }}</span>
              </div>
            </div>
            
            <!-- 热力图网格 -->
            <div class="heatmap-grid-enhanced">
              <div class="heatmap-week-row" v-for="(week, weekIndex) in heatmapData" :key="weekIndex">
                <div 
                  v-for="(day, dayIndex) in week" 
                  :key="dayIndex"
                  class="heatmap-cell"
                  :class="['heatmap-cell-' + day.level]"
                  @mouseenter="hoveredHeatmapCell = { week: weekIndex, day: dayIndex }"
                  @mouseleave="hoveredHeatmapCell = null"
                >
                  <div v-if="hoveredHeatmapCell?.week === weekIndex && hoveredHeatmapCell?.day === dayIndex" class="heatmap-tooltip">
                    <div class="tooltip-date">{{ day.date }}</div>
                    <div class="tooltip-minutes">{{ day.minutes }}分钟</div>
                    <div class="tooltip-level">{{ getLevelLabel(day.level) }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 图例 -->
            <div class="heatmap-legend-enhanced">
              <span class="legend-label">少</span>
              <div class="legend-cells">
                <div class="heatmap-cell heatmap-cell-0"></div>
                <div class="heatmap-cell heatmap-cell-1"></div>
                <div class="heatmap-cell heatmap-cell-2"></div>
                <div class="heatmap-cell heatmap-cell-3"></div>
                <div class="heatmap-cell heatmap-cell-4"></div>
              </div>
              <span class="legend-label">多</span>
            </div>
            
            <!-- 统计摘要 -->
            <div class="heatmap-summary">
              <div class="summary-item">
                <span class="summary-value">{{ totalActiveDays }}</span>
                <span class="summary-label">活跃天数</span>
              </div>
              <div class="summary-item">
                <span class="summary-value">{{ totalMinutes }}</span>
                <span class="summary-label">总分钟数</span>
              </div>
              <div class="summary-item">
                <span class="summary-value">{{ avgMinutes }}</span>
                <span class="summary-label">日均分钟</span>
              </div>
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
import AnimatedCounter from '../components/AnimatedCounter.vue'
import ProgressRing from '../components/ProgressRing.vue'

const activePeriod = ref('week')
const tasks = ref([])
const pieRotation = ref(0)
const isLoading = ref(true)
const isDarkMode = ref(false)
const hoveredBar = ref(null)
const hoveredPie = ref(null)
const selectedCategory = ref(null)
const hoveredHeatmapCell = ref(null)

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
  
  // 最佳学习日
  const bestDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const today = new Date()
  const dayOfWeek = today.getDay()
  const bestDay = bestDays[(dayOfWeek + 2) % 7] // 随机选取一个较好的日子

  return {
    tasks: completedTasks,
    focusHours: (totalMinutes / 60).toFixed(1),
    checkins: checkinDays,
    points,
    avgSessionLength: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
    completionRate,
    bestDay
  }
})

// 总任务数
const totalCategoryTasks = computed(() => {
  return tasks.value.filter(t => t.category).length
})

// 柱状图颜色
const getBarColor = (index) => {
  const colors = [
    'from-orange-400 to-orange-500',
    'from-orange-500 to-pink-500',
    'from-pink-400 to-pink-500',
    'from-purple-400 to-purple-500',
    'from-blue-400 to-blue-500',
    'from-green-400 to-green-500',
    'from-yellow-400 to-yellow-500'
  ];
  return colors[index % colors.length];
}

// 选择分类
const selectCategory = (index) => {
  if (selectedCategory.value === index) {
    selectedCategory.value = null
  } else {
    selectedCategory.value = index
  }
}

// 热力图等级标签
const getLevelLabel = (level) => {
  const labels = ['无', '轻度', '中度', '重度', '超神']
  return labels[level] || '未知'
}

// 热力图统计数据
const totalActiveDays = computed(() => {
  return heatmapData.value.reduce((sum, week) => {
    return sum + week.filter(day => day.level > 0).length
  }, 0)
})

const totalMinutes = computed(() => {
  return heatmapData.value.reduce((sum, week) => {
    return sum + week.reduce((weekSum, day) => weekSum + day.minutes, 0)
  }, 0)
})

const avgMinutes = computed(() => {
  const days = totalActiveDays.value || 1
  return Math.round(totalMinutes.value / days)
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
/* ========== 增强版统计卡片 ========== */
.stat-card-enhanced {
  @apply relative overflow-hidden p-6 rounded-2xl text-center transition-all duration-300;
  @apply bg-gradient-to-br from-white/40 to-white/20 dark:from-white/10 dark:to-white/5;
  @apply border border-white/30 dark:border-white/10;
  @apply hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-1;
}

.stat-icon-wrapper {
  @apply w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center;
  @apply transition-transform duration-300 group-hover:scale-110;
}

.stat-icon {
  @apply text-3xl;
}

.stat-value {
  @apply block text-3xl font-bold text-orange-600 dark:text-orange-400;
}

.stat-label {
  @apply block text-sm text-gray-600 dark:text-gray-400 mt-1;
}

.stat-trend {
  @apply absolute top-4 right-4 flex items-center gap-1 text-xs px-2 py-1 rounded-lg;
}

.trend-up {
  @apply bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400;
}

.trend-down {
  @apply bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400;
}

/* ========== 动画柱状图 ========== */
.bar-chart-container {
  @apply relative pl-12 pr-4 py-4;
}

.bar-chart-y-axis {
  @apply absolute left-0 top-4 bottom-4 flex flex-col justify-between text-xs text-gray-500;
  @apply text-right pr-2;
}

.bar-chart {
  @apply flex items-end justify-between gap-3 h-48;
}

.bar-item {
  @apply flex-1 flex flex-col items-center;
}

.bar-wrapper {
  @apply w-full h-40 flex items-end justify-center;
}

.bar-fill {
  @apply w-full rounded-t-lg transition-all duration-500 ease-out;
  @apply hover:opacity-90 hover:shadow-lg;
}

.bar-fill.animate-grow {
  animation: bar-grow 0.8s ease-out forwards;
}

@keyframes bar-grow {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}

.bar-label {
  @apply text-xs text-gray-600 dark:text-gray-400 mt-2;
}

.bar-tooltip {
  @apply absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10;
}

.tooltip-content {
  @apply bg-gray-800 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg;
  @apply shadow-lg whitespace-nowrap;
}

.tooltip-day {
  @apply block font-medium;
}

.tooltip-value {
  @apply block text-gray-400;
}

/* ========== 交互式饼图 ========== */
.pie-chart-wrapper {
  @apply relative;
}

.pie-chart {
  @apply w-56 h-56;
}

.pie-segment {
  @apply transition-all duration-300 cursor-pointer;
  transform-origin: center;
}

.pie-segment:hover {
  @apply opacity-80;
  transform: scale(1.02);
}

.pie-center {
  @apply absolute inset-0 flex flex-col items-center justify-center;
  @apply pointer-events-none;
}

.pie-center-label {
  @apply text-xs text-gray-500 dark:text-gray-400 mt-1;
}

.pie-legend {
  @apply flex-1 min-w-[200px] space-y-3;
}

.legend-item {
  @apply flex items-center gap-3 p-3 rounded-xl cursor-pointer;
  @apply bg-white/20 dark:bg-white/5;
  @apply transition-all duration-200;
  @apply hover:bg-white/40 dark:hover:bg-white/10;
}

.legend-item-active {
  @apply ring-2 ring-orange-400 dark:ring-orange-500;
}

.legend-color {
  @apply w-4 h-4 rounded-full;
}

.legend-name {
  @apply flex-1 text-sm text-gray-700 dark:text-gray-300;
}

.legend-value {
  @apply text-sm font-bold text-orange-600 dark:text-orange-400;
}

.legend-bar {
  @apply w-16 h-2 bg-white/30 dark:bg-white/10 rounded-full overflow-hidden;
}

.legend-bar-fill {
  @apply h-full rounded-full transition-all duration-500;
}

/* ========== 专注效率卡片 ========== */
.efficiency-card {
  @apply relative p-6 rounded-2xl text-center;
  @apply bg-gradient-to-br from-white/40 to-white/20 dark:from-white/10 dark:to-white/5;
  @apply border border-white/30 dark:border-white/10;
  @apply transition-all duration-300;
  @apply hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-1;
}

.efficiency-icon {
  @apply text-3xl mb-2;
}

.efficiency-label {
  @apply text-sm text-gray-600 dark:text-gray-400 mt-2;
}

.efficiency-bar {
  @apply w-full h-2 bg-white/30 dark:bg-white/10 rounded-full overflow-hidden mt-3;
}

.efficiency-fill {
  @apply h-full bg-gradient-to-r from-orange-400 to-pink-500 rounded-full transition-all duration-1000;
}

.best-day-badge {
  @apply inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full;
  @apply bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm;
}

/* ========== 增强版热力图 ========== */
.heatmap-enhanced {
  @apply relative;
}

.heatmap-header {
  @apply mb-2;
}

.heatmap-weekday-labels {
  @apply flex justify-between px-12 text-xs text-gray-500;
}

.heatmap-month-labels {
  @apply flex justify-between px-12 text-xs text-gray-500 mt-1;
}

.heatmap-grid-enhanced {
  @apply flex flex-col gap-1;
}

.heatmap-week-row {
  @apply flex gap-1 justify-center;
}

.heatmap-cell {
  @apply w-8 h-8 rounded-md cursor-pointer relative;
  @apply transition-all duration-150;
}

.heatmap-cell:hover {
  @apply ring-2 ring-orange-400 dark:ring-orange-500 scale-110 z-10;
}

.heatmap-cell-0 {
  @apply bg-gray-200 dark:bg-gray-700;
}

.heatmap-cell-1 {
  @apply bg-green-200 dark:bg-green-900;
}

.heatmap-cell-2 {
  @apply bg-green-400 dark:bg-green-700;
}

.heatmap-cell-3 {
  @apply bg-green-600 dark:bg-green-500;
}

.heatmap-cell-4 {
  @apply bg-orange-500 dark:bg-orange-400;
}

.heatmap-tooltip {
  @apply absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20;
}

.heatmap-tooltip .tooltip-date {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.heatmap-tooltip .tooltip-minutes {
  @apply font-bold text-gray-800 dark:text-gray-200;
}

.heatmap-tooltip .tooltip-level {
  @apply text-xs text-green-600 dark:text-green-400;
}

.heatmap-legend-enhanced {
  @apply flex items-center justify-end gap-3 mt-4;
}

.heatmap-legend-enhanced .legend-label {
  @apply text-xs text-gray-500;
}

.heatmap-legend-enhanced .legend-cells {
  @apply flex gap-1;
}

.heatmap-summary {
  @apply grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/20;
}

.summary-item {
  @apply text-center;
}

.summary-value {
  @apply block text-2xl font-bold text-orange-600 dark:text-orange-400;
}

.summary-label {
  @apply block text-xs text-gray-500 dark:text-gray-400;
}

/* ========== 热力图原有样式 ========== */
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

/* ========== 对比箭头样式 ========== */
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

/* ========== 页面过渡动画 ========== */
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

/* ========== 响应式调整 ========== */
@media (max-width: 768px) {
  .stat-card-enhanced {
    @apply p-4;
  }
  
  .stat-value {
    @apply text-2xl;
  }
  
  .bar-chart {
    @apply h-36;
  }
  
  .bar-wrapper {
    @apply h-32;
  }
  
  .pie-chart-wrapper {
    @apply w-full flex justify-center;
  }
  
  .pie-legend {
    @apply w-full;
  }
}

@media (max-width: 480px) {
  .heatmap-cell {
    @apply w-6 h-6;
  }
  
  .heatmap-weekday-labels {
    @apply px-8;
    font-size: 10px;
  }
  
  .heatmap-month-labels {
    @apply px-8;
  }
}
</style>
