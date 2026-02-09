<template>
  <div class="max-w-7xl mx-auto">
    <!-- 骨架屏加载状态 -->
    <template v-if="isLoading">
      <div class="glass-card p-8">
        <div class="flex items-center justify-between mb-8">
          <div class="skeleton-pulse rounded h-8 w-48" :class="isDarkMode ? 'bg-white/20' : 'bg-white/40'"></div>
          <div class="skeleton-pulse rounded-xl px-6 py-2" :class="isDarkMode ? 'bg-white/15' : 'bg-white/30'"></div>
        </div>
        <div class="mb-8">
          <div class="skeleton-pulse rounded-full h-4 mb-2" :class="isDarkMode ? 'bg-white/15' : 'bg-white/30'"></div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div 
            v-for="i in 12" 
            :key="i"
            class="rounded-2xl p-6 text-center"
            :class="isDarkMode ? 'bg-white/10' : 'bg-white/30'"
          >
            <div 
              class="skeleton-pulse rounded-full mx-auto mb-3"
              :class="isDarkMode ? 'bg-white/20' : 'bg-white/40'"
              style="width: 4rem; height: 4rem;"
            ></div>
            <div 
              class="skeleton-pulse rounded h-5 mb-1 mx-auto"
              :class="isDarkMode ? 'bg-white/20' : 'bg-white/40'"
              style="width: 80%"
            ></div>
            <div 
              class="skeleton-pulse rounded h-3 mx-auto"
              :class="isDarkMode ? 'bg-white/15' : 'bg-white/30'"
              style="width: 60%"
            ></div>
          </div>
        </div>
      </div>
    </template>

    <!-- 真实内容 -->
    <template v-else>
      <div class="glass-card p-8">
        <!-- 标题栏 -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span class="text-3xl animate-bounce-soft">🏆</span>
            <span class="text-rainbow">成就徽章</span>
          </h2>
          <div class="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl">
            <span class="text-2xl">⭐</span>
            <span class="text-xl font-bold text-orange-600">{{ unlockedCount }} / {{ badges.length }}</span>
          </div>
        </div>

        <!-- 进度条 -->
        <div class="mb-8 relative">
          <div class="flex justify-between text-sm text-gray-500 mb-2">
            <span>总进度</span>
            <span class="text-orange-600 font-bold">{{ progressPercent }}%</span>
          </div>
          <div class="h-4 bg-white/30 rounded-full overflow-hidden relative">
            <div
              class="h-full bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 rounded-full transition-all duration-1000"
              :style="{ width: progressPercent + '%' }"
              :class="{ 'animate-shimmer': progressPercent < 100 }"
            ></div>
          </div>
          <div class="text-center mt-2 text-sm text-gray-500">
            {{ remainingCount }} 个成就待解锁
          </div>
        </div>

        <!-- 成就网格 -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <div
            v-for="(badge, index) in badges"
            :key="badge.id"
            class="group relative p-6 bg-white/30 backdrop-blur-sm rounded-2xl text-center transition-all duration-300 hover:bg-white/50 hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-2"
            :class="isUnlocked(badge.id) ? '' : 'opacity-60 grayscale'"
          >
            <!-- 解锁动画效果 -->
            <div v-if="isUnlocked(badge.id)" 
                 class="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
            ></div>
            
            <!-- 已解锁标记 -->
            <div
              v-if="isUnlocked(badge.id)"
              class="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg z-10 animate-bounce-soft"
            >
              <span class="text-lg">✓</span>
            </div>

            <!-- 图标 -->
            <div 
              class="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              :class="isUnlocked(badge.id) ? '' : 'opacity-50'"
            >
              <!-- 发光效果 -->
              <div v-if="isUnlocked(badge.id)" 
                   class="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 blur-lg opacity-30 animate-pulse"
              ></div>
              <div class="text-5xl relative z-10">{{ badge.icon }}</div>
            </div>

            <!-- 名称 -->
            <h3 
              class="font-bold text-gray-800 mb-1 transition-all"
              :class="isUnlocked(badge.id) ? '' : 'opacity-50'"
            >
              {{ badge.name }}
            </h3>

            <!-- 描述 -->
            <p 
              class="text-sm text-gray-500 mb-3 transition-all"
              :class="isUnlocked(badge.id) ? '' : 'opacity-50'"
            >
              {{ badge.description }}
            </p>

            <!-- 进度条 -->
            <div v-if="!isUnlocked(badge.id) && badge.progress" class="mt-2">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>进度</span>
                <span>{{ badge.progress.current }}/{{ badge.progress.target }}</span>
              </div>
              <div class="h-2 bg-white/30 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-orange-400 to-pink-500 rounded-full transition-all duration-500"
                  :style="{ width: badge.progress.percent + '%' }"
                ></div>
              </div>
            </div>

            <!-- 已解锁时间 -->
            <div v-if="isUnlocked(badge.id)" class="text-xs text-green-600 font-medium mt-2 flex items-center justify-center gap-1">
              <span>📅</span>
              <span>{{ badge.unlockedAt }}</span>
            </div>
          </div>
        </div>

        <!-- 成就统计 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="p-4 bg-white/30 backdrop-blur-sm rounded-2xl text-center hover:bg-white/50 transition-all">
            <div class="text-3xl mb-2">📝</div>
            <div class="text-2xl font-bold text-orange-600">{{ completedTasks }}</div>
            <div class="text-sm text-gray-500">完成任务</div>
          </div>
          <div class="p-4 bg-white/30 backdrop-blur-sm rounded-2xl text-center hover:bg-white/50 transition-all">
            <div class="text-3xl mb-2">⏱️</div>
            <div class="text-2xl font-bold text-blue-600">{{ totalFocusSessions }}</div>
            <div class="text-sm text-gray-500">专注次数</div>
          </div>
          <div class="p-4 bg-white/30 backdrop-blur-sm rounded-2xl text-center hover:bg-white/50 transition-all">
            <div class="text-3xl mb-2">🔥</div>
            <div class="text-2xl font-bold text-green-600">{{ maxStreak }}</div>
            <div class="text-sm text-gray-500">最长连续</div>
          </div>
          <div class="p-4 bg-white/30 backdrop-blur-sm rounded-2xl text-center hover:bg-white/50 transition-all">
            <div class="text-3xl mb-2">💎</div>
            <div class="text-2xl font-bold text-purple-600">{{ totalPoints }}</div>
            <div class="text-sm text-gray-500">获得积分</div>
          </div>
        </div>

        <!-- 成就说明 -->
        <div class="border-t border-white/20 pt-6">
          <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span class="text-2xl">🎯</span>
            <span class="text-rainbow">如何解锁成就</span>
          </h3>
          <div class="grid md:grid-cols-2 gap-4 text-sm">
            <div class="flex items-start gap-3 p-4 bg-white/30 backdrop-blur-sm rounded-xl hover:bg-white/50 transition-all">
              <div class="w-10 h-10 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">📝</div>
              <div>
                <div class="font-medium text-gray-800 mb-1">完成任务</div>
                <div class="text-gray-600">每完成一个任务可获得10积分，完成指定数量可解锁对应成就</div>
              </div>
            </div>
            <div class="flex items-start gap-3 p-4 bg-white/30 backdrop-blur-sm rounded-xl hover:bg-white/50 transition-all">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">⏱️</div>
              <div>
                <div class="font-medium text-gray-800 mb-1">番茄专注</div>
                <div class="text-gray-600">每完成一次专注可获得5积分，累计专注解锁成就</div>
              </div>
            </div>
            <div class="flex items-start gap-3 p-4 bg-white/30 backdrop-blur-sm rounded-xl hover:bg-white/50 transition-all">
              <div class="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">📅</div>
              <div>
                <div class="font-medium text-gray-800 mb-1">每日打卡</div>
                <div class="text-gray-600">每天完成习惯打卡可获得5积分，连续打卡解锁成就</div>
              </div>
            </div>
            <div class="flex items-start gap-3 p-4 bg-white/30 backdrop-blur-sm rounded-xl hover:bg-white/50 transition-all">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">💰</div>
              <div>
                <div class="font-medium text-gray-800 mb-1">积分成就</div>
                <div class="text-gray-600">累计获得积分达到指定数量，解锁专属成就徽章</div>
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

const tasks = ref([])
const habits = ref([])
const focusHistory = ref({})
const lovePoints = ref(0)
const isLoading = ref(true)
const isDarkMode = ref(false)

// 成就定义
const badges = ref([
  // 任务成就
  { 
    id: 'first_task', 
    name: '初学者', 
    icon: '🌟', 
    description: '完成第一个任务',
    category: 'task',
    progress: computed(() => ({ current: Math.min(1, tasks.value.filter(t => t.completed).length), target: 1, percent: Math.min(100, tasks.value.filter(t => t.completed).length * 100) }))
  },
  { 
    id: 'task_10', 
    name: '勤奋小蜜蜂', 
    icon: '🐝', 
    description: '完成10个任务',
    category: 'task',
    progress: computed(() => ({ current: tasks.value.filter(t => t.completed).length, target: 10, percent: Math.min(100, tasks.value.filter(t => t.completed).length * 10) }))
  },
  { 
    id: 'task_50', 
    name: '学习达人', 
    icon: '🎓', 
    description: '完成50个任务',
    category: 'task',
    progress: computed(() => ({ current: tasks.value.filter(t => t.completed).length, target: 50, percent: Math.min(100, tasks.value.filter(t => t.completed).length * 2) }))
  },
  { 
    id: 'task_100', 
    name: '任务大师', 
    icon: '👑', 
    description: '完成100个任务',
    category: 'task',
    progress: computed(() => ({ current: tasks.value.filter(t => t.completed).length, target: 100, percent: Math.min(100, tasks.value.filter(t => t.completed).length) }))
  },
  { 
    id: 'task_200', 
    name: '任务狂人', 
    icon: '🔥', 
    description: '完成200个任务',
    category: 'task',
    progress: computed(() => ({ current: tasks.value.filter(t => t.completed).length, target: 200, percent: Math.min(100, tasks.value.filter(t => t.completed).length / 2) }))
  },
  { 
    id: 'task_500', 
    name: '任务传奇', 
    icon: '🏆', 
    description: '完成500个任务',
    category: 'task',
    progress: computed(() => ({ current: tasks.value.filter(t => t.completed).length, target: 500, percent: Math.min(100, tasks.value.filter(t => t.completed).length / 5) }))
  },
  { 
    id: 'task_1000', 
    name: '千锤百炼', 
    icon: '💎', 
    description: '完成1000个任务',
    category: 'task',
    progress: computed(() => ({ current: tasks.value.filter(t => t.completed).length, target: 1000, percent: Math.min(100, tasks.value.filter(t => t.completed).length / 10) }))
  },
  // 专注成就
  { 
    id: 'focus_1', 
    name: '初次专注', 
    icon: '⏱️', 
    description: '完成1次番茄钟',
    category: 'focus',
    progress: computed(() => {
      const sessions = Object.values(focusHistory.value).reduce((sum, day) => sum + (day.sessions || 0), 0)
      return { current: sessions, target: 1, percent: Math.min(100, sessions * 100) }
    })
  },
  { 
    id: 'focus_10', 
    name: '专注大师', 
    icon: '🎯', 
    description: '完成10次番茄钟',
    category: 'focus',
    progress: computed(() => {
      const sessions = Object.values(focusHistory.value).reduce((sum, day) => sum + (day.sessions || 0), 0)
      return { current: sessions, target: 10, percent: Math.min(100, sessions * 10) }
    })
  },
  { 
    id: 'focus_50', 
    name: '时间管理', 
    icon: '⚡', 
    description: '完成50次番茄钟',
    category: 'focus',
    progress: computed(() => {
      const sessions = Object.values(focusHistory.value).reduce((sum, day) => sum + (day.sessions || 0), 0)
      return { current: sessions, target: 50, percent: Math.min(100, sessions * 2) }
    })
  },
  { 
    id: 'hours_10', 
    name: '十小时', 
    icon: '⏰', 
    description: '累计专注10小时',
    category: 'focus',
    progress: computed(() => {
      const minutes = Object.values(focusHistory.value).reduce((sum, day) => sum + (day.minutes || 0), 0)
      return { current: Math.round(minutes / 60), target: 10, percent: Math.min(100, (minutes / 60) * 10) }
    })
  },
  { 
    id: 'focus_100', 
    name: '专注达人', 
    icon: '🎯', 
    description: '完成100次番茄钟',
    category: 'focus',
    progress: computed(() => {
      const sessions = Object.values(focusHistory.value).reduce((sum, day) => sum + (day.sessions || 0), 0)
      return { current: sessions, target: 100, percent: Math.min(100, sessions) }
    })
  },
  { 
    id: 'focus_200', 
    name: '专注大师', 
    icon: '🌟', 
    description: '完成200次番茄钟',
    category: 'focus',
    progress: computed(() => {
      const sessions = Object.values(focusHistory.value).reduce((sum, day) => sum + (day.sessions || 0), 0)
      return { current: sessions, target: 200, percent: Math.min(100, sessions / 2) }
    })
  },
  { 
    id: 'hours_50', 
    name: '五十小时', 
    icon: '⌛', 
    description: '累计专注50小时',
    category: 'focus',
    progress: computed(() => {
      const minutes = Object.values(focusHistory.value).reduce((sum, day) => sum + (day.minutes || 0), 0)
      return { current: Math.round(minutes / 60), target: 50, percent: Math.min(100, (minutes / 60) * 2) }
    })
  },
  { 
    id: 'hours_100', 
    name: '百小时', 
    icon: '💪', 
    description: '累计专注100小时',
    category: 'focus',
    progress: computed(() => {
      const minutes = Object.values(focusHistory.value).reduce((sum, day) => sum + (day.minutes || 0), 0)
      return { current: Math.round(minutes / 60), target: 100, percent: Math.min(100, (minutes / 60)) }
    })
  },
  { 
    id: 'hours_500', 
    name: '五百小时', 
    icon: '🏅', 
    description: '累计专注500小时',
    category: 'focus',
    progress: computed(() => {
      const minutes = Object.values(focusHistory.value).reduce((sum, day) => sum + (day.minutes || 0), 0)
      return { current: Math.round(minutes / 60), target: 500, percent: Math.min(100, (minutes / 60) / 5) }
    })
  },
  // 打卡成就
  { 
    id: 'checkin_3', 
    name: '三天打鱼', 
    icon: '🐟', 
    description: '连续打卡3天',
    category: 'checkin',
    progress: computed(() => ({ current: currentStreak.value >= 3 ? 3 : currentStreak.value, target: 3, percent: Math.min(100, (currentStreak.value / 3) * 100) }))
  },
  { 
    id: 'checkin_7', 
    name: '一周坚持', 
    icon: '📅', 
    description: '连续打卡7天',
    category: 'checkin',
    progress: computed(() => ({ current: currentStreak.value, target: 7, percent: Math.min(100, (currentStreak.value / 7) * 100) }))
  },
  { 
    id: 'checkin_30', 
    name: '月度之星', 
    icon: '🌙', 
    description: '连续打卡30天',
    category: 'checkin',
    progress: computed(() => ({ current: currentStreak.value, target: 30, percent: Math.min(100, (currentStreak.value / 30) * 100) }))
  },
  { 
    id: 'checkin_14', 
    name: '两周坚持', 
    icon: '📆', 
    description: '连续打卡14天',
    category: 'checkin',
    progress: computed(() => ({ current: currentStreak.value, target: 14, percent: Math.min(100, (currentStreak.value / 14) * 100) }))
  },
  { 
    id: 'checkin_60', 
    name: '双月坚持', 
    icon: '🏃', 
    description: '连续打卡60天',
    category: 'checkin',
    progress: computed(() => ({ current: currentStreak.value, target: 60, percent: Math.min(100, (currentStreak.value / 60) * 100) }))
  },
  { 
    id: 'checkin_100', 
    name: '百日坚持', 
    icon: '🎖️', 
    description: '连续打卡100天',
    category: 'checkin',
    progress: computed(() => ({ current: currentStreak.value, target: 100, percent: Math.min(100, (currentStreak.value / 100) * 100) }))
  },
  { 
    id: 'checkin_365', 
    name: '全年无休', 
    icon: '🌟', 
    description: '连续打卡365天',
    category: 'checkin',
    progress: computed(() => ({ current: currentStreak.value, target: 365, percent: Math.min(100, (currentStreak.value / 365) * 100) }))
  },
  // 积分成就
  { 
    id: 'points_100', 
    name: '小小富豪', 
    icon: '💰', 
    description: '获得100积分',
    category: 'points',
    progress: computed(() => ({ current: totalPoints.value, target: 100, percent: Math.min(100, totalPoints.value) }))
  },
  { 
    id: 'points_500', 
    name: '恋爱富豪', 
    icon: '💎', 
    description: '获得500积分',
    category: 'points',
    progress: computed(() => ({ current: totalPoints.value, target: 500, percent: Math.min(100, totalPoints.value / 5) }))
  },
  { 
    id: 'points_1000', 
    name: '千分达人', 
    icon: '🏅', 
    description: '获得1000积分',
    category: 'points',
    progress: computed(() => ({ current: totalPoints.value, target: 1000, percent: Math.min(100, totalPoints.value / 10) }))
  },
  { 
    id: 'points_2000', 
    name: '两千分王', 
    icon: '👑', 
    description: '获得2000积分',
    category: 'points',
    progress: computed(() => ({ current: totalPoints.value, target: 2000, percent: Math.min(100, totalPoints.value / 20) }))
  },
  { 
    id: 'points_5000', 
    name: '五千分帝', 
    icon: '💎', 
    description: '获得5000积分',
    category: 'points',
    progress: computed(() => ({ current: totalPoints.value, target: 5000, percent: Math.min(100, totalPoints.value / 50) }))
  },
  { 
    id: 'points_10000', 
    name: '万分传奇', 
    icon: '🏆', 
    description: '获得10000积分',
    category: 'points',
    progress: computed(() => ({ current: totalPoints.value, target: 10000, percent: Math.min(100, totalPoints.value / 100) }))
  },
  // 心得成就
  { 
    id: 'journal_1', 
    name: '心得初体验', 
    icon: '✍️', 
    description: '撰写第一篇学习心得',
    category: 'journal',
    progress: computed(() => {
      const journals = JSON.parse(localStorage.getItem('dailyJournal') || '[]')
      return { current: journals.length, target: 1, percent: Math.min(100, journals.length * 100) }
    })
  },
  { 
    id: 'journal_10', 
    name: '十篇心得', 
    icon: '📝', 
    description: '撰写10篇学习心得',
    category: 'journal',
    progress: computed(() => {
      const journals = JSON.parse(localStorage.getItem('dailyJournal') || '[]')
      return { current: journals.length, target: 10, percent: Math.min(100, journals.length * 10) }
    })
  },
  { 
    id: 'journal_30', 
    name: '三十篇心得', 
    icon: '📚', 
    description: '撰写30篇学习心得',
    category: 'journal',
    progress: computed(() => {
      const journals = JSON.parse(localStorage.getItem('dailyJournal') || '[]')
      return { current: journals.length, target: 30, percent: Math.min(100, journals.length * 3.33) }
    })
  },
  // 里程碑成就
  { 
    id: 'total_days_7', 
    name: '第一周', 
    icon: '🗓️', 
    description: '累计学习7天',
    category: 'milestone',
    progress: computed(() => {
      const stats = JSON.parse(localStorage.getItem('learningStats') || '{"totalDays":0}')
      return { current: stats.totalDays || 0, target: 7, percent: Math.min(100, ((stats.totalDays || 0) / 7) * 100) }
    })
  },
  { 
    id: 'total_days_30', 
    name: '月度学习者', 
    icon: '📅', 
    description: '累计学习30天',
    category: 'milestone',
    progress: computed(() => {
      const stats = JSON.parse(localStorage.getItem('learningStats') || '{"totalDays":0}')
      return { current: stats.totalDays || 0, target: 30, percent: Math.min(100, ((stats.totalDays || 0) / 30) * 100) }
    })
  },
  { 
    id: 'total_days_100', 
    name: '百日学习', 
    icon: '💯', 
    description: '累计学习100天',
    category: 'milestone',
    progress: computed(() => {
      const stats = JSON.parse(localStorage.getItem('learningStats') || '{"totalDays":0}')
      return { current: stats.totalDays || 0, target: 100, percent: Math.min(100, ((stats.totalDays || 0) / 100) * 100) }
    })
  },
  { 
    id: 'total_days_365', 
    name: '全年学习', 
    icon: '🎯', 
    description: '累计学习365天',
    category: 'milestone',
    progress: computed(() => {
      const stats = JSON.parse(localStorage.getItem('learningStats') || '{"totalDays":0}')
      return { current: stats.totalDays || 0, target: 365, percent: Math.min(100, ((stats.totalDays || 0) / 365) * 100) }
    })
  },
  // 习惯完美成就
  { 
    id: 'habit_perfect_week', 
    name: '完美一周', 
    icon: '✨', 
    description: '一周内每天完成所有习惯',
    category: 'habit',
    progress: computed(() => ({ current: perfectWeekCount.value, target: 1, percent: Math.min(100, (perfectWeekCount.value || 0) * 100) }))
  },
  { 
    id: 'habit_perfect_month', 
    name: '完美一月', 
    icon: '🌈', 
    description: '一月内每天完成所有习惯',
    category: 'habit',
    progress: computed(() => ({ current: perfectMonthCount.value, target: 1, percent: Math.min(100, (perfectMonthCount.value || 0) * 100) }))
  },
  // 特殊成就
  { 
    id: 'early_bird', 
    name: '早起鸟儿', 
    icon: '🐦', 
    description: '早上6点前完成首个任务',
    category: 'special',
    progress: computed(() => ({ current: earlyBirdCount.value, target: 1, percent: Math.min(100, (earlyBirdCount.value || 0) * 100) }))
  },
  { 
    id: 'night_owl', 
    name: '夜猫子', 
    icon: '🦉', 
    description: '晚上11点后完成首个任务',
    category: 'special',
    progress: computed(() => ({ current: nightOwlCount.value, target: 1, percent: Math.min(100, (nightOwlCount.value || 0) * 100) }))
  },
  { 
    id: 'all_rounder', 
    name: '全能选手', 
    icon: '🌟', 
    description: '解锁所有成就',
    category: 'special',
    progress: computed(() => ({ current: unlockedCount.value, target: badges.value.length, percent: Math.min(100, (unlockedCount.value / badges.value.length) * 100) }))
  }
])

// 计算属性
const completedTasks = computed(() => tasks.value.filter(t => t.completed).length)
const totalFocusSessions = computed(() => {
  return Object.values(focusHistory.value).reduce((sum, day) => sum + (day.sessions || 0), 0)
})
const currentStreak = computed(() => {
  try {
    const checkins = JSON.parse(localStorage.getItem('checkinHistory') || '{}')
    let streak = 0
    for (let i = 0; i < 365; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toDateString()
      if (checkins[dateStr] && checkins[dateStr].total >= 2) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    return streak
  } catch {
    return 0
  }
})
const maxStreak = computed(() => {
  const checkins = JSON.parse(localStorage.getItem('checkinHistory') || '{}')
  let max = 0
  let current = 0
  for (let i = 0; i < 365; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toDateString()
    if (checkins[dateStr] && checkins[dateStr].total >= 2) {
      current++
      max = Math.max(max, current)
    } else {
      current = 0
    }
  }
  return max
})
const totalPoints = computed(() => {
  const pointsHistory = JSON.parse(localStorage.getItem('pointsHistory') || '[]')
  return pointsHistory.reduce((sum, r) => sum + r.points, 0)
})

// 新增成就的计算属性
const perfectWeekCount = computed(() => {
  try {
    const habits = JSON.parse(localStorage.getItem('habits') || '[]')
    const checkins = JSON.parse(localStorage.getItem('checkinHistory') || '{}')
    let count = 0
    for (let week = 0; week < 52; week++) {
      let perfect = true
      for (let day = 0; day < 7; day++) {
        const date = new Date()
        date.setDate(date.getDate() - (week * 7 + day))
        const dateStr = date.toDateString()
        if (!checkins[dateStr] || checkins[dateStr].total < habits.length) {
          perfect = false
          break
        }
      }
      if (perfect && habits.length > 0) count++
    }
    return count
  } catch { return 0 }
})

const perfectMonthCount = computed(() => {
  try {
    const habits = JSON.parse(localStorage.getItem('habits') || '[]')
    const checkins = JSON.parse(localStorage.getItem('checkinHistory') || '{}')
    let count = 0
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() - month, 0).getDate()
      let perfect = true
      for (let day = 0; day < daysInMonth; day++) {
        const date = new Date()
        date.setDate(date.getDate() - ((month * 30) + day))
        const dateStr = date.toDateString()
        if (!checkins[dateStr] || checkins[dateStr].total < habits.length) {
          perfect = false
          break
        }
      }
      if (perfect && habits.length > 0) count++
    }
    return count
  } catch { return 0 }
})

const earlyBirdCount = computed(() => {
  try {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    return tasks.filter(t => {
      if (!t.completed || !t.completedAt) return false
      const hour = new Date(t.completedAt).getHours()
      return hour < 6
    }).length
  } catch { return 0 }
})

const nightOwlCount = computed(() => {
  try {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    return tasks.filter(t => {
      if (!t.completed || !t.completedAt) return false
      const hour = new Date(t.completedAt).getHours()
      return hour >= 23
    }).length
  } catch { return 0 }
})

const unlockedCount = computed(() => badges.value.filter(b => isUnlocked(b.id)).length)
const remainingCount = computed(() => badges.value.length - unlockedCount.value)

const progressPercent = computed(() => {
  return Math.round((unlockedCount.value / badges.value.length) * 100)
})

const isUnlocked = (badgeId) => {
  try {
    const saved = localStorage.getItem('unlockedBadges')
    if (saved) {
      const unlocked = JSON.parse(saved)
      if (unlocked.includes(badgeId)) return true
    }
    
    // 根据当前数据动态判断
    const completedTasksCount = tasks.value.filter(t => t.completed).length
    const totalSessions = Object.values(focusHistory.value).reduce((sum, day) => sum + (day.sessions || 0), 0)
    const totalMinutes = Object.values(focusHistory.value).reduce((sum, day) => sum + (day.minutes || 0), 0)
    
    switch (badgeId) {
      case 'first_task': return completedTasksCount >= 1
      case 'task_10': return completedTasksCount >= 10
      case 'task_50': return completedTasksCount >= 50
      case 'task_100': return completedTasksCount >= 100
      case 'task_200': return completedTasksCount >= 200
      case 'task_500': return completedTasksCount >= 500
      case 'task_1000': return completedTasksCount >= 1000
      case 'focus_1': return totalSessions >= 1
      case 'focus_10': return totalSessions >= 10
      case 'focus_50': return totalSessions >= 50
      case 'focus_100': return totalSessions >= 100
      case 'focus_200': return totalSessions >= 200
      case 'hours_10': return totalMinutes >= 600
      case 'hours_50': return totalMinutes >= 3000
      case 'hours_100': return totalMinutes >= 6000
      case 'hours_500': return totalMinutes >= 30000
      case 'checkin_3': return currentStreak.value >= 3
      case 'checkin_7': return currentStreak.value >= 7
      case 'checkin_14': return currentStreak.value >= 14
      case 'checkin_30': return currentStreak.value >= 30
      case 'checkin_60': return currentStreak.value >= 60
      case 'checkin_100': return currentStreak.value >= 100
      case 'checkin_365': return currentStreak.value >= 365
      case 'points_100': return totalPoints.value >= 100
      case 'points_500': return totalPoints.value >= 500
      case 'points_1000': return totalPoints.value >= 1000
      case 'points_2000': return totalPoints.value >= 2000
      case 'points_5000': return totalPoints.value >= 5000
      case 'points_10000': return totalPoints.value >= 10000
      case 'journal_1': {
        const journals = JSON.parse(localStorage.getItem('dailyJournal') || '[]')
        return journals.length >= 1
      }
      case 'journal_10': {
        const journals = JSON.parse(localStorage.getItem('dailyJournal') || '[]')
        return journals.length >= 10
      }
      case 'journal_30': {
        const journals = JSON.parse(localStorage.getItem('dailyJournal') || '[]')
        return journals.length >= 30
      }
      case 'total_days_7': {
        const stats = JSON.parse(localStorage.getItem('learningStats') || '{"totalDays":0}')
        return (stats.totalDays || 0) >= 7
      }
      case 'total_days_30': {
        const stats = JSON.parse(localStorage.getItem('learningStats') || '{"totalDays":0}')
        return (stats.totalDays || 0) >= 30
      }
      case 'total_days_100': {
        const stats = JSON.parse(localStorage.getItem('learningStats') || '{"totalDays":0}')
        return (stats.totalDays || 0) >= 100
      }
      case 'total_days_365': {
        const stats = JSON.parse(localStorage.getItem('learningStats') || '{"totalDays":0}')
        return (stats.totalDays || 0) >= 365
      }
      case 'habit_perfect_week': return perfectWeekCount.value >= 1
      case 'habit_perfect_month': return perfectMonthCount.value >= 1
      case 'early_bird': return earlyBirdCount.value >= 1
      case 'night_owl': return nightOwlCount.value >= 1
      case 'all_rounder': return unlockedCount.value >= badges.value.length
      default: return false
    }
  } catch {
    return false
  }
}

const loadData = () => {
  isLoading.value = true
  
  try {
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) tasks.value = JSON.parse(savedTasks)
    
    const savedFocus = localStorage.getItem('focusHistory')
    if (savedFocus) focusHistory.value = JSON.parse(savedFocus)
    
    const savedPoints = localStorage.getItem('lovePoints')
    if (savedPoints) lovePoints.value = parseInt(savedPoints)
    
    isDarkMode.value = document.documentElement.classList.contains('dark')
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 300)
  }
}

onMounted(loadData)
</script>
