<template>
  <div class="max-w-7xl mx-auto">
    <div class="grid md:grid-cols-2 gap-6">
      <!-- 考研倒计时卡片 -->
      <div class="glass-card p-8 flex flex-col items-center justify-center text-center">
        <div class="text-6xl mb-4">📚</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">考研倒计时</h2>
        <div class="text-orange-600 font-bold text-7xl mb-2">{{ countdownDays }}</div>
        <div class="text-gray-600 text-lg mb-2">天</div>
        <div class="text-gray-500 text-sm">{{ targetDateFormatted }}</div>
        
        <!-- 进度条 -->
        <div class="w-full mt-4">
          <div class="flex justify-between text-xs text-gray-500 mb-1">
            <span>准备进度</span>
            <span>{{ progressPercentage }}%</span>
          </div>
          <div class="h-3 bg-white/30 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 每日鼓励语 -->
      <div class="glass-card p-8 flex flex-col justify-center">
        <div class="text-3xl mb-4">💕</div>
        <div class="text-2xl font-serif text-gray-700 italic leading-relaxed text-center">
          "{{ dailyLoveMessage }}"
        </div>
      </div>

      <!-- 今日概览 -->
      <div class="glass-card p-8">
        <h3 class="text-xl font-bold text-gray-800 mb-4">📊 今日概览</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center p-4 bg-white/30 rounded-xl">
            <div class="text-2xl font-bold text-orange-600">{{ todayFocusMinutes }}</div>
            <div class="text-sm text-gray-500">专注分钟</div>
          </div>
          <div class="text-center p-4 bg-white/30 rounded-xl">
            <div class="text-2xl font-bold text-green-600">{{ todayTasks }}</div>
            <div class="text-sm text-gray-500">完成任务</div>
          </div>
          <div class="text-center p-4 bg-white/30 rounded-xl">
            <div class="text-2xl font-bold text-blue-600">{{ todayCheckins }}</div>
            <div class="text-sm text-gray-500">习惯打卡</div>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="glass-card p-8">
        <h3 class="text-xl font-bold text-gray-800 mb-4">⚡ 快捷操作</h3>
        <div class="grid grid-cols-2 gap-3">
          <router-link to="/focus" class="flex items-center gap-3 p-4 bg-white/30 rounded-xl hover:bg-white/50 transition-all">
            <span class="text-2xl">⏱️</span>
            <span class="font-medium">开始专注</span>
          </router-link>
          <router-link to="/tasks" class="flex items-center gap-3 p-4 bg-white/30 rounded-xl hover:bg-white/50 transition-all">
            <span class="text-2xl">📝</span>
            <span class="font-medium">添加任务</span>
          </router-link>
          <router-link to="/checkin" class="flex items-center gap-3 p-4 bg-white/30 rounded-xl hover:bg-white/50 transition-all">
            <span class="text-2xl">📅</span>
            <span class="font-medium">今日打卡</span>
          </router-link>
          <router-link to="/journal" class="flex items-center gap-3 p-4 bg-white/30 rounded-xl hover:bg-white/50 transition-all">
            <span class="text-2xl">📔</span>
            <span class="font-medium">写心得</span>
          </router-link>
        </div>
      </div>

      <!-- 最近任务 -->
      <div class="glass-card p-8 md:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-800">📝 最近任务</h3>
          <router-link to="/tasks" class="text-orange-500 hover:text-orange-600 text-sm">查看全部</router-link>
        </div>
        <div v-if="recentTasks.length > 0" class="space-y-3">
          <div
            v-for="task in recentTasks.slice(0, 3)"
            :key="task.id"
            class="flex items-center gap-3 p-3 bg-white/30 rounded-xl"
          >
            <input
              type="checkbox"
              :checked="task.completed"
              disabled
              class="w-5 h-5 text-orange-500 rounded-lg"
            />
            <span :class="task.completed ? 'line-through text-gray-500' : 'text-gray-800'" class="flex-1">
              {{ task.text }}
            </span>
            <span v-if="task.category" class="text-sm px-2 py-1 rounded-full bg-white/50">
              {{ getCategoryEmoji(task.category) }}
            </span>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-4">
          暂无任务，去添加一些吧！
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'

const tasks = ref([])
const dailyLoveMessage = ref('')

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

const taskCategories = [
  { value: 'study', label: '学习', emoji: '📚' },
  { value: 'english', label: '英语', emoji: '🔤' },
  { value: 'politics', label: '政治', emoji: '📰' },
  { value: 'major', label: '专业课', emoji: '🎓' }
]

const getCategoryEmoji = (category) => {
  const cat = taskCategories.find(c => c.value === category)
  return cat ? cat.emoji : '📌'
}

const recentTasks = computed(() => {
  return tasks.value.slice().sort((a, b) => b.id - a.id)
})

const todayFocusMinutes = ref(0)
const todayTasks = computed(() => {
  return tasks.value.filter(t => t.completed).length
})
const todayCheckins = ref(0)

const targetDate = new Date('2026-12-26')

const countdownDays = computed(() => {
  const today = new Date()
  const diffTime = targetDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
})

const progressPercentage = computed(() => {
  const startDate = new Date('2025-01-01')
  const today = new Date()
  const totalTime = targetDate - startDate
  const elapsedTime = today - startDate
  const progress = (elapsedTime / totalTime) * 100
  return Math.min(100, Math.max(0, progress)).toFixed(1)
})

const targetDateFormatted = computed(() => {
  return targetDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

const loadData = () => {
  try {
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      tasks.value = JSON.parse(savedTasks)
    }
    
    const today = new Date().toDateString()
    const savedMessage = localStorage.getItem('dailyMessage')
    const savedDate = localStorage.getItem('dailyMessageDate')
    
    if (savedDate === today && savedMessage) {
      dailyLoveMessage.value = savedMessage
    } else {
      dailyLoveMessage.value = loveMessages[Math.floor(Math.random() * loveMessages.length)]
      localStorage.setItem('dailyMessage', dailyLoveMessage.value)
      localStorage.setItem('dailyMessageDate', today)
    }
    
    const focusData = localStorage.getItem('focusHistory')
    if (focusData) {
      const data = JSON.parse(focusData)
      if (data[today]) {
        todayFocusMinutes.value = data[today].minutes || 0
      }
    }
    
    const checkinData = localStorage.getItem('checkinHistory')
    if (checkinData) {
      const data = JSON.parse(checkinData)
      if (data[today]) {
        todayCheckins.value = data[today].total || 0
      }
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

onMounted(loadData)
</script>
