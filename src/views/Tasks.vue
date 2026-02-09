<template>
  <div class="max-w-7xl mx-auto">
    <div class="glass-card p-8">
      <!-- 标题栏 -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span class="text-3xl animate-bounce-soft">📝</span>
          <span class="text-rainbow">任务管理</span>
        </h2>
        <div class="flex gap-2 flex-wrap items-center">
          <!-- 批量选择按钮 -->
          <button
            v-if="!isBatchMode"
            @click="enterBatchMode"
            class="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all"
            :class="isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-white/50 text-gray-600 hover:bg-white/70'"
          >
            <span>☑️</span>
            <span>批量操作</span>
          </button>
          <button
            v-if="isBatchMode && selectedIds.length > 0"
            @click="exitBatchMode"
            class="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
          >
            <span>✅</span>
            <span>完成选择</span>
          </button>
          <!-- 搜索框 -->
          <div class="relative group">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索..."
              class="px-4 py-2 pl-12 pr-4 bg-white/50 border-2 border-white/30 rounded-full focus:border-orange-400/50 focus:outline-none focus:bg-white/60 transition-all w-40 focus:w-56"
            />
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">🔍</span>
          </div>
          <!-- 排序 -->
          <select
            v-model="sortBy"
            class="px-4 py-2 bg-white/50 border-2 border-white/30 rounded-full focus:border-orange-400/50 focus:outline-none transition-all"
          >
            <option value="newest">最新</option>
            <option value="oldest">最早</option>
            <option value="dueDate">截止日期</option>
            <option value="priority">优先级</option>
          </select>
          <button
            v-for="filter in taskFilters"
            :key="filter.value"
            @click="activeFilter = filter.value"
            :class="activeFilter === filter.value 
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' 
              : 'bg-white/50 text-gray-600 hover:bg-white/70'"
            class="px-4 py-2 rounded-full font-medium transition-all"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- 骨架屏加载状态 -->
      <template v-if="isLoading">
        <SkeletonLoader type="list" :rows="5" :dark-mode="isDarkMode" />
      </template>

      <!-- 真实内容 -->
      <template v-else>
        <!-- 添加任务 -->
        <div class="mb-6">
          <div class="flex gap-3 flex-wrap items-end">
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
              <option value="low">🌱 低</option>
              <option value="medium">⚡ 普通</option>
              <option value="high">🔥 紧急</option>
            </select>
            <!-- 截止日期选择 -->
            <input
              v-model="newTaskDueDate"
              type="date"
              class="px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:border-orange-400/50 focus:outline-none transition-all"
            />
            <button
              @click="addTask"
              class="jelly-button bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg"
            >
              ➕ 添加
            </button>
          </div>
        </div>

        <!-- 任务统计 -->
        <div class="flex gap-4 mb-6 flex-wrap">
          <div class="flex items-center gap-2 px-4 py-2 bg-white/30 rounded-xl">
            <span class="text-xl">📋</span>
            <span class="text-gray-600">共 <strong class="text-orange-600">{{ tasks.length }}</strong> 个</span>
          </div>
          <div class="flex items-center gap-2 px-4 py-2 bg-white/30 rounded-xl">
            <span class="text-xl">✅</span>
            <span class="text-gray-600">完成 <strong class="text-green-600">{{ completedTasksCount }}</strong> 个</span>
          </div>
          <div class="flex items-center gap-2 px-4 py-2 bg-white/30 rounded-xl">
            <span class="text-xl">🔥</span>
            <span class="text-gray-600">进行中 <strong class="text-orange-600">{{ remainingTasksCount }}</strong> 个</span>
          </div>
        </div>

        <!-- 任务列表 -->
        <div class="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div
            v-for="(task, index) in filteredAndSortedTasks"
            :key="task.id"
            class="group relative flex flex-col gap-3 p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20 transition-all hover:bg-white/40 hover:shadow-lg hover:shadow-orange-500/10"
            :class="{
              'ring-2 ring-orange-300': task.priority === 'high',
              'opacity-60': task.completed,
              'ring-2 ring-blue-400': isBatchMode && selectedIds.includes(task.id),
              'border-red-300 bg-red-50/50': isOverdue(task.dueDate) && !task.completed
            }"
          >
            <div class="flex items-center gap-3">
              <!-- 批量选择复选框 -->
              <div v-if="isBatchMode" class="absolute left-0 top-1/2 -translate-y-1/2 pl-2 z-10">
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(task.id)"
                  @change="toggleSelect(task.id)"
                  class="w-5 h-5 text-orange-500 rounded cursor-pointer"
                />
              </div>

              <!-- 优先级指示器 -->
              <div
                :class="{
                  'bg-gradient-to-b from-red-400 to-rose-500': task.priority === 'high',
                  'bg-gradient-to-b from-orange-400 to-amber-500': task.priority === 'medium',
                  'bg-gradient-to-b from-green-400 to-emerald-500': task.priority === 'low'
                }"
                :style="{ left: isBatchMode ? '2.5rem' : '0' }"
                class="w-1 h-16 rounded-full absolute top-1/2 -translate-y-1/2 shadow-lg"
              ></div>
              
              <div 
                class="flex items-center gap-3 flex-1"
                :class="{ 'ml-8': isBatchMode }"
              >
                <div class="relative">
                  <input
                    type="checkbox"
                    :checked="task.completed"
                    :disabled="isBatchMode"
                    @change="toggleTask(task)"
                    class="w-6 h-6 text-orange-500 rounded-lg cursor-pointer disabled:opacity-50 appearance-none w-6 h-6 border-2 border-orange-300 rounded checked:bg-gradient-to-r checked:from-orange-400 checked:to-pink-500 checked:border-0 transition-all"
                  />
                  <span v-if="task.completed" class="absolute inset-0 flex items-center justify-center text-white text-xs">✓</span>
                </div>
                <div class="flex-1">
                  <span
                    :class="task.completed ? 'line-through text-gray-500' : 'text-gray-800'"
                    class="text-lg block font-medium"
                  >
                    {{ task.text }}
                  </span>
                  <div class="flex gap-2 mt-1 flex-wrap items-center">
                    <span v-if="task.category" class="text-xs px-2 py-1 rounded-full bg-white/50 flex items-center gap-1">
                      {{ getCategoryEmoji(task.category) }}
                    </span>
                    <span v-if="task.dueDate" 
                          class="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                          :class="isOverdue(task.dueDate) && !task.completed ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-500'">
                      📅 {{ formatDueDate(task.dueDate) }}
                    </span>
                    <span v-if="task.createdAt" class="text-xs text-gray-400">
                      {{ formatDate(task.createdAt) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- 任务操作按钮 -->
              <div v-if="!isBatchMode" class="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  @click="editTask(task)"
                  class="text-blue-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-100/50 transition-all"
                  title="编辑"
                >
                  ✏️
                </button>
                <button
                  @click="confirmDeleteTask(task)"
                  class="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-100/50 transition-all"
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <!-- 任务备注 -->
            <div v-if="task.notes && !isBatchMode" class="ml-11 p-3 bg-white/20 rounded-xl text-sm text-gray-600 border-l-2 border-orange-300">
              <span class="font-medium">📝</span> {{ task.notes }}
            </div>
          </div>
          
          <div v-if="filteredAndSortedTasks.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4 opacity-50">📋</div>
            <div class="text-gray-500 text-lg">
              {{ searchQuery ? '没有找到匹配的任务' : (activeFilter === 'all' ? '暂无任务，添加你的学习计划吧！' : '没有符合条件的任务') }}
            </div>
            </div>
          </div>

          <!-- 统计 -->
          <div class="mt-6 pt-6 border-t border-white/20">
          <div class="flex justify-around text-center flex-wrap gap-4">
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
              <div class="text-2xl font-bold text-red-600">{{ overdueCount }}</div>
              <div class="text-sm text-gray-500">已过期</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-purple-600">{{ completionRate }}%</div>
              <div class="text-sm text-gray-500">完成率</div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 添加成功提示 -->
    <div v-if="showSuccess" class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg animate-bounce z-50">
      ✨ 任务添加成功！+10 💰
    </div>

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      v-model:visible="showDeleteConfirm"
      title="删除任务"
      subtitle="此操作无法撤销"
      :message="`确定要删除任务「${taskToDelete?.text || ''}」吗？`"
      icon="🗑️"
      icon-type="danger"
      confirm-text="删除"
      confirm-type="danger"
      @confirm="executeDelete"
      @cancel="cancelDelete"
    />

    <!-- 批量删除确认对话框 -->
    <ConfirmDialog
      v-model:visible="showBatchDeleteConfirm"
      title="批量删除"
      subtitle="此操作无法撤销"
      :message="`确定要删除选中的 ${selectedIds.length} 个任务吗？`"
      icon="🗑️"
      icon-type="danger"
      confirm-text="删除"
      confirm-type="danger"
      @confirm="executeBatchDelete"
      @cancel="cancelBatchDelete"
    />

    <!-- 批量完成确认对话框 -->
    <ConfirmDialog
      v-model:visible="showBatchCompleteConfirm"
      title="批量完成"
      :message="`确定要将选中的 ${selectedIds.length} 个任务标记为完成吗？`"
      icon="✅"
      icon-type="success"
      confirm-text="完成"
      confirm-type="primary"
      @confirm="executeBatchComplete"
      @cancel="cancelBatchComplete"
    />

    <!-- 撤销提示 -->
    <UndoToast
      ref="undoToastRef"
      message="任务已删除"
      :undo-text="undoText"
      :duration="5000"
      :on-undo="executeUndo"
      :on-close="clearDeletedTask"
    />

    <!-- 批量操作栏 -->
    <BatchActionsBar
      :visible="isBatchMode"
      :selected-ids="selectedIds"
      :total-count="filteredTasks.length"
      :show-complete="pendingTasks.length > 0"
      delete-text="确定删除所选任务？"
      @toggle-select-all="toggleSelectAll"
      @complete="confirmBatchComplete"
      @delete="confirmBatchDelete"
      @cancel="exitBatchMode"
    />

    <!-- 编辑任务对话框 -->
    <div v-if="showEditDialog" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click.self="showEditDialog = false">
      <div class="glass-card p-6 w-full max-w-md mx-4 animate-scale-in">
        <h3 class="text-xl font-bold text-gray-800 mb-4">编辑任务</h3>
        <input
          v-model="editingTask.text"
          type="text"
          class="w-full px-4 py-3 bg-white/50 border-2 border-white/30 rounded-xl focus:border-orange-400 focus:outline-none mb-4"
        />
        <textarea
          v-model="editingTask.notes"
          placeholder="添加备注..."
          class="w-full px-4 py-3 bg-white/50 border-2 border-white/30 rounded-xl focus:border-orange-400 focus:outline-none mb-4 resize-none"
          rows="3"
        ></textarea>
        <div class="flex gap-3">
          <button @click="showEditDialog = false" class="flex-1 py-3 rounded-xl font-bold bg-white/40 text-gray-600 hover:bg-white/60 transition-all">
            取消
          </button>
          <button @click="saveTaskEdit" class="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90 transition-all">
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import UndoToast from '../components/UndoToast.vue'
import BatchActionsBar from '../components/BatchActionsBar.vue'

const emit = defineEmits(['updatePoints'])

// 基础状态
const tasks = ref([])
const newTask = ref('')
const newTaskCategory = ref('')
const newTaskPriority = ref('medium')
const newTaskDueDate = ref('')
const activeFilter = ref('all')
const searchQuery = ref('')
const sortBy = ref('newest')
const showSuccess = ref(false)
const isLoading = ref(true)
const isDarkMode = ref(false)

// 批量操作状态
const isBatchMode = ref(false)
const selectedIds = ref([])

// 删除确认状态
const showDeleteConfirm = ref(false)
const taskToDelete = ref(null)

// 批量删除确认状态
const showBatchDeleteConfirm = ref(false)

// 批量完成确认状态
const showBatchCompleteConfirm = ref(false)

// 撤销功能状态
const deletedTask = ref(null)
const undoText = ref('撤销')
const undoToastRef = ref(null)

// 编辑任务状态
const showEditDialog = ref(false)
const editingTask = ref({ id: null, text: '', notes: '' })

// 分类和过滤器
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

// 计算属性
const filteredTasks = computed(() => {
  let result = tasks.value
  
  if (activeFilter.value === 'pending') {
    result = result.filter(t => !t.completed)
  } else if (activeFilter.value === 'completed') {
    result = result.filter(t => t.completed)
  }
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(t => t.text.toLowerCase().includes(query))
  }
  
  return result
})

const filteredAndSortedTasks = computed(() => {
  const result = [...filteredTasks.value]
  
  switch (sortBy.value) {
    case 'newest':
      result.sort((a, b) => b.id - a.id)
      break
    case 'oldest':
      result.sort((a, b) => a.id - b.id)
      break
    case 'dueDate':
      result.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      })
      break
    case 'priority':
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      break
  }
  
  return result
})

const pendingTasks = computed(() => {
  return filteredTasks.value.filter(t => !t.completed)
})

const completedCount = computed(() => tasks.value.filter(t => t.completed).length)
const pendingCount = computed(() => tasks.value.filter(t => !t.completed).length)
const completedTasksCount = computed(() => completedCount.value)
const remainingTasksCount = computed(() => pendingCount.value)

const overdueCount = computed(() => {
  return tasks.value.filter(t => isOverdue(t.dueDate) && !t.completed).length
})

const completionRate = computed(() => {
  if (tasks.value.length === 0) return 0
  return Math.round((completedCount.value / tasks.value.length) * 100)
})

// 辅助函数
const getCategoryEmoji = (category) => {
  const cat = taskCategories.find(c => c.value === category)
  return cat ? cat.emoji : '📌'
}

const getCategoryLabel = (category) => {
  const cat = taskCategories.find(c => c.value === category)
  return cat ? cat.label : ''
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const formatDueDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return '明天'
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
}

const isOverdue = (dateStr) => {
  if (!dateStr) return false
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

// 添加任务
const addTask = () => {
  if (newTask.value.trim()) {
    tasks.value.push({
      id: Date.now(),
      text: newTask.value.trim(),
      completed: false,
      category: newTaskCategory.value,
      priority: newTaskPriority.value,
      dueDate: newTaskDueDate.value,
      notes: '',
      createdAt: new Date().toISOString()
    })
    newTask.value = ''
    newTaskCategory.value = ''
    newTaskPriority.value = 'medium'
    newTaskDueDate.value = ''
    saveToStorage()
    showSuccess.value = true
    setTimeout(() => showSuccess.value = false, 2000)
  }
}

// 编辑任务
const editTask = (task) => {
  editingTask.value = { id: task.id, text: task.text, notes: task.notes || '' }
  showEditDialog.value = true
}

const saveTaskEdit = () => {
  const task = tasks.value.find(t => t.id === editingTask.value.id)
  if (task) {
    task.text = editingTask.value.text
    task.notes = editingTask.value.notes
    saveToStorage()
  }
  showEditDialog.value = false
}

// ========== 删除功能（带确认和撤销）==========
const confirmDeleteTask = (task) => {
  taskToDelete.value = task
  showDeleteConfirm.value = true
}

const executeDelete = () => {
  if (taskToDelete.value) {
    // 保存删除的任务用于撤销
    deletedTask.value = { ...taskToDelete.value }
    
    // 从列表中移除
    tasks.value = tasks.value.filter(t => t.id !== taskToDelete.value.id)
    saveToStorage()
    
    // 显示撤销提示
    showUndoToast()
  }
  cancelDelete()
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  taskToDelete.value = null
}

// 撤销功能
const showUndoToast = () => {
  undoToastRef.value?.show()
}

const executeUndo = () => {
  if (deletedTask.value) {
    // 恢复删除的任务
    tasks.value.push(deletedTask.value)
    // 按时间排序
    tasks.value.sort((a, b) => a.id - b.id)
    saveToStorage()
    clearDeletedTask()
  }
}

const clearDeletedTask = () => {
  deletedTask.value = null
}

// ========== 切换任务状态 ==========
const toggleTask = (task) => {
  if (task.completed) {
    const currentPoints = parseInt(localStorage.getItem('lovePoints') || '0')
    localStorage.setItem('lovePoints', (currentPoints + 10).toString())
    addPointsRecord(10, '完成任务', '✅')
    emit('updatePoints')
  }
  saveToStorage()
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
    // 只保留最近100条
    if (pointsHistory.length > 100) {
      pointsHistory.splice(100)
    }
    localStorage.setItem('pointsHistory', JSON.stringify(pointsHistory))
  } catch (error) {
    console.error('Error saving points history:', error)
  }
}

// ========== 批量操作功能 ==========
const enterBatchMode = () => {
  isBatchMode.value = true
  selectedIds.value = []
}

const exitBatchMode = () => {
  isBatchMode.value = false
  selectedIds.value = []
}

const toggleSelect = (taskId) => {
  const index = selectedIds.value.indexOf(taskId)
  if (index === -1) {
    selectedIds.value.push(taskId)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

const toggleSelectAll = () => {
  if (selectedIds.value.length === filteredTasks.value.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredTasks.value.map(t => t.id)
  }
}

// 批量删除确认
const confirmBatchDelete = () => {
  if (selectedIds.value.length > 0) {
    showBatchDeleteConfirm.value = true
  }
}

const executeBatchDelete = () => {
  // 保存删除的任务列表用于撤销
  deletedTask.value = {
    isBatch: true,
    tasks: filteredTasks.value.filter(t => selectedIds.value.includes(t.id)).map(t => ({ ...t }))
  }
  
  // 批量删除
  tasks.value = tasks.value.filter(t => !selectedIds.value.includes(t.id))
  saveToStorage()
  
  // 显示撤销提示
  undoText.value = `撤销删除 (${deletedTask.value.tasks.length}个)`
  showUndoToast()
  
  exitBatchMode()
  cancelBatchDelete()
}

const cancelBatchDelete = () => {
  showBatchDeleteConfirm.value = false
}

// 批量完成确认
const confirmBatchComplete = () => {
  if (selectedIds.value.length > 0) {
    showBatchCompleteConfirm.value = true
  }
}

const executeBatchComplete = () => {
  let completedCount = 0
  // 批量更新状态
  tasks.value.forEach(task => {
    if (selectedIds.value.includes(task.id) && !task.completed) {
      task.completed = true
      completedCount++
      // 添加积分
      const currentPoints = parseInt(localStorage.getItem('lovePoints') || '0')
      localStorage.setItem('lovePoints', (currentPoints + 10).toString())
    }
  })
  if (completedCount > 0) {
    addPointsRecord(10 * completedCount, `批量完成任务 (${completedCount}个)`, '📋')
  }
  emit('updatePoints')
  saveToStorage()
  
  exitBatchMode()
  cancelBatchComplete()
}

const cancelBatchComplete = () => {
  showBatchCompleteConfirm.value = false
}

// ========== 存储功能 ==========
const saveToStorage = () => {
  localStorage.setItem('tasks', JSON.stringify(tasks.value))
}

const loadTasks = () => {
  isLoading.value = true
  
  try {
    const saved = localStorage.getItem('tasks')
    if (saved) {
      tasks.value = JSON.parse(saved)
    }
    
    isDarkMode.value = document.documentElement.classList.contains('dark')
  } catch (error) {
    console.error('Error loading tasks:', false)
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 300)
  }
}

// 初始化
onMounted(loadTasks)
</script>
