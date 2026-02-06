<template>
  <div class="relative min-h-screen overflow-hidden">
    <div class="absolute inset-0 -z-10">
      <div class="absolute inset-0 bg-gradient-to-br from-rose-100 via-orange-100 to-sky-100 animate-gradient-shift"></div>
      <div class="absolute inset-0 bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 opacity-50 animate-gradient-shift-reverse"></div>
      <div class="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full blur-3xl animate-float"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-float-delay"></div>
    </div>

    <div class="relative z-10 p-6">
      <div class="flex justify-end mb-6">
        <div class="glass-card px-6 py-3 flex items-center gap-3">
          <span class="text-2xl">💰</span>
          <span class="text-orange-600 font-bold text-lg">恋爱积分: {{ lovePoints }}</span>
        </div>
      </div>

      <div class="max-w-7xl mx-auto grid grid-cols-12 gap-6 auto-rows-min">
        <div class="col-span-12 md:col-span-4 glass-card p-8 flex flex-col items-center justify-center text-center">
          <div class="text-6xl mb-4">📚</div>
          <h2 class="text-2xl font-bold text-gray-800 mb-6">考研倒计时</h2>
          <div class="text-orange-600 font-bold text-7xl mb-3">{{ countdownDays }}</div>
          <div class="text-gray-600 text-lg mb-4">天</div>
          <div class="text-gray-500">{{ targetDateFormatted }}</div>
        </div>

        <div class="col-span-12 md:col-span-8 glass-card p-8 flex flex-col justify-center">
          <div class="text-3xl mb-4">💕</div>
          <div class="text-2xl font-serif text-gray-700 italic leading-relaxed text-center">
            "{{ dailyLoveMessage }}"
          </div>
        </div>

        <div class="col-span-12 md:col-span-6 glass-card p-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-800">⏰ 专注时光</h3>
          </div>
          <div class="flex justify-center mb-8">
            <div class="relative">
              <div class="w-32 h-32 rounded-full bg-gradient-to-r from-orange-200 to-pink-200 flex items-center justify-center">
                <div class="text-4xl font-bold text-orange-600">{{ formatTime(pomodoroTime) }}</div>
              </div>
            </div>
          </div>
          <div class="flex justify-center gap-4">
            <button
              @click="togglePomodoro"
              :class="pomodoroRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'"
              class="jelly-button text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg"
            >
              {{ pomodoroRunning ? '⏸️ 暂停' : '▶️ 开始' }}
            </button>
            <button
              @click="resetPomodoro"
              class="jelly-button bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg"
            >
              🔄 重置
            </button>
          </div>
        </div>

        <div class="col-span-12 md:col-span-6 glass-card p-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-800">📝 任务链</h3>
          </div>
          <div class="mb-6">
            <div class="flex gap-3">
              <input
                v-model="newTask"
                @keyup.enter="addTask"
                type="text"
                placeholder="添加新任务..."
                class="flex-1 px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:border-orange-400/50 focus:outline-none focus:bg-white/60 transition-all"
              />
              <button
                @click="addTask"
                class="jelly-button bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg"
              >
                ➕
              </button>
            </div>
          </div>
          <div class="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
            <div
              v-for="task in tasks"
              :key="task.id"
              class="flex items-center gap-3 p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20 transition-all hover:bg-white/40 hover:shadow-md"
            >
              <input
                type="checkbox"
                v-model="task.completed"
                @change="toggleTask(task)"
                class="w-5 h-5 text-orange-500 rounded-lg"
              />
              <span
                :class="task.completed ? 'line-through text-gray-500' : 'text-gray-800'"
                class="flex-1 text-lg"
              >
                {{ task.text }}
              </span>
              <button
                @click="deleteTask(task.id)"
                class="text-red-400 hover:text-red-600 font-bold text-lg p-2"
              >
                🗑️
              </button>
            </div>
            <div v-if="tasks.length === 0" class="text-center text-gray-500 py-8">
              暂无任务，添加你的学习计划吧！
            </div>
          </div>
        </div>

        <div class="col-span-12 glass-card p-8">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-2xl font-bold text-gray-800">🎁 心愿单</h3>
          </div>
          <div class="grid md:grid-cols-3 gap-6">
            <div class="bg-gradient-to-br from-orange-100/50 to-pink-100/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/30">
              <div class="text-5xl mb-3">💰</div>
              <div class="text-orange-600 font-bold text-4xl mb-2">{{ lovePoints }}</div>
              <div class="text-gray-600">当前积分</div>
            </div>
            <div class="md:col-span-2 grid grid-cols-2 gap-4">
              <div
                v-for="reward in rewards"
                :key="reward.id"
                class="bg-white/30 backdrop-blur-sm rounded-2xl p-4 border border-white/20 transition-all hover:bg-white/40 hover:shadow-md"
              >
                <div class="text-2xl mb-2">{{ reward.name.split(' ')[0] }}</div>
                <div class="font-bold text-gray-800 mb-1">{{ reward.name.split(' ').slice(1).join(' ') }}</div>
                <div class="text-sm text-gray-600 mb-3">{{ reward.points }} 积分</div>
                <button
                  @click="redeemReward(reward)"
                  :disabled="lovePoints < reward.points"
                  :class="lovePoints >= reward.points 
                    ? 'jelly-button bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
                  class="w-full px-4 py-2 rounded-xl font-bold shadow-md"
                >
                  {{ lovePoints >= reward.points ? '联系男友兑换' : '积分不足' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showSuccess" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" @click="showSuccess = false">
      <div class="glass-card p-8 text-center">
        <div class="text-6xl mb-4">🎉</div>
        <div class="text-2xl font-bold text-orange-600 mb-2">恭喜完成任务！</div>
        <div class="text-lg text-gray-600 mb-4">获得 10 个恋爱积分</div>
        <div class="text-4xl font-bold text-orange-500">+10 💰</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const lovePoints = ref(0)
const newTask = ref('')
const tasks = ref([])
const dailyLoveMessage = ref('')
const pomodoroTime = ref(25 * 60)
const pomodoroRunning = ref(false)
let pomodoroInterval = null
const showSuccess = ref(false)

const targetDate = new Date('2026-12-26')

const countdownDays = computed(() => {
  const today = new Date()
  const diffTime = targetDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

const targetDateFormatted = computed(() => {
  return targetDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

const rewards = ref([
  { id: 1, name: '🥤 奶茶一杯', points: 100 },
  { id: 2, name: '🍰 蛋糕一份', points: 150 },
  { id: 3, name: '🎬 看电影约会', points: 300 },
  { id: 4, name: '🎁 神秘礼物', points: 500 }
])

const loveMessages = [
  "坚持就是胜利，我的骄傲！",
  "每一步努力，都在靠近梦想",
  "你是我的超级英雄，永远支持你",
  "专注的你，最迷人",
  "今天的努力，明天的实力",
  "考研路上，我一直在你身边",
  "相信自己的能力，你可以的",
  "每一滴汗水，都是成功的种子",
  "你比想象中更强大",
  "为了我们的未来，加油！",
  "学习辛苦了，休息一下吧",
  "你的坚持，让我感动"
]

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const loadFromStorage = () => {
  try {
    const savedPoints = localStorage.getItem('lovePoints')
    if (savedPoints) lovePoints.value = parseInt(savedPoints)
    
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) tasks.value = JSON.parse(savedTasks)
    
    console.log('Loaded from storage:', { lovePoints: lovePoints.value, tasks: tasks.value.length })
  } catch (error) {
    console.error('Error loading from localStorage:', error)
    localStorage.clear()
    lovePoints.value = 0
    tasks.value = []
  }
}

const saveToStorage = () => {
  localStorage.setItem('lovePoints', lovePoints.value.toString())
  localStorage.setItem('tasks', JSON.stringify(tasks.value))
}

const getDailyLoveMessage = () => {
  const today = new Date().toDateString()
  const savedMessage = localStorage.getItem('dailyLoveMessage')
  const savedDate = localStorage.getItem('dailyMessageDate')
  
  if (savedDate === today && savedMessage) {
    dailyLoveMessage.value = savedMessage
  } else {
    dailyLoveMessage.value = loveMessages[Math.floor(Math.random() * loveMessages.length)]
    localStorage.setItem('dailyLoveMessage', dailyLoveMessage.value)
    localStorage.setItem('dailyMessageDate', today)
  }
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
        resetPomodoro()
        alert('⏰ 专注时间结束！休息一下吧～')
      }
    }, 1000)
  }
}

const resetPomodoro = () => {
  pomodoroRunning.value = false
  pomodoroTime.value = 25 * 60
  clearInterval(pomodoroInterval)
}

const addTask = () => {
  if (newTask.value.trim()) {
    tasks.value.push({
      id: Date.now(),
      text: newTask.value.trim(),
      completed: false
    })
    newTask.value = ''
    saveToStorage()
  }
}

const deleteTask = (id) => {
  tasks.value = tasks.value.filter(task => task.id !== id)
  saveToStorage()
}

const toggleTask = (task) => {
  if (task.completed) {
    lovePoints.value += 10
    saveToStorage()
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 2000)
  }
  saveToStorage()
}

const redeemReward = (reward) => {
  if (lovePoints.value >= reward.points) {
    lovePoints.value -= reward.points
    saveToStorage()
    alert('🎉 成功兑换 ' + reward.name + '！快联系男友兑现吧～')
  }
}

onMounted(() => {
  loadFromStorage()
  getDailyLoveMessage()
})

onUnmounted(() => {
  clearInterval(pomodoroInterval)
})
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(251, 146, 60, 0.25);
}

.jelly-button {
  transition: all 0.2s ease-out;
}

.jelly-button:hover {
  box-shadow: 0 10px 15px -3px rgba(251, 146, 60, 0.3);
}

.jelly-button:active {
  transform: scale(0.95);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #fdba74, #f472b6);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #fb923c, #ec4899);
}

.line-through {
  position: relative;
}

.line-through::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, #9ca3af, #6b7280);
  transform: translateY(-50%);
}

.font-serif {
  font-family: 'Georgia', 'Times New Roman', serif;
}

@media (max-width: 768px) {
  .glass-card {
    padding: 1.5rem;
  }
}
</style>