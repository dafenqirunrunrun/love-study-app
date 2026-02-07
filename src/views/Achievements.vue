<template>
  <div class="max-w-7xl mx-auto">
    <div class="glass-card p-8">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-gray-800">🏆 成就徽章</h2>
        <div class="text-orange-600 font-bold text-lg">
          已解锁 {{ unlockedCount }} / {{ badges.length }}
        </div>
      </div>

      <!-- 进度条 -->
      <div class="mb-8">
        <div class="flex justify-between text-sm text-gray-500 mb-2">
          <span>总进度</span>
          <span>{{ progressPercent }}%</span>
        </div>
        <div class="h-4 bg-white/30 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>
      </div>

      <!-- 成就网格 -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="badge in badges"
          :key="badge.id"
          class="relative p-6 bg-white/30 backdrop-blur-sm rounded-2xl text-center transition-all hover:bg-white/40"
          :class="isUnlocked(badge.id) ? '' : 'opacity-50 grayscale'"
        >
          <!-- 已解锁标记 -->
          <div
            v-if="isUnlocked(badge.id)"
            class="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm shadow-lg z-10"
          >
            ✓
          </div>

          <!-- 图标 -->
          <div class="text-5xl mb-3 transition-transform hover:scale-110">
            {{ badge.icon }}
          </div>

          <!-- 名称 -->
          <h3 class="font-bold text-gray-800 mb-1">{{ badge.name }}</h3>

          <!-- 描述 -->
          <p class="text-sm text-gray-500 mb-3">{{ badge.description }}</p>

          <!-- 进度 -->
          <div v-if="!isUnlocked(badge.id) && badge.progress" class="mt-2">
            <div class="flex justify-between text-xs text-gray-500 mb-1">
              <span>进度</span>
              <span>{{ badge.progress.current }}/{{ badge.progress.target }}</span>
            </div>
            <div class="h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                class="h-full bg-orange-500 rounded-full transition-all"
                :style="{ width: badge.progress.percent + '%' }"
              ></div>
            </div>
          </div>

          <!-- 已解锁时间 -->
          <div v-if="isUnlocked(badge.id)" class="text-xs text-green-600 font-medium mt-2">
            {{ badge.unlockedAt }}
          </div>
        </div>
      </div>

      <!-- 成就说明 -->
      <div class="border-t border-white/20 pt-6 mt-8">
        <h3 class="text-lg font-bold text-gray-700 mb-4">🎯 如何解锁成就</h3>
        <div class="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div class="flex items-start gap-3 p-3 bg-white/30 rounded-xl">
            <span class="text-2xl">📝</span>
            <div>
              <div class="font-medium text-gray-800">完成任务</div>
              <div>每完成一个任务可获得10积分</div>
            </div>
          </div>
          <div class="flex items-start gap-3 p-3 bg-white/30 rounded-xl">
            <span class="text-2xl">⏱️</span>
            <div>
              <div class="font-medium text-gray-800">番茄专注</div>
              <div>每完成一次25分钟专注获得5积分</div>
            </div>
          </div>
          <div class="flex items-start gap-3 p-3 bg-white/30 rounded-xl">
            <span class="text-2xl">📅</span>
            <div>
              <div class="font-medium text-gray-800">每日打卡</div>
              <div>每次习惯打卡可获得5积分</div>
            </div>
          </div>
          <div class="flex items-start gap-3 p-3 bg-white/30 rounded-xl">
            <span class="text-2xl">💰</span>
            <div>
              <div class="font-medium text-gray-800">积分兑换</div>
              <div>用积分兑换各种奖励</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const tasks = ref([])
const lovePoints = ref(0)

const badges = ref([
  { 
    id: 'first_task', 
    name: '初学者', 
    icon: '🌟', 
    description: '完成第一个任务',
    progress: computed(() => ({ current: tasks.value.filter(t => t.completed).length, target: 1, percent: Math.min(100, tasks.value.filter(t => t.completed).length * 100) }))
  },
  { 
    id: 'task_10', 
    name: '勤奋小蜜蜂', 
    icon: '🐝', 
    description: '完成10个任务',
    progress: computed(() => ({ current: tasks.value.filter(t => t.completed).length, target: 10, percent: Math.min(100, tasks.value.filter(t => t.completed).length * 10) }))
  },
  { 
    id: 'task_50', 
    name: '学习达人', 
    icon: '🎓', 
    description: '完成50个任务',
    progress: computed(() => ({ current: tasks.value.filter(t => t.completed).length, target: 50, percent: Math.min(100, tasks.value.filter(t => t.completed).length * 2) }))
  },
  { 
    id: 'focus_1', 
    name: '初次专注', 
    icon: '⏱️', 
    description: '完成1次番茄钟'
  },
  { 
    id: 'focus_10', 
    name: '专注大师', 
    icon: '🎯', 
    description: '完成10次番茄钟'
  },
  { 
    id: 'focus_50', 
    name: '时间管理', 
    icon: '⚡', 
    description: '完成50次番茄钟'
  },
  { 
    id: 'checkin_7', 
    name: '一周坚持', 
    icon: '📅', 
    description: '连续打卡7天'
  },
  { 
    id: 'checkin_30', 
    name: '月度之星', 
    icon: '🌙', 
    description: '连续打卡30天'
  },
  { 
    id: 'points_100', 
    name: '小小富豪', 
    icon: '💰', 
    description: '获得100积分'
  },
  { 
    id: 'points_500', 
    name: '恋爱富豪', 
    icon: '💎', 
    description: '获得500积分'
  },
  { 
    id: 'hours_10', 
    name: '十小时', 
    icon: '⏰', 
    description: '累计专注10小时'
  },
  { 
    id: 'hours_50', 
    name: '五十小时', 
    icon: '🏃', 
    description: '累计专注50小时'
  }
])

const unlockedCount = computed(() => {
  return badges.value.filter(b => isUnlocked(b.id)).length
})

const progressPercent = computed(() => {
  return Math.round((unlockedCount.value / badges.value.length) * 100)
})

const isUnlocked = (badgeId) => {
  const saved = localStorage.getItem('unlockedBadges')
  if (saved) {
    const unlocked = JSON.parse(saved)
    return unlocked.includes(badgeId)
  }
  
  // 根据当前数据判断
  const completedTasks = tasks.value.filter(t => t.completed).length
  const points = lovePoints.value
  
  switch (badgeId) {
    case 'first_task': return completedTasks >= 1
    case 'task_10': return completedTasks >= 10
    case 'task_50': return completedTasks >= 50
    case 'points_100': return points >= 100
    case 'points_500': return points >= 500
    default: return false
  }
}

const loadData = () => {
  try {
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) tasks.value = JSON.parse(savedTasks)
    
    const savedPoints = localStorage.getItem('lovePoints')
    if (savedPoints) lovePoints.value = parseInt(savedPoints)
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

// 初始化
loadData()
</script>
