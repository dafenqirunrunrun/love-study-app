<template>
  <div class="max-w-7xl mx-auto">
    <div class="glass-card p-8">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-gray-800">⏱️ 专注计时器</h2>
        <div class="flex gap-4">
          <div class="text-center px-4 py-2 bg-white/30 rounded-xl">
            <div class="text-orange-600 font-bold text-xl">{{ todayMinutes }}</div>
            <div class="text-xs text-gray-500">今日分钟</div>
          </div>
          <div class="text-center px-4 py-2 bg-white/30 rounded-xl">
            <div class="text-orange-600 font-bold text-xl">{{ todaySessions }}</div>
            <div class="text-xs text-gray-500">完成次数</div>
          </div>
        </div>
      </div>

      <!-- 计时器 -->
      <div class="flex flex-col items-center mb-8">
        <div class="relative mb-6">
          <!-- 环形进度条 -->
          <svg class="w-64 h-64 -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              stroke-width="8"
              fill="none"
              class="text-orange-200"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              stroke-width="8"
              fill="none"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="strokeDashoffset"
              :class="pomodoroRunning ? 'text-red-500' : 'text-orange-500'"
              class="transition-all duration-1000"
              stroke-linecap="round"
            />
          </svg>
          <!-- 中心时间显示 -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="text-6xl font-bold" :class="pomodoroRunning ? 'text-red-500' : 'text-orange-600'">
                {{ formatTime(pomodoroTime) }}
              </div>
              <div class="text-gray-500 mt-2">
                {{ pomodoroRunning ? '专注中...' : '准备开始' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="flex gap-4 flex-wrap justify-center">
          <button
            @click="togglePomodoro"
            :class="pomodoroRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'"
            class="jelly-button text-white px-10 py-4 rounded-2xl font-bold text-xl shadow-lg"
          >
            {{ pomodoroRunning ? '⏸️ 暂停' : '▶️ 开始专注' }}
          </button>
          <button
            @click="resetPomodoro"
            class="jelly-button bg-gray-500 hover:bg-gray-600 text-white px-10 py-4 rounded-2xl font-bold text-xl shadow-lg"
          >
            🔄 重置
          </button>
        </div>
      </div>

      <!-- 白噪音控制 -->
      <div class="border-t border-white/20 pt-6">
        <h3 class="text-lg font-bold text-gray-700 mb-4">🎧 白噪音环境</h3>
        <div class="flex flex-wrap gap-3 mb-4">
          <button
            v-for="sound in whiteNoises"
            :key="sound.id"
            @click="toggleSound(sound)"
            :class="activeSound === sound.id ? 'bg-orange-500 text-white' : 'bg-white/40 text-gray-600 hover:bg-white/60'"
            class="px-4 py-2 rounded-full font-medium transition-all"
          >
            {{ sound.icon }} {{ sound.name }}
          </button>
        </div>
        <div v-if="activeSound" class="flex items-center gap-4">
          <span class="text-2xl">{{ getActiveSoundIcon() }}</span>
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
        <h3 class="text-lg font-bold text-gray-700 mb-4">📊 今日专注记录</h3>
        <div v-if="todayRecords.length > 0" class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
          <div
            v-for="(record, index) in todayRecords"
            :key="index"
            class="flex items-center justify-between p-3 bg-white/30 rounded-xl"
          >
            <div class="flex items-center gap-3">
              <span class="text-xl">✅</span>
              <span class="text-gray-700">第 {{ index + 1 }} 次专注</span>
            </div>
            <span class="text-orange-600 font-medium">25 分钟</span>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-4">
          今日还没有专注记录，开始你的第一次专注吧！
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const emit = defineEmits(['updatePoints'])

const pomodoroTime = ref(25 * 60)
const pomodoroRunning = ref(false)
let pomodoroInterval = null
const todayMinutes = ref(0)
const todaySessions = ref(0)
const todayRecords = ref([])
const activeSound = ref('')
const soundVolume = ref(50)
const circumference = 2 * Math.PI * 120

const strokeDashoffset = computed(() => {
  const totalSeconds = 25 * 60
  const progress = (totalSeconds - pomodoroTime.value) / totalSeconds
  return circumference * (1 - progress)
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
  resetPomodoro()
  
  const today = new Date().toDateString()
  const savedData = JSON.parse(localStorage.getItem('focusHistory') || '{}')
  
  if (!savedData[today]) {
    savedData[today] = { minutes: 0, sessions: 0, records: [] }
  }
  
  savedData[today].minutes += 25
  savedData[today].sessions++
  savedData[today].records.push(new Date().toISOString())
  
  localStorage.setItem('focusHistory', JSON.stringify(savedData))
  
  // 更新积分
  const currentPoints = parseInt(localStorage.getItem('lovePoints') || '0')
  localStorage.setItem('lovePoints', (currentPoints + 5).toString())
  emit('updatePoints')
  
  loadTodayStats()
  
  alert('🎉 专注25分钟完成！获得 5 个恋爱积分')
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

onUnmounted(() => {
  clearInterval(pomodoroInterval)
})

// 初始化
loadTodayStats()
</script>
