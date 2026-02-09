<template>
  <div class="max-w-7xl mx-auto">
    <!-- 庆祝特效 -->
    <ConfettiEffect ref="confettiRef" @complete="onConfettiComplete" />
    
    <!-- 骨架屏加载状态 -->
    <template v-if="isLoading">
      <div class="glass-card p-8">
        <div class="flex items-center justify-between mb-8">
          <div class="skeleton-pulse rounded h-8 w-48" :class="isDarkMode ? 'bg-white/20' : 'bg-white/40'"></div>
          <div class="flex gap-4">
            <div class="skeleton-pulse rounded-xl px-6 py-2" :class="isDarkMode ? 'bg-white/15' : 'bg-white/30'"></div>
            <div class="skeleton-pulse rounded-xl px-6 py-2" :class="isDarkMode ? 'bg-white/15' : 'bg-white/30'"></div>
          </div>
        </div>
        <div class="flex flex-col items-center">
          <div class="skeleton-pulse rounded-full w-72 h-72 mb-6" :class="isDarkMode ? 'bg-white/15' : 'bg-white/30'"></div>
          <div class="skeleton-pulse rounded-xl px-16 py-4" :class="isDarkMode ? 'bg-white/20' : 'bg-white/40'"></div>
        </div>
        <div class="mt-8">
          <SkeletonLoader type="list" :rows="3" :dark-mode="isDarkMode" />
        </div>
      </div>
    </template>

    <!-- 真实内容 -->
    <template v-else>
      <div class="glass-card p-8">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span class="text-2xl">⏱️</span>
            <span class="text-rainbow">专注计时器</span>
          </h2>
          <div class="flex gap-4">
            <!-- 今日目标进度 -->
            <div class="flex items-center gap-2 px-4 py-2 bg-white/30 rounded-xl">
              <span class="text-lg">🎯</span>
              <div class="text-center">
                <div class="text-orange-600 font-bold text-lg">{{ todayMinutes }}</div>
                <div class="text-xs text-gray-500">今日分钟</div>
              </div>
            </div>
            <div class="flex items-center gap-2 px-4 py-2 bg-white/30 rounded-xl">
              <span class="text-lg">🔥</span>
              <div class="text-center">
                <div class="text-orange-600 font-bold text-lg">{{ todaySessions }}</div>
                <div class="text-xs text-gray-500">完成次数</div>
              </div>
            </div>
            <!-- 设置按钮 -->
            <button
              @click="toggleSettings"
              class="flex items-center gap-2 px-4 py-2 bg-white/30 rounded-xl hover:bg-white/50 transition-all"
            >
              <span class="text-lg">⚙️</span>
              <span class="text-sm text-gray-600">设置</span>
            </button>
          </div>
        </div>

        <!-- 计时器模式选择 -->
        <div class="mb-6">
          <div class="flex flex-wrap gap-3 justify-center">
            <button
              v-for="mode in timerModes"
              :key="mode.id"
              @click="setTimerMode(mode)"
              class="px-4 py-2 rounded-full font-medium transition-all"
              :class="currentMode.id === mode.id 
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' 
                : 'bg-white/40 text-gray-600 hover:bg-white/60'"
            >
              <span class="mr-1">{{ mode.icon }}</span>
              {{ mode.label }}
              <span class="text-xs opacity-70 ml-1">({{ mode.minutes }}分钟)</span>
            </button>
          </div>
        </div>

        <!-- 计时器 -->
        <div class="flex flex-col items-center mb-8">
          <div class="relative mb-6">
            <!-- 环形进度条 -->
            <svg class="w-72 h-72 -rotate-90" viewBox="0 0 288 288">
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#f97316" />
                  <stop offset="50%" stop-color="#f472b6" />
                  <stop offset="100%" stop-color="#fb7185" />
                </linearGradient>
                <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#22c55e" />
                  <stop offset="100%" stop-color="#14b8a6" />
                </linearGradient>
              </defs>
              <!-- 背景圈 -->
              <circle
                cx="144"
                cy="144"
                r="130"
                fill="none"
                stroke="currentColor"
                stroke-width="12"
                class="text-orange-200"
              />
              <!-- 进度圈 -->
              <circle
                cx="144"
                cy="144"
                r="130"
                fill="none"
                :stroke="currentMode.isBreak ? 'url(#breakGradient)' : 'url(#timerGradient)'"
                stroke-width="12"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="strokeDashoffset"
                class="transition-all duration-1000"
                stroke-linecap="round"
                :style="{ filter: pomodoroRunning ? 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))' : 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.3))' }"
              />
            </svg>
            
            <!-- 中心时间显示 -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="text-7xl font-bold tracking-wider" 
                     :class="pomodoroRunning ? 'text-red-500 animate-pulse' : (currentMode.isBreak ? 'text-green-600' : 'text-orange-600 text-glow')">
                  {{ formatTime(pomodoroTime) }}
                </div>
                <div class="text-gray-500 mt-2 flex items-center justify-center gap-2">
                  <span v-if="pomodoroRunning" class="flex items-center gap-1">
                    <span class="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                    {{ currentMode.isBreak ? '休息中...' : '专注中...' }}
                  </span>
                  <span v-else>{{ currentMode.isBreak ? '休息一下' : '准备开始' }}</span>
                </div>
              </div>
            </div>
            
            <!-- 装饰光晕 -->
            <div 
              v-if="pomodoroRunning"
              class="absolute inset-0 rounded-full animate-pulse-glow pointer-events-none"
              :class="isDarkMode ? 'bg-red-500/20' : 'bg-orange-400/30'"
            ></div>
          </div>

          <!-- 控制按钮 -->
          <div class="flex gap-4 flex-wrap justify-center">
            <button
              @click="togglePomodoro"
              :class="pomodoroRunning ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600'"
              class="jelly-button text-white px-10 py-4 rounded-2xl font-bold text-xl shadow-lg"
            >
              {{ pomodoroRunning ? '⏸️ 暂停' : '▶️ 开始' }}
            </button>
            <button
              @click="resetPomodoro"
              class="jelly-button bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-10 py-4 rounded-2xl font-bold text-xl shadow-lg"
            >
              🔄 重置
            </button>
          </div>
          
          <!-- 今日目标 -->
          <div class="mt-6 w-full max-w-md">
            <div class="flex justify-between text-sm text-gray-500 mb-2">
              <span>📈 今日目标: {{ dailyGoal }} 分钟</span>
              <span :class="goalProgress >= 100 ? 'text-green-500' : 'text-orange-500'">
                {{ goalProgress }}%
              </span>
            </div>
            <div class="h-3 bg-white/40 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 rounded-full transition-all duration-500"
                :style="{ width: Math.min(goalProgress, 100) + '%' }"
                :class="{ 'animate-shimmer': pomodoroRunning }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 设置弹窗 -->
        <div v-if="showSettings" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showSettings = false">
          <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span class="text-2xl">⚙️</span> 计时器设置
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">
                  专注时长: {{ customFocusTime }} 分钟
                </label>
                <input
                  type="range"
                  v-model="customFocusTime"
                  min="5"
                  max="60"
                  step="5"
                  class="w-full h-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full appearance-none cursor-pointer"
                />
                <div class="flex justify-between text-xs text-gray-400 mt-1">
                  <span>5分钟</span>
                  <span>60分钟</span>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">
                  短休息时长: {{ customShortBreakTime }} 分钟
                </label>
                <input
                  type="range"
                  v-model="customShortBreakTime"
                  min="1"
                  max="15"
                  step="1"
                  class="w-full h-3 bg-gradient-to-r from-green-400 to-teal-500 rounded-full appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">
                  长休息时长: {{ customLongBreakTime }} 分钟
                </label>
                <input
                  type="range"
                  v-model="customLongBreakTime"
                  min="5"
                  max="30"
                  step="5"
                  class="w-full h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">
                  每日目标: {{ dailyGoal }} 分钟
                </label>
                <input
                  type="range"
                  v-model="dailyGoal"
                  min="30"
                  max="300"
                  step="30"
                  class="w-full h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full appearance-none cursor-pointer"
                />
                <div class="text-xs text-gray-400 mt-1">约 {{ (dailyGoal / 60).toFixed(1) }} 小时</div>
              </div>
            </div>
            
            <div class="flex gap-3 mt-6">
              <button
                @click="showSettings = false"
                class="flex-1 py-3 bg-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-300 transition-all"
              >
                取消
              </button>
              <button
                @click="applyCustomSettings"
                class="flex-1 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 transition-all"
              >
                保存
              </button>
            </div>
          </div>
        </div>

        <!-- 白噪音控制 -->
        <div class="border-t border-white/20 pt-6">
          <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span class="text-2xl">🎧</span>
            <span class="text-rainbow">白噪音环境</span>
          </h3>
          <div class="flex flex-wrap gap-3 mb-4">
            <button
              v-for="sound in whiteNoises"
              :key="sound.id"
              @click="toggleSound(sound)"
              :class="activeSound === sound.id ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'bg-white/40 text-gray-600 hover:bg-white/60'"
              class="px-4 py-2 rounded-full font-medium transition-all hover:scale-105"
            >
              {{ sound.icon }} {{ sound.name }}
            </button>
          </div>
          <div v-if="activeSound" class="flex items-center gap-4 p-4 bg-white/20 rounded-xl">
            <span class="text-3xl animate-float">{{ getActiveSoundIcon() }}</span>
            <input
              type="range"
              v-model="soundVolume"
              min="0"
              max="100"
              class="flex-1 h-3 bg-white/30 rounded-full appearance-none cursor-pointer"
            />
            <span class="text-gray-600 font-medium w-14 text-right">{{ soundVolume }}%</span>
          </div>
        </div>

        <!-- 今日专注记录 -->
        <div class="border-t border-white/20 pt-6 mt-6">
          <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span class="text-2xl">📊</span>
            <span class="text-rainbow">专注记录</span>
          </h3>
          <div v-if="todayRecords.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div
              v-for="(record, index) in todayRecords.slice(0, 8)"
              :key="index"
              class="p-3 bg-white/30 rounded-xl flex items-center justify-between hover:bg-white/50 transition-all"
            >
              <div class="flex items-center gap-2">
                <span class="text-lg">✅</span>
                <span class="text-gray-700">第 {{ index + 1 }} 次</span>
              </div>
              <span class="text-orange-600 font-medium">{{ record.duration || 25 }}分钟</span>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <div class="text-6xl mb-4 opacity-50">⏱️</div>
            <p class="text-gray-500 text-lg">今日还没有专注记录，开始你的第一次专注吧！</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, onMounted, watch } from 'vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import ConfettiEffect from '../components/ConfettiEffect.vue'

const emit = defineEmits(['updatePoints'])

// 计时器模式定义
const timerModes = [
  { id: 'focus', label: '专注', icon: '⏱️', minutes: 25, isBreak: false },
  { id: 'shortBreak', label: '短休息', icon: '☕', minutes: 5, isBreak: true },
  { id: 'longBreak', label: '长休息', icon: '🌙', minutes: 15, isBreak: true }
]

const currentMode = ref(timerModes[0])
const pomodoroTime = ref(25 * 60)
const pomodoroRunning = ref(false)
let pomodoroInterval = null
const todayMinutes = ref(0)
const todaySessions = ref(0)
const todayRecords = ref([])
const activeSound = ref('')
const soundVolume = ref(50)
const circumference = 2 * Math.PI * 130
const isLoading = ref(true)
const isDarkMode = ref(false)
const confettiRef = ref(null)
const dailyGoal = ref(120) // 每日目标2小时
const showSettings = ref(false)

// 自定义时长设置
const customFocusTime = ref(25)
const customShortBreakTime = ref(5)
const customLongBreakTime = ref(15)
const completedPomodoros = ref(0) // 完成番茄钟数量，用于自动切换休息模式

// 设置按钮点击
const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

// 应用自定义设置
const applyCustomSettings = () => {
  timerModes[0].minutes = customFocusTime.value
  timerModes[1].minutes = customShortBreakTime.value
  timerModes[2].minutes = customLongBreakTime.value
  
  // 如果当前未运行，更新显示时间
  if (!pomodoroRunning.value) {
    pomodoroTime.value = currentMode.value.minutes * 60
  }
  
  // 保存到本地存储
  localStorage.setItem('focusSettings', JSON.stringify({
    focus: customFocusTime.value,
    shortBreak: customShortBreakTime.value,
    longBreak: customLongBreakTime.value,
    goal: dailyGoal.value
  }))
  
  showSettings.value = false
}

// ========== 积分记录功能 ==========
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

// 切换计时器模式
const setTimerMode = (mode) => {
  if (pomodoroRunning.value) {
    if (!confirm('切换模式将重置当前计时器，是否继续？')) return
  }
  currentMode.value = mode
  resetPomodoro()
}

// 监听模式变化，更新进度条计算
const strokeDashoffset = computed(() => {
  const totalSeconds = currentMode.value.minutes * 60
  const progress = (totalSeconds - pomodoroTime.value) / totalSeconds
  return circumference * (1 - progress)
})

const goalProgress = computed(() => {
  return Math.round((todayMinutes.value / dailyGoal.value) * 100)
})

const whiteNoises = [
  { id: 'rain', name: '雨声', icon: '🌧️' },
  { id: 'forest', name: '森林', icon: '🌲' },
  { id: 'ocean', name: '海浪', icon: '🌊' },
  { id: 'fire', name: '篝火', icon: '🔥' },
  { id: 'cafe', name: '咖啡馆', icon: '☕' }
]

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const togglePomodoro = () => {
  if (pomodoroRunning.value) {
    pomodoroRunning.value = false
    clearInterval(pomodoroInterval)
  } else {
    pomodoroRunning.value = true
    pomodoroInterval = setInterval(() => {
      if (pomodoroTime.value > 0) {
        pomodoroTime.value--
      } else {
        completePomodoro()
      }
    }, 1000)
  }
}

const completePomodoro = () => {
  const wasFocusMode = !currentMode.value.isBreak
  
  // 只有专注模式才增加记录和积分
  if (wasFocusMode) {
    completedPomodoros.value++
    
    resetPomodoro()
    
    const today = new Date().toDateString()
    const savedData = JSON.parse(localStorage.getItem('focusHistory') || '{}')
    
    if (!savedData[today]) {
      savedData[today] = { minutes: 0, sessions: 0, records: [] }
    }
    
    savedData[today].minutes += currentMode.value.minutes
    savedData[today].sessions++
    savedData[today].records.push({
      time: new Date().toISOString(),
      duration: currentMode.value.minutes
    })
    
    localStorage.setItem('focusHistory', JSON.stringify(savedData))
    
    // 更新积分
    const currentPoints = parseInt(localStorage.getItem('lovePoints') || '0')
    localStorage.setItem('lovePoints', (currentPoints + 5).toString())
    addPointsRecord(5, `完成${currentMode.value.minutes}分钟专注`, '⏱️')
    emit('updatePoints')
    
    loadTodayStats()
    
    // 触发庆祝特效
    confettiRef.value?.trigger()
    
    // 自动建议进入休息模式
    const nextMode = completedPomodoros.value % 4 === 0 
      ? timerModes[2] // 长休息
      : timerModes[1] // 短休息
    
    setTimeout(() => {
      if (confirm(`🎉 专注完成！建议进入${nextMode.label}模式，是否切换？`)) {
        currentMode.value = nextMode
        pomodoroTime.value = nextMode.minutes * 60
      }
    }, 500)
    
    // 检查是否达到每日目标
    if (todayMinutes.value >= dailyGoal.value) {
      setTimeout(() => {
        const event = new CustomEvent('showToast', { 
          detail: { 
            message: '恭喜你完成了今日专注目标！太棒了！', 
            type: 'success',
            title: '🎉 目标达成'
          } 
        })
        window.dispatchEvent(event)
      }, 1000)
    } else {
      const event = new CustomEvent('showToast', { 
        detail: { 
          message: `${currentMode.value.minutes}分钟专注完成！获得 5 个恋爱积分`, 
          type: 'success',
          title: '🎉 专注成功'
        } 
      })
      window.dispatchEvent(event)
    }
  } else {
    // 休息模式完成，提示进入专注
    resetPomodoro()
    const event = new CustomEvent('showToast', { 
      detail: { 
        message: '休息结束！准备好开始下一次专注了吗？', 
        type: 'info',
        title: '⏰ 休息提醒'
      } 
    })
    window.dispatchEvent(event)
  }
}

const resetPomodoro = () => {
  pomodoroRunning.value = false
  pomodoroTime.value = 25 * 60
  clearInterval(pomodoroInterval)
}

const toggleSound = (sound) => {
  if (activeSound.value === sound.id) {
    activeSound.value = ''
  } else {
    activeSound.value = sound.id
  }
}

const getActiveSoundIcon = () => {
  const sound = whiteNoises.find(s => s.id === activeSound.value)
  return sound ? sound.icon : ''
}

const loadTodayStats = () => {
  try {
    const today = new Date().toDateString()
    const savedData = localStorage.getItem('focusHistory')
    
    if (savedData) {
      const data = JSON.parse(savedData)
      if (data[today]) {
        todayMinutes.value = data[today].minutes || 0
        todaySessions.value = data[today].sessions || 0
        todayRecords.value = data[today].records || []
      }
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const onConfettiComplete = () => {
  // 庆祝完成后的回调
}

const init = () => {
  // 显示骨架屏
  isLoading.value = true
  
  try {
    // 检查深色模式
    isDarkMode.value = document.documentElement.classList.contains('dark')
    
    // 加载保存的设置
    const savedSettings = localStorage.getItem('focusSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      customFocusTime.value = settings.focus || 25
      customShortBreakTime.value = settings.shortBreak || 5
      customLongBreakTime.value = settings.longBreak || 15
      dailyGoal.value = settings.goal || 120
      
      // 更新计时器模式
      timerModes[0].minutes = customFocusTime.value
      timerModes[1].minutes = customShortBreakTime.value
      timerModes[2].minutes = customLongBreakTime.value
      
      // 重置时间为当前模式
      pomodoroTime.value = currentMode.value.minutes * 60
    }
  } catch (error) {
    console.error('Error initializing:', error)
  } finally {
    // 隐藏骨架屏，显示内容
    setTimeout(() => {
      isLoading.value = false
    }, 300)
  }
}

onMounted(() => {
  loadTodayStats()
  init()
})

onUnmounted(() => {
  clearInterval(pomodoroInterval)
})
</script>
