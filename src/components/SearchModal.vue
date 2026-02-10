<template>
  <Teleport to="body">
    <Transition name="search-modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close"></div>
        
        <!-- Search Modal -->
        <div 
          class="relative w-full max-w-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
          :class="{ 'ring-2 ring-orange-400/50': isFocused }"
        >
          <!-- Search Input -->
          <div class="flex items-center px-4 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <span class="text-xl mr-3">🔍</span>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="搜索任务、习惯、笔记、成就..."
              class="flex-1 bg-transparent text-lg text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none"
              @keydown.down.prevent="moveSelection(1)"
              @keydown.up.prevent="moveSelection(-1)"
              @keydown.enter.prevent="selectResult"
              @keydown.escape="close"
              @focus="isFocused = true"
              @blur="isFocused = false"
            />
            <kbd class="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-500 dark:text-gray-400">
              <span>ESC</span>
            </kbd>
          </div>
          
          <!-- Results -->
          <div v-if="searchQuery.trim()" class="max-h-[60vh] overflow-y-auto py-2">
            <!-- Task Results -->
            <div v-if="taskResults.length > 0" class="mb-2">
              <div class="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                📝 任务 ({{ taskResults.length }})
              </div>
              <div
                v-for="(task, index) in taskResults"
                :key="'task-' + task.id"
                class="px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all flex items-center gap-3"
                :class="selectedIndex === getGlobalIndex('task', index) 
                  ? 'bg-orange-100 dark:bg-orange-900/30 ring-1 ring-orange-300 dark:ring-orange-700' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'"
                @click="navigateToTask(task)"
                @mouseenter="selectedIndex = getGlobalIndex('task', index)"
              >
                <input 
                  type="checkbox" 
                  :checked="task.completed" 
                  disabled
                  class="w-5 h-5 text-orange-500 rounded cursor-pointer appearance-none w-5 h-5 border-2 border-gray-300 rounded checked:bg-orange-500 checked:border-0"
                />
                <div class="flex-1">
                  <div :class="task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white'" class="font-medium">
                    {{ task.text }}
                  </div>
                  <div v-if="task.category" class="text-xs text-gray-500 mt-0.5">
                    {{ getCategoryLabel(task.category) }}
                  </div>
                </div>
                <span v-if="task.priority === 'high'" class="text-red-500">🔥</span>
              </div>
            </div>
            
            <!-- Habit Results -->
            <div v-if="habitResults.length > 0" class="mb-2">
              <div class="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                🎯 习惯 ({{ habitResults.length }})
              </div>
              <div
                v-for="(habit, index) in habitResults"
                :key="'habit-' + habit.id"
                class="px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all flex items-center gap-3"
                :class="selectedIndex === getGlobalIndex('habit', index) 
                  ? 'bg-orange-100 dark:bg-orange-900/30 ring-1 ring-orange-300 dark:ring-orange-700' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'"
                @click="navigateToCheckin"
                @mouseenter="selectedIndex = getGlobalIndex('habit', index)"
              >
                <div 
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  :style="{ background: habit.todayCompleted ? habit.color : 'rgba(255,255,255,0.5)' }"
                >
                  <span :style="{ color: habit.todayCompleted ? 'white' : 'inherit' }">{{ habit.icon }}</span>
                </div>
                <div class="flex-1">
                  <div class="font-medium text-gray-800 dark:text-white">{{ habit.name }}</div>
                  <div class="text-xs text-gray-500">连续 {{ habit.streak }} 天</div>
                </div>
                <span v-if="habit.todayCompleted" class="text-green-500">✓</span>
              </div>
            </div>
            
            <!-- Journal Results -->
            <div v-if="journalResults.length > 0" class="mb-2">
              <div class="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                💭 心得 ({{ journalResults.length }})
              </div>
              <div
                v-for="(entry, index) in journalResults"
                :key="'journal-' + entry.id"
                class="px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all"
                :class="selectedIndex === getGlobalIndex('journal', index) 
                  ? 'bg-orange-100 dark:bg-orange-900/30 ring-1 ring-orange-300 dark:ring-orange-700' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'"
                @click="navigateToJournal"
                @mouseenter="selectedIndex = getGlobalIndex('journal', index)"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-lg">{{ getMoodEmoji(entry.mood) }}</span>
                  <span class="text-xs text-gray-500">{{ formatDate(entry.date) }}</span>
                </div>
                <div class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {{ entry.content }}
                </div>
              </div>
            </div>
            
            <!-- Achievement Results -->
            <div v-if="achievementResults.length > 0" class="mb-2">
              <div class="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                🏆 成就 ({{ achievementResults.length }})
              </div>
              <div
                v-for="(achievement, index) in achievementResults"
                :key="'achievement-' + achievement.id"
                class="px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all flex items-center gap-3"
                :class="selectedIndex === getGlobalIndex('achievement', index) 
                  ? 'bg-orange-100 dark:bg-orange-900/30 ring-1 ring-orange-300 dark:ring-orange-700' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'"
                @click="navigateToAchievements"
                @mouseenter="selectedIndex = getGlobalIndex('achievement', index)"
              >
                <span class="text-2xl">{{ achievement.icon }}</span>
                <div class="flex-1">
                  <div class="font-medium text-gray-800 dark:text-white">{{ achievement.name }}</div>
                  <div class="text-xs text-gray-500">{{ achievement.description }}</div>
                </div>
                <span v-if="achievement.unlocked" class="text-yellow-500">⭐</span>
              </div>
            </div>
            
            <!-- No Results -->
            <div v-if="totalResults === 0" class="px-4 py-8 text-center">
              <span class="text-4xl mb-3 block">🔍</span>
              <p class="text-gray-500 dark:text-gray-400">没有找到"{{ searchQuery }}"相关的结果</p>
            </div>
          </div>
          
          <!-- Initial State -->
          <div v-else class="px-4 py-6">
            <div class="text-center mb-4">
              <span class="text-4xl mb-2 block">🔍</span>
              <p class="text-gray-600 dark:text-gray-300">输入关键词搜索</p>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="px-3 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-gray-600 dark:text-gray-400">
                💡 快捷键: <kbd class="font-mono bg-gray-200 dark:bg-gray-600 px-1 rounded">Ctrl K</kbd>
              </div>
              <div class="px-3 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-gray-600 dark:text-gray-400">
                ⌨️ 导航: <kbd class="font-mono bg-gray-200 dark:bg-gray-600 px-1 rounded">↑↓</kbd>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="px-4 py-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1">
                <kbd class="font-mono bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">↵</kbd>
                选择
              </span>
              <span class="flex items-center gap-1">
                <kbd class="font-mono bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">↑↓</kbd>
                导航
              </span>
            </div>
            <div class="flex items-center gap-1">
              <span>按</span>
              <kbd class="font-mono bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">ESC</kbd>
              <span>关闭</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const searchQuery = ref('')
const searchInput = ref(null)
const isFocused = ref(false)
const selectedIndex = ref(-1)

// Load data from localStorage
const tasks = ref([])
const habits = ref([])
const journal = ref([])
const achievements = ref([])

const loadData = () => {
  try {
    tasks.value = JSON.parse(localStorage.getItem('tasks') || '[]')
    habits.value = JSON.parse(localStorage.getItem('habits') || '[]')
    journal.value = JSON.parse(localStorage.getItem('journal') || '[]')
    achievements.value = JSON.parse(localStorage.getItem('achievements') || '[]')
  } catch (e) {
    console.error('Error loading search data:', e)
  }
}

// Search results
const taskResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  const query = searchQuery.value.toLowerCase()
  return tasks.value.filter(t => t.text.toLowerCase().includes(query))
})

const habitResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  const query = searchQuery.value.toLowerCase()
  return habits.value.filter(h => h.name.toLowerCase().includes(query))
})

const journalResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  const query = searchQuery.value.toLowerCase()
  return journal.value.filter(j => 
    j.content.toLowerCase().includes(query) || 
    (j.mood && j.mood.toLowerCase().includes(query))
  )
})

const achievementResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  const query = searchQuery.value.toLowerCase()
  return achievements.value.filter(a => 
    a.name.toLowerCase().includes(query) || 
    a.description.toLowerCase().includes(query)
  )
})

const totalResults = computed(() => {
  return taskResults.value.length + habitResults.value.length + 
         journalResults.value.length + achievementResults.value.length
})

// Get global index for selection
const getGlobalIndex = (type, index) => {
  let offset = 0
  if (type === 'task') return index
  offset += taskResults.value.length
  if (type === 'habit') return offset + index
  offset += habitResults.value.length
  if (type === 'journal') return offset + index
  offset += journalResults.value.length
  return offset + index
}

// Move selection
const moveSelection = (direction) => {
  const total = totalResults.value
  if (total === 0) {
    selectedIndex.value = -1
    return
  }
  
  selectedIndex.value = (selectedIndex.value + direction + total) % total
}

// Select result
const selectResult = () => {
  if (selectedIndex.value < 0) return
  
  let current = 0
  
  if (selectedIndex.value < taskResults.value.length) {
    const task = taskResults.value[selectedIndex.value]
    navigateToTask(task)
  }
  current += taskResults.value.length
  
  if (selectedIndex.value < current + habitResults.value.length) {
    navigateToCheckin()
  }
  current += habitResults.value.length
  
  if (selectedIndex.value < current + journalResults.value.length) {
    navigateToJournal()
  }
  current += journalResults.value.length
  
  if (selectedIndex.value < current + achievementResults.value.length) {
    navigateToAchievements()
  }
}

// Navigation
const navigateToTask = (task) => {
  router.push('/tasks')
  close()
}

const navigateToCheckin = () => {
  router.push('/checkin')
  close()
}

const navigateToJournal = () => {
  router.push('/journal')
  close()
}

const navigateToAchievements = () => {
  router.push('/achievements')
  close()
}

// Close
const close = () => {
  isOpen.value = false
  searchQuery.value = ''
  selectedIndex.value = -1
}

// Keyboard shortcuts
const handleKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    isOpen.value = true
    nextTick(() => searchInput.value?.focus())
  }
}

// Focus input when opened
watch(isOpen, (val) => {
  if (val) {
    loadData()
    nextTick(() => searchInput.value?.focus())
    selectedIndex.value = -1
  }
})

// Helper functions
const getCategoryLabel = (category) => {
  const labels = {
    study: '📚 学习',
    english: '🔤 英语',
    politics: '📰 政治',
    major: '🎓 专业课',
    exercise: '🏃 运动',
    rest: '😴 休息'
  }
  return labels[category] || category
}

const getMoodEmoji = (mood) => {
  const moods = {
    happy: '😊',
    excited: '🤩',
    calm: '😌',
    tired: '😓',
    anxious: '😰',
    motivated: '💪'
  }
  return moods[mood] || '📝'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.search-modal-enter-active,
.search-modal-leave-active {
  transition: all 0.2s ease;
}

.search-modal-enter-from,
.search-modal-leave-to {
  opacity: 0;
}

.search-modal-enter-from > div:nth-child(2),
.search-modal-leave-to > div:nth-child(2) {
  transform: scale(0.95) translateY(-20px);
}

.search-modal-enter-to > div:nth-child(2),
.search-modal-leave-from > div:nth-child(2) {
  transform: scale(1) translateY(0);
}

/* Custom scrollbar */
.max-h-\[60vh\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[60vh\]::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-\[60vh\]::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.max-h-\[60vh\]::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style>
