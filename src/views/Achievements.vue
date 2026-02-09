<template>
  <div class="max-w-7xl mx-auto">
    <!-- 成就解锁弹窗 -->
    <Transition name="modal">
      <div v-if="showUnlockModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeUnlockModal"></div>
        <div class="achievement-unlock-modal relative bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full text-center transform scale-100">
          <!-- 彩带背景 -->
          <div class="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div class="confetti-bg"></div>
          </div>
          
          <!-- 关闭按钮 -->
          <button @click="closeUnlockModal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          
          <!-- 成就图标 -->
          <div class="relative w-32 h-32 mx-auto mb-6">
            <!-- 外圈光环 -->
            <div :class="['unlock-ring', `ring-${unlockingBadge?.rarity || 'common'}`]"></div>
            <!-- 内圈 -->
            <div :class="['unlock-icon-bg', `bg-${unlockingBadge?.rarity || 'common'}`]">
              <span class="text-6xl">{{ unlockingBadge?.icon || '🏆' }}</span>
            </div>
          </div>
          
          <!-- 新成就标签 -->
          <div class="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold mb-4">
            <span>✨</span>
            <span>新成就解锁</span>
          </div>
          
          <!-- 成就名称 -->
          <h3 :class="['text-2xl font-bold mb-2', `text-${unlockingBadge?.rarity || 'common'}`]">
            {{ unlockingBadge?.name || '成就名称' }}
          </h3>
          
          <!-- 成就描述 -->
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            {{ unlockingBadge?.description || '成就描述' }}
          </p>
          
          <!-- 稀有度标签 -->
          <div :class="['inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold', `rarity-tag-${unlockingBadge?.rarity || 'common'}`]">
            <span>{{ getRarityLabel(unlockingBadge?.rarity || 'common') }}</span>
          </div>
        </div>
      </div>
    </Transition>

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

        <!-- 稀有度筛选 -->
        <div class="flex flex-wrap gap-2 mb-6">
          <button
            v-for="rarity in ['all', 'legendary', 'epic', 'rare', 'uncommon', 'common']"
            :key="rarity"
            @click="activeRarityFilter = rarity"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
              activeRarityFilter === rarity
                ? getRarityActiveClass(rarity)
                : 'bg-white/30 dark:bg-gray-700/30 text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
            ]"
          >
            {{ rarity === 'all' ? '🏆 全部' : `✨ ${getRarityLabel(rarity)}` }}
          </button>
        </div>

        <!-- 成就网格 -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <div
            v-for="(badge, index) in filteredBadges"
            :key="badge.id"
            @click="showBadgeDetail(badge)"
            class="group relative p-5 rounded-2xl text-center cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-2"
            :class="[
              isUnlocked(badge.id) ? getRarityBgClass(badge.rarity) : 'bg-white/30 dark:bg-gray-800/30 opacity-70 grayscale',
              `rarity-border-${badge.rarity || 'common'}`
            ]"
          >
            <!-- 稀有度边框发光 -->
            <div 
              v-if="isUnlocked(badge.id)"
              :class="['absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500', `rarity-glow-${badge.rarity || 'common'}`]"
            ></div>
            
            <!-- 解锁动画效果 -->
            <div v-if="isUnlocked(badge.id)" 
                 class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                 :class="`rarity-gradient-${badge.rarity || 'common'}`"
            ></div>
            
            <!-- 稀有度标签 -->
            <div 
              v-if="isUnlocked(badge.id)"
              class="absolute -top-2 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold z-10"
              :class="`rarity-tag-${badge.rarity || 'common'}`"
            >
              {{ getRarityLabel(badge.rarity || 'common') }}
            </div>

            <!-- 已解锁标记 -->
            <div
              v-if="isUnlocked(badge.id)"
              class="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow-lg z-10"
              :class="`rarity-check-${badge.rarity || 'common'}`"
            >
              ✓
            </div>

            <!-- 图标 -->
            <div 
              class="relative w-16 h-16 mx-auto mb-3 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
              :class="isUnlocked(badge.id) ? '' : 'opacity-50'"
            >
              <!-- 发光效果 -->
              <div 
                v-if="isUnlocked(badge.id)" 
                :class="['absolute inset-0 rounded-full blur-xl opacity-50 animate-pulse', `rarity-glow-bg-${badge.rarity || 'common'}`]"
              ></div>
              <div class="text-4xl relative z-10 filter drop-shadow-lg">{{ badge.icon }}</div>
            </div>

            <!-- 名称 -->
            <h3 
              class="font-bold mb-1 transition-all text-sm"
              :class="[
                isUnlocked(badge.id) ? getRarityTextClass(badge.rarity) : 'text-gray-500',
                'group-hover:scale-105'
              ]"
            >
              {{ badge.name }}
            </h3>

            <!-- 描述 -->
            <p 
              class="text-xs text-gray-500 dark:text-gray-400 mb-2 transition-all line-clamp-2"
              :class="isUnlocked(badge.id) ? '' : 'opacity-60'"
            >
              {{ badge.description }}
            </p>

            <!-- 进度条 -->
            <div v-if="!isUnlocked(badge.id) && badge.progress" class="mt-2">
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>进度</span>
                <span :class="`rarity-text-${badge.rarity || 'common'}`">{{ badge.progress.current }}/{{ badge.progress.target }}</span>
              </div>
              <div class="h-1.5 bg-white/30 dark:bg-gray-700/30 rounded-full overflow-hidden">
                <div
                  :class="['h-full rounded-full transition-all duration-500', `rarity-progress-${badge.rarity || 'common'}`]"
                  :style="{ width: badge.progress.percent + '%' }"
                ></div>
              </div>
            </div>

            <!-- 已解锁时间 -->
            <div v-if="isUnlocked(badge.id)" class="text-xs mt-2 flex items-center justify-center gap-1" :class="`rarity-text-${badge.rarity || 'common'}`">
              <span>📅</span>
              <span>{{ badge.unlockedAt || '已解锁' }}</span>
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
import { ref, computed, onMounted, watch } from 'vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'

const tasks = ref([])
const habits = ref([])
const focusHistory = ref({})
const lovePoints = ref(0)
const isLoading = ref(true)
const isDarkMode = ref(false)
const showUnlockModal = ref(false)
const unlockingBadge = ref(null)
const newlyUnlockedBadges = ref([])

// 稀有度配置
const rarityConfig = {
  legendary: {
    name: '传说',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500',
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    glow: 'shadow-yellow-500/50',
    ring: 'ring-yellow-400',
    bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
    border: 'border-yellow-400',
    iconBg: 'from-yellow-400 to-yellow-600'
  },
  epic: {
    name: '史诗',
    color: 'text-purple-500',
    bg: 'bg-purple-500',
    gradient: 'from-purple-400 via-purple-500 to-purple-600',
    glow: 'shadow-purple-500/50',
    ring: 'ring-purple-400',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    border: 'border-purple-400',
    iconBg: 'from-purple-400 to-purple-600'
  },
  rare: {
    name: '稀有',
    color: 'text-blue-500',
    bg: 'bg-blue-500',
    gradient: 'from-blue-400 via-blue-500 to-blue-600',
    glow: 'shadow-blue-500/50',
    ring: 'ring-blue-400',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-400',
    iconBg: 'from-blue-400 to-blue-600'
  },
  uncommon: {
    name: '精良',
    color: 'text-green-500',
    bg: 'bg-green-500',
    gradient: 'from-green-400 via-green-500 to-green-600',
    glow: 'shadow-green-500/50',
    ring: 'ring-green-400',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-400',
    iconBg: 'from-green-400 to-green-600'
  },
  common: {
    name: '普通',
    color: 'text-gray-500',
    bg: 'bg-gray-500',
    gradient: 'from-gray-400 via-gray-500 to-gray-600',
    glow: 'shadow-gray-500/50',
    ring: 'ring-gray-400',
    bgClass: 'bg-gray-100 dark:bg-gray-700/30',
    border: 'border-gray-400',
    iconBg: 'from-gray-400 to-gray-600'
  }
}

// 获取稀有度配置
const getRarityConfig = (rarity) => rarityConfig[rarity] || rarityConfig.common
const getRarityLabel = (rarity) => rarityConfig[rarity]?.name || '普通'

// 成就定义（带稀有度）
const badges = ref([
  // 任务成就
  { 
    id: 'first_task', 
    name: '初学者', 
    icon: '🌟', 
    description: '完成第一个任务',
    category: 'task',
    rarity: 'common',
    progress: computed(() => ({ current: Math.min(1, tasks.value.filter(t => t.completed).length), target: 1, percent: Math.min(100, tasks.value.filter(t => t.completed).length * 100) }))
  },
  { 
    id: 'task_10', 
    name: '勤奋小蜜蜂', 
    icon: '🐝', 
    description: '完成10个任务',
    category: 'task',
    rarity: 'uncommon',
    progress: computed(() => ({ current: tasks.value.filter(t => t.completed).length, target: 10, percent: Math.min(100, tasks.value.filter(t => t.completed).length * 10) }))
  },
  { 
    id: 'task_50', 
    name: '学习达人', 
    icon: '🎓', 
    description: '完成50个任务',
    category: 'task',
    rarity: 'rare',
    progress: computed(() => ({ current: tasks.value.filter(t => t.completed).length, target: 50, percent: Math.min(100, tasks.value.filter(t => t.completed).length * 2) }))
  },
  { 
    id: 'task_100', 
    name: '任务大师', 
    icon: '👑', 
    description: '完成100个任务',
    category: 'task',
    rarity: 'rare',
    progress: computed(() => ({ current: tasks.value.filter(t => t.completed).length, target: 100, percent: Math.min(100, tasks.value.filter(t => t.completed).length) }))
  },
  { 
    id: 'task_200', 
    name: '任务狂人', 
    icon: '🔥', 
    description: '完成200个任务',
    category: 'task',
    rarity: 'epic',
    progress: computed(() => ({ current: tasks.value.filter(t => t.completed).length, target: 200, percent: Math.min(100, tasks.value.filter(t => t.completed).length / 2) }))
  },
  { 
    id: 'task_500', 
    name: '任务传奇', 
    icon: '🏆', 
    description: '完成500个任务',
    category: 'task',
    rarity: 'epic',
    progress: computed(() => ({ current: tasks.value.filter(t => t.completed).length, target: 500, percent: Math.min(100, tasks.value.filter(t => t.completed).length / 5) }))
  },
  { 
    id: 'task_1000', 
    name: '千锤百炼', 
    icon: '💎', 
    description: '完成1000个任务',
    category: 'task',
    rarity: 'legendary',
    progress: computed(() => ({ current: tasks.value.filter(t => t.completed).length, target: 1000, percent: Math.min(100, tasks.value.filter(t => t.completed).length / 10) }))
  },
  // 专注成就
  { 
    id: 'focus_1', 
    name: '初次专注', 
    icon: '⏱️', 
    description: '完成1次番茄钟',
    category: 'focus',
    rarity: 'common',
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
    rarity: 'uncommon',
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
    rarity: 'rare',
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
    rarity: 'rare',
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
    rarity: 'epic',
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
    rarity: 'epic',
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
    rarity: 'epic',
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
    rarity: 'legendary',
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
    rarity: 'legendary',
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
    rarity: 'common',
    progress: computed(() => ({ current: currentStreak.value >= 3 ? 3 : currentStreak.value, target: 3, percent: Math.min(100, (currentStreak.value / 3) * 100) }))
  },
  { 
    id: 'checkin_7', 
    name: '一周坚持', 
    icon: '📅', 
    description: '连续打卡7天',
    category: 'checkin',
    rarity: 'uncommon',
    progress: computed(() => ({ current: currentStreak.value, target: 7, percent: Math.min(100, (currentStreak.value / 7) * 100) }))
  },
  { 
    id: 'checkin_14', 
    name: '两周坚持', 
    icon: '📆', 
    description: '连续打卡14天',
    category: 'checkin',
    rarity: 'rare',
    progress: computed(() => ({ current: currentStreak.value, target: 14, percent: Math.min(100, (currentStreak.value / 14) * 100) }))
  },
  { 
    id: 'checkin_30', 
    name: '月度之星', 
    icon: '🌙', 
    description: '连续打卡30天',
    category: 'checkin',
    rarity: 'rare',
    progress: computed(() => ({ current: currentStreak.value, target: 30, percent: Math.min(100, (currentStreak.value / 30) * 100) }))
  },
  { 
    id: 'checkin_60', 
    name: '双月坚持', 
    icon: '🏃', 
    description: '连续打卡60天',
    category: 'checkin',
    rarity: 'epic',
    progress: computed(() => ({ current: currentStreak.value, target: 60, percent: Math.min(100, (currentStreak.value / 60) * 100) }))
  },
  { 
    id: 'checkin_100', 
    name: '百日坚持', 
    icon: '🎖️', 
    description: '连续打卡100天',
    category: 'checkin',
    rarity: 'epic',
    progress: computed(() => ({ current: currentStreak.value, target: 100, percent: Math.min(100, (currentStreak.value / 100) * 100) }))
  },
  { 
    id: 'checkin_365', 
    name: '全年无休', 
    icon: '🌟', 
    description: '连续打卡365天',
    category: 'checkin',
    rarity: 'legendary',
    progress: computed(() => ({ current: currentStreak.value, target: 365, percent: Math.min(100, (currentStreak.value / 365) * 100) }))
  },
  // 积分成就
  { 
    id: 'points_100', 
    name: '小小富豪', 
    icon: '💰', 
    description: '获得100积分',
    category: 'points',
    rarity: 'common',
    progress: computed(() => ({ current: totalPoints.value, target: 100, percent: Math.min(100, totalPoints.value) }))
  },
  { 
    id: 'points_500', 
    name: '积分达人', 
    icon: '💎', 
    description: '获得500积分',
    category: 'points',
    rarity: 'uncommon',
    progress: computed(() => ({ current: totalPoints.value, target: 500, percent: Math.min(100, totalPoints.value / 5) }))
  },
  { 
    id: 'points_1000', 
    name: '千分达人', 
    icon: '🏅', 
    description: '获得1000积分',
    category: 'points',
    rarity: 'rare',
    progress: computed(() => ({ current: totalPoints.value, target: 1000, percent: Math.min(100, totalPoints.value / 10) }))
  },
  { 
    id: 'points_2000', 
    name: '两千分王', 
    icon: '👑', 
    description: '获得2000积分',
    category: 'points',
    rarity: 'epic',
    progress: computed(() => ({ current: totalPoints.value, target: 2000, percent: Math.min(100, totalPoints.value / 20) }))
  },
  { 
    id: 'points_5000', 
    name: '五千分帝', 
    icon: '💎', 
    description: '获得5000积分',
    category: 'points',
    rarity: 'epic',
    progress: computed(() => ({ current: totalPoints.value, target: 5000, percent: Math.min(100, totalPoints.value / 50) }))
  },
  { 
    id: 'points_10000', 
    name: '万分传奇', 
    icon: '🏆', 
    description: '获得10000积分',
    category: 'points',
    rarity: 'legendary',
    progress: computed(() => ({ current: totalPoints.value, target: 10000, percent: Math.min(100, totalPoints.value / 100) }))
  },
  // 心得成就
  { 
    id: 'journal_1', 
    name: '心得初体验', 
    icon: '✍️', 
    description: '撰写第一篇学习心得',
    category: 'journal',
    rarity: 'common',
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
    rarity: 'uncommon',
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
    rarity: 'rare',
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
    rarity: 'common',
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
    rarity: 'uncommon',
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
    rarity: 'epic',
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
    rarity: 'legendary',
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
    rarity: 'rare',
    progress: computed(() => ({ current: perfectWeekCount.value, target: 1, percent: Math.min(100, (perfectWeekCount.value || 0) * 100) }))
  },
  { 
    id: 'habit_perfect_month', 
    name: '完美一月', 
    icon: '🌈', 
    description: '一月内每天完成所有习惯',
    category: 'habit',
    rarity: 'epic',
    progress: computed(() => ({ current: perfectMonthCount.value, target: 1, percent: Math.min(100, (perfectMonthCount.value || 0) * 100) }))
  },
  // 特殊成就
  { 
    id: 'early_bird', 
    name: '早起鸟儿', 
    icon: '🐦', 
    description: '早上6点前完成首个任务',
    category: 'special',
    rarity: 'rare',
    progress: computed(() => ({ current: earlyBirdCount.value, target: 1, percent: Math.min(100, (earlyBirdCount.value || 0) * 100) }))
  },
  { 
    id: 'night_owl', 
    name: '夜猫子', 
    icon: '🦉', 
    description: '晚上11点后完成首个任务',
    category: 'special',
    rarity: 'rare',
    progress: computed(() => ({ current: nightOwlCount.value, target: 1, percent: Math.min(100, (nightOwlCount.value || 0) * 100) }))
  },
  { 
    id: 'all_rounder', 
    name: '全能选手', 
    icon: '🌟', 
    description: '解锁所有成就',
    category: 'special',
    rarity: 'legendary',
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

// 稀有度筛选
const activeRarityFilter = ref('all')
const filteredBadges = computed(() => {
  if (activeRarityFilter.value === 'all') return badges.value
  return badges.value.filter(b => (b.rarity || 'common') === activeRarityFilter.value)
})

// 获取稀有度相关样式
const getRarityBgClass = (rarity) => {
  const config = getRarityConfig(rarity)
  return config.bgClass
}

const getRarityTextClass = (rarity) => {
  const config = getRarityConfig(rarity)
  return config.color
}

const getRarityActiveClass = (rarity) => {
  if (rarity === 'all') return 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
  const config = getRarityConfig(rarity)
  return `bg-gradient-to-r ${config.gradient} text-white shadow-lg ${config.glow}`
}

// 显示成就详情
const showBadgeDetail = (badge) => {
  if (!isUnlocked(badge.id)) return
  unlockingBadge.value = badge
  showUnlockModal.value = true
}

// 关闭解锁弹窗
const closeUnlockModal = () => {
  showUnlockModal.value = false
  unlockingBadge.value = null
}

// 监听成就解锁
watch(() => isUnlocked(''), (newVal) => {
  // 解锁时的庆祝逻辑
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

<style scoped>
/* ========== 稀有度颜色系统 ========== */

/* 传说 - 金色 */
.rarity-border-legendary {
  border: 2px solid #fbbf24;
}
.rarity-glow-legendary {
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.5), 0 0 40px rgba(251, 191, 36, 0.3), inset 0 0 20px rgba(251, 191, 36, 0.1);
}
.rarity-gradient-legendary {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.15));
}
.rarity-glow-bg-legendary {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}
.rarity-tag-legendary {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.rarity-check-legendary {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}
.rarity-progress-legendary {
  background: linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24);
  background-size: 200% 100%;
  animation: shimmer 2s infinite linear;
}
.text-yellow-500 { color: #fbbf24; }

/* 史诗 - 紫色 */
.rarity-border-epic {
  border: 2px solid #a855f7;
}
.rarity-glow-epic {
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(168, 85, 247, 0.1);
}
.rarity-gradient-epic {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(147, 51, 234, 0.15), rgba(168, 85, 247, 0.15));
}
.rarity-glow-bg-epic {
  background: linear-gradient(135deg, #a855f7, #9333ea);
}
.rarity-tag-epic {
  background: linear-gradient(135deg, #a855f7, #9333ea);
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.rarity-check-epic {
  background: linear-gradient(135deg, #a855f7, #9333ea);
}
.rarity-progress-epic {
  background: linear-gradient(90deg, #a855f7, #9333ea, #a855f7);
  background-size: 200% 100%;
  animation: shimmer 2s infinite linear;
}
.text-purple-500 { color: #a855f7; }

/* 稀有 - 蓝色 */
.rarity-border-rare {
  border: 2px solid #3b82f6;
}
.rarity-glow-rare {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(59, 130, 246, 0.1);
}
.rarity-gradient-rare {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.15), rgba(59, 130, 246, 0.15));
}
.rarity-glow-bg-rare {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}
.rarity-tag-rare {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.rarity-check-rare {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}
.rarity-progress-rare {
  background: linear-gradient(90deg, #3b82f6, #2563eb, #3b82f6);
  background-size: 200% 100%;
  animation: shimmer 2s infinite linear;
}
.text-blue-500 { color: #3b82f6; }

/* 精良 - 绿色 */
.rarity-border-uncommon {
  border: 2px solid #22c55e;
}
.rarity-glow-uncommon {
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.3), inset 0 0 20px rgba(34, 197, 94, 0.1);
}
.rarity-gradient-uncommon {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.15), rgba(34, 197, 94, 0.15));
}
.rarity-glow-bg-uncommon {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}
.rarity-tag-uncommon {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}
.rarity-check-uncommon {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}
.rarity-progress-uncommon {
  background: linear-gradient(90deg, #22c55e, #16a34a, #22c55e);
  background-size: 200% 100%;
  animation: shimmer 2s infinite linear;
}
.text-green-500 { color: #22c55e; }

/* 普通 - 灰色 */
.rarity-border-common {
  border: 2px solid #9ca3af;
}
.rarity-glow-common {
  box-shadow: 0 0 15px rgba(156, 163, 175, 0.4), 0 0 30px rgba(156, 163, 175, 0.2), inset 0 0 15px rgba(156, 163, 175, 0.1);
}
.rarity-gradient-common {
  background: linear-gradient(135deg, rgba(156, 163, 175, 0.1), rgba(107, 114, 128, 0.1), rgba(156, 163, 175, 0.1));
}
.rarity-glow-bg-common {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
}
.rarity-tag-common {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  color: #fff;
}
.rarity-check-common {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
}
.rarity-progress-common {
  background: linear-gradient(90deg, #9ca3af, #6b7280, #9ca3af);
  background-size: 200% 100%;
  animation: shimmer 2s infinite linear;
}
.text-gray-500 { color: #9ca3af; }

/* 动画效果 */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

@keyframes float-badge {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes unlock-scale {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 稀有度筛选按钮样式 */
button:active {
  transform: scale(0.95);
}

/* 成就卡片悬停效果 */
.group:hover .rarity-glow-legendary {
  animation: pulse-glow 1.5s infinite;
}

.group:hover .rarity-glow-epic {
  animation: pulse-glow 1.5s infinite;
}

.group:hover .rarity-glow-rare {
  animation: pulse-glow 2s infinite;
}

.group:hover .rarity-glow-uncommon {
  animation: pulse-glow 2.5s infinite;
}

.group:hover .rarity-glow-common {
  animation: pulse-glow 3s infinite;
}

/* ========== 解锁弹窗样式 ========== */
.achievement-unlock-modal {
  animation: unlock-scale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .achievement-unlock-modal,
.modal-leave-to .achievement-unlock-modal {
  transform: scale(0.8) translateY(20px);
  opacity: 0;
}

/* 解锁环动画 */
.unlock-ring {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 3px solid;
  animation: ring-pulse 2s infinite;
}

@keyframes ring-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.7;
  }
}

.unlock-ring.ring-legendary {
  border-color: #fbbf24;
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
}

.unlock-ring.ring-epic {
  border-color: #a855f7;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
}

.unlock-ring.ring-rare {
  border-color: #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

.unlock-ring.ring-uncommon {
  border-color: #22c55e;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
}

.unlock-ring.ring-common {
  border-color: #9ca3af;
  box-shadow: 0 0 15px rgba(156, 163, 175, 0.3);
}

/* 解锁图标背景 */
.unlock-icon-bg {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.bg-yellow-100 { background: linear-gradient(135deg, #fef3c7, #fde68a); }
.bg-yellow-900\/30 { background: rgba(120, 53, 15, 0.3); }

.bg-purple-100 { background: linear-gradient(135deg, #f3e8ff, #e9d5ff); }
.bg-purple-900\/30 { background: rgba(88, 28, 135, 0.3); }

.bg-blue-100 { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
.bg-blue-900\/30 { background: rgba(30, 58, 138, 0.3); }

.bg-green-100 { background: linear-gradient(135deg, #dcfce7, #bbf7d0); }
.bg-green-900\/30 { background: rgba(20, 83, 45, 0.3); }

.bg-gray-100 { background: linear-gradient(135deg, #f3f4f6, #e5e7eb); }
.bg-gray-700\/30 { background: rgba(55, 65, 81, 0.3); }

/* 彩带背景效果 */
.confetti-bg {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 60% 60%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%);
  animation: confetti-rotate 10s infinite linear;
}

@keyframes confetti-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 稀有度文字颜色 */
.text-yellow-500 {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-purple-500 {
  background: linear-gradient(135deg, #a855f7, #9333ea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-blue-500 {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-green-500 {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gray-500 {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .grid-cols-2 {
    gap: 0.75rem;
  }
  
  .p-5 {
    padding: 0.75rem;
  }
  
  .w-16 {
    width: 3.5rem;
  }
  
  .h-16 {
    height: 3.5rem;
  }
  
  .text-4xl {
    font-size: 1.75rem;
  }
  
  .text-sm {
    font-size: 0.75rem;
  }
}
</style>
