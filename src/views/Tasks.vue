<template>
  <div class="max-w-7xl mx-auto">
    <div class="glass-card p-8">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 class="text-2xl font-bold text-gray-800">📝 任务管理</h2>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="filter in taskFilters"
            :key="filter.value"
            @click="activeFilter = filter.value"
            :class="activeFilter === filter.value ? 'bg-orange-500 text-white' : 'bg-white/50 text-gray-600 hover:bg-white/70'"
            class="px-4 py-2 rounded-full font-medium transition-all"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- 添加任务 -->
      <div class="mb-6">
        <div class="flex gap-3 flex-wrap">
          <input
            v-model="newTask"
            @keyup.enter="addTask"
            type="text"
            placeholder="添加新任务..."
            class="flex-1 min-w-[200px] px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:border-orange-400/50 focus:outline-none focus:bg-white/60 transition-all"
          />
          <select
            v-model="newTaskCategory"
            class="px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:border-orange-400/50 focus:outline-none transition-all"
          >
            <option value="">分类</option>
            <option v-for="cat in taskCategories" :key="cat.value" :value="cat.value">
              {{ cat.emoji }} {{ cat.label }}
            </option>
          </select>
          <select
            v-model="newTaskPriority"
            class="px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:border-orange-400/50 focus:outline-none transition-all"
          >
            <option value="medium">⚡ 普通</option>
            <option value="high">🔥 紧急</option>
            <option value="low">🌱 低优先</option>
          </select>
          <button
            @click="addTask"
            class="jelly-button bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg"
          >
            ➕ 添加
          </button>
        </div>
      </div>

      <!-- 任务列表 -->
      <div class="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="relative flex items-center gap-3 p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20 transition-all hover:bg-white/40 hover:shadow-md"
          :class="{'ring-2 ring-orange-300': task.priority === 'high', 'opacity-60': task.completed}"
        >
          <!-- 优先级指示器 -->
          <div
            :class="{
              'bg-red-400': task.priority === 'high',
              'bg-orange-400': task.priority === 'medium',
              'bg-green-400': task.priority === 'low'
            }"
            class="w-1 h-16 rounded-full absolute left-0 top-1/2 -translate-y-1/2"
          ></div>
          
          <div class="ml-4 flex items-center gap-3 flex-1">
            <input
              type="checkbox"
              v-model="task.completed"
              @change="toggleTask(task)"
              class="w-6 h-6 text-orange-500 rounded-lg cursor-pointer"
            />
            <div class="flex-1">
              <span
                :class="task.completed ? 'line-through text-gray-500' : 'text-gray-800'"
                class="text-lg block"
              >
                {{ task.text }}
              </span>
              <div class="flex gap-2 mt-1">
                <span v-if="task.category" class="text-xs px-2 py-1 rounded-full bg-white/50">
                  {{ getCategoryEmoji(task.category) }} {{ getCategoryLabel(task.category) }}
                </span>
                <span v-if="task.createdAt" class="text-xs text-gray-400">
                  {{ formatDate(task.createdAt) }}
                </span>
              </div>
            </div>
          </div>
          <button
            @click="deleteTask(task.id)"
            class="text-red-400 hover:text-red-600 font-bold p-3 rounded-xl hover:bg-red-100/50 transition-all"
          >
            🗑️
          </button>
        </div>
        
        <div v-if="filteredTasks.length === 0" class="text-center text-gray-500 py-12">
          {{ activeFilter === 'all' ? '暂无任务，添加你的学习计划吧！' : '没有符合条件的任务' }}
        </div>
      </div>

      <!-- 统计 -->
      <div class="mt-6 pt-6 border-t border-white/20">
        <div class="flex justify-around text-center">
          <div>
            <div class="text-2xl font-bold text-orange-600">{{ tasks.length }}</div>
            <div class="text-sm text-gray-500">总任务</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600">{{ completedCount }}</div>
            <div class="text-sm text-gray-500">已完成</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-blue-600">{{ pendingCount }}</div>
            <div class="text-sm text-gray-500">待完成</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-purple-600">{{ completionRate }}%</div>
            <div class="text-sm text-gray-500">完成率</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加成功提示 -->
    <div v-if="showSuccess" class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg animate-bounce z-50">
      ✨ 任务添加成功！+10 💰
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['updatePoints'])

const tasks = ref([])
const newTask = ref('')
const newTaskCategory = ref('')
const newTaskPriority = ref('medium')
const activeFilter = ref('all')
const showSuccess = ref(false)

const taskCategories = [
  { value: 'study', label: '学习', emoji: '📚' },
  { value: 'english', label: '英语', emoji: '🔤' },
  { value: 'politics', label: '政治', emoji: '📰' },
  { value: 'major', label: '专业课', emoji: '🎓' },
  { value: 'exercise', label: '运动', emoji: '🏃' },
  { value: 'rest', label: '休息', emoji: '😴' }
]

const taskFilters = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待完成' },
  { value: 'completed', label: '已完成' }
]

const filteredTasks = computed(() => {
  if (activeFilter.value === 'all') return tasks.value
  if (activeFilter.value === 'pending') return tasks.value.filter(t => !t.completed)
  if (activeFilter.value === 'completed') return tasks.value.filter(t => t.completed)
  return tasks.value
})

const completedCount = computed(() => tasks.value.filter(t => t.completed).length)
const pendingCount = computed(() => tasks.value.filter(t => !t.completed).length)
const completionRate = computed(() => {
  if (tasks.value.length === 0) return 0
  return Math.round((completedCount.value / tasks.value.length) * 100)
})

const getCategoryEmoji = (category) => {
  const cat = taskCategories.find(c => c.value === category)
  return cat ? cat.emoji : '📌'
}

const getCategoryLabel = (category) => {
  const cat = taskCategories.find(c => c.value === category)
  return cat ? cat.label : ''
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const addTask = () => {
  if (newTask.value.trim()) {
    tasks.value.push({
      id: Date.now(),
      text: newTask.value.trim(),
      completed: false,
      category: newTaskCategory.value,
      priority: newTaskPriority.value,
      createdAt: new Date().toISOString()
    })
    newTask.value = ''
    newTaskCategory.value = ''
    newTaskPriority.value = 'medium'
    saveToStorage()
    showSuccess.value = true
    setTimeout(() => showSuccess.value = false, 2000)
  }
}

const deleteTask = (id) => {
  tasks.value = tasks.value.filter(task => task.id !== id)
  saveToStorage()
}

const toggleTask = (task) => {
  if (task.completed) {
    const currentPoints = parseInt(localStorage.getItem('lovePoints') || '0')
    localStorage.setItem('lovePoints', (currentPoints + 10).toString())
    emit('updatePoints')
  }
  saveToStorage()
}

const saveToStorage = () => {
  localStorage.setItem('tasks', JSON.stringify(tasks.value))
}

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

// 初始化
loadTasks()
</script>
