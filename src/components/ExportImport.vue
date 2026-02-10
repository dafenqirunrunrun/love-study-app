<template>
  <div class="glass-card p-6">
    <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
      <span class="text-2xl">💾</span>
      <span class="text-rainbow">数据备份</span>
    </h3>
    
    <div class="space-y-4">
      <!-- 备份时间 -->
      <div class="flex items-center justify-between p-4 bg-white/30 dark:bg-gray-700/30 rounded-xl">
        <div class="flex items-center gap-3">
          <span class="text-2xl">📅</span>
          <div>
            <div class="font-medium text-gray-800 dark:text-white">上次备份</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ lastBackupTime || '暂无备份记录' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 导出数据 -->
      <div class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
        <div class="flex items-start gap-4">
          <div class="text-3xl">📤</div>
          <div class="flex-1">
            <h4 class="font-bold text-gray-800 dark:text-white mb-1">导出数据</h4>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
              将所有学习数据导出为JSON文件，保存到本地
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                @click="exportData"
                :disabled="isExporting"
                class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                <span v-if="isExporting" class="animate-spin">⏳</span>
                <span v-else>📥</span>
                <span>{{ isExporting ? '导出中...' : '导出全部数据' }}</span>
              </button>
              <button
                @click="selectExportTypes"
                class="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-white/70 dark:hover:bg-gray-600/50 transition-all"
              >
                <span>⚙️</span>
                <span>选择类型</span>
              </button>
            </div>
            <!-- 导出选项 -->
            <div v-if="showExportOptions" class="mt-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择导出内容：</div>
              <div class="flex flex-wrap gap-2">
                <label 
                  v-for="type in exportTypes" 
                  :key="type.key"
                  class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-700 rounded-lg cursor-pointer transition-all"
                  :class="selectedExportTypes.includes(type.key) ? 'ring-2 ring-green-400' : ''"
                >
                  <input 
                    type="checkbox" 
                    :value="type.key"
                    v-model="selectedExportTypes"
                    class="w-4 h-4 text-green-500 rounded"
                  />
                  <span class="text-sm">{{ type.icon }} {{ type.label }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 导入数据 -->
      <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
        <div class="flex items-start gap-4">
          <div class="text-3xl">📥</div>
          <div class="flex-1">
            <h4 class="font-bold text-gray-800 dark:text-white mb-1">导入数据</h4>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
              从之前导出的JSON文件恢复数据
            </p>
            <div class="flex items-center gap-3">
              <label 
                class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:opacity-90 transition-all cursor-pointer"
                :class="{ 'opacity-50': isImporting }"
              >
                <input 
                  type="file" 
                  accept=".json"
                  @change="importData"
                  :disabled="isImporting"
                  class="hidden"
                />
                <span v-if="isImporting" class="animate-spin">⏳</span>
                <span v-else>📤</span>
                <span>{{ isImporting ? '导入中...' : '选择文件导入' }}</span>
              </label>
              <span v-if="importFileName" class="text-sm text-gray-600 dark:text-gray-300">
                📄 {{ importFileName }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 警告信息 -->
      <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
        <div class="flex items-start gap-3">
          <span class="text-xl">⚠️</span>
          <div class="text-sm text-amber-800 dark:text-amber-200">
            <div class="font-bold mb-1">注意事项</div>
            <ul class="list-disc list-inside space-y-1">
              <li>导入数据会覆盖现有数据，请谨慎操作</li>
              <li>建议在导入前先导出当前数据作为备份</li>
              <li>仅支持导入本应用导出的JSON文件</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Import Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="showImportConfirm" 
          class="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showImportConfirm = false"></div>
          <div class="relative w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6">
            <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span class="text-2xl">⚠️</span>
              <span>确认导入</span>
            </h3>
            
            <div class="mb-6">
              <p class="text-gray-600 dark:text-gray-300 mb-4">
                导入数据将覆盖当前所有数据，此操作不可撤销。
              </p>
              
              <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <div class="text-sm font-bold text-amber-800 dark:text-amber-200 mb-2">即将导入：</div>
                <ul class="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li v-for="stat in importStats" :key="stat.type">
                    {{ stat.icon }} {{ stat.type }}: {{ stat.count }} 条
                  </li>
                </ul>
              </div>
            </div>
            
            <div class="flex gap-3">
              <button 
                @click="showImportConfirm = false"
                class="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                取消
              </button>
              <button 
                @click="confirmImport"
                class="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:opacity-90 transition-all"
              >
                确认导入
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    
    <!-- Success Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div 
          v-if="toast.show" 
          class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300]"
        >
          <div 
            class="px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
            :class="toast.type === 'success' 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
              : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'"
          >
            <span>{{ toast.type === 'success' ? '✅' : '❌' }}</span>
            <span>{{ toast.message }}</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const lastBackupTime = ref('')
const isExporting = ref(false)
const isImporting = ref(false)
const showExportOptions = ref(false)
const showImportConfirm = ref(false)
const importFileName = ref('')
const importDataToConfirm = ref(null)
const selectedExportTypes = ref(['tasks', 'habits', 'journal', 'achievements', 'rewards', 'points', 'settings', 'focus', 'milestones'])

const importStats = ref([])
const toast = ref({ show: false, message: '', type: 'success' })

// Export types configuration
const exportTypes = [
  { key: 'tasks', label: '任务', icon: '📝' },
  { key: 'habits', label: '习惯', icon: '🎯' },
  { key: 'journal', label: '心得', icon: '💭' },
  { key: 'achievements', label: '成就', icon: '🏆' },
  { key: 'rewards', label: '奖励', icon: '🎁' },
  { key: 'points', label: '积分', icon: '💎' },
  { key: 'settings', label: '设置', icon: '⚙️' },
  { key: 'focus', label: '专注记录', icon: '⏱️' },
  { key: 'milestones', label: '里程碑', icon: '🌟' }
]

// Load last backup time
onMounted(() => {
  try {
    const backupInfo = localStorage.getItem('lastBackupTime')
    if (backupInfo) {
      const info = JSON.parse(backupInfo)
      lastBackupTime.value = new Date(info.timestamp).toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  } catch (e) {
    console.error('Error loading backup time:', e)
  }
})

// Show toast notification
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// Select export types
const selectExportTypes = () => {
  showExportOptions.value = !showExportOptions.value
}

// Export data
const exportData = () => {
  isExporting.value = true
  
  try {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      appName: '学习伴侣'
    }
    
    // Export selected data types
    if (selectedExportTypes.value.includes('tasks')) {
      data.tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
    }
    if (selectedExportTypes.value.includes('habits')) {
      data.habits = JSON.parse(localStorage.getItem('habits') || '[]')
    }
    if (selectedExportTypes.value.includes('journal')) {
      data.journal = JSON.parse(localStorage.getItem('journal') || '[]')
    }
    if (selectedExportTypes.value.includes('achievements')) {
      data.achievements = JSON.parse(localStorage.getItem('achievements') || '[]')
    }
    if (selectedExportTypes.value.includes('rewards')) {
      data.rewards = JSON.parse(localStorage.getItem('rewards') || '[]')
    }
    if (selectedExportTypes.value.includes('points')) {
      data.points = {
        lovePoints: localStorage.getItem('lovePoints') || '0',
        pointsHistory: JSON.parse(localStorage.getItem('pointsHistory') || '[]')
      }
    }
    if (selectedExportTypes.value.includes('settings')) {
      data.settings = JSON.parse(localStorage.getItem('settings') || '{}')
    }
    if (selectedExportTypes.value.includes('focus')) {
      data.focus = JSON.parse(localStorage.getItem('focusHistory') || '[]')
    }
    if (selectedExportTypes.value.includes('milestones')) {
      data.milestones = JSON.parse(localStorage.getItem('milestones') || '[]')
    }
    
    // Add checkin history for habits
    if (selectedExportTypes.value.includes('habits')) {
      data.checkinHistory = JSON.parse(localStorage.getItem('checkinHistory') || '{}')
    }
    
    // Create download
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    // 修复：使用本地时区格式作为文件名
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    a.download = `学习伴侣备份_${dateStr}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    // Update backup time
    const backupInfo = {
      timestamp: new Date().toISOString(),
      types: selectedExportTypes.value
    }
    localStorage.setItem('lastBackupTime', JSON.stringify(backupInfo))
    lastBackupTime.value = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    showToast('数据导出成功！')
  } catch (e) {
    console.error('Export error:', e)
    showToast('导出失败，请重试', 'error')
  } finally {
    isExporting.value = false
  }
}

// Import data
const importData = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  importFileName.value = file.name
  isImporting.value = true
  
  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        
        // Validate data structure
        if (!data.appName || !data.version) {
          throw new Error('无效的备份文件')
        }
        
        // Calculate import stats
        importStats.value = []
        if (data.tasks?.length) importStats.value.push({ type: '任务', icon: '📝', count: data.tasks.length })
        if (data.habits?.length) importStats.value.push({ type: '习惯', icon: '🎯', count: data.habits.length })
        if (data.journal?.length) importStats.value.push({ type: '心得', icon: '💭', count: data.journal.length })
        if (data.achievements?.length) importStats.value.push({ type: '成就', icon: '🏆', count: data.achievements.length })
        if (data.rewards?.length) importStats.value.push({ type: '奖励', icon: '🎁', count: data.rewards.length })
        if (data.focus?.length) importStats.value.push({ type: '专注记录', icon: '⏱️', count: data.focus.length })
        
        importDataToConfirm.value = data
        showImportConfirm.value = true
        
      } catch (err) {
        console.error('Import parse error:', err)
        showToast('解析文件失败，请确保是有效的备份文件', 'error')
      } finally {
        isImporting.value = false
        event.target.value = ''
      }
    }
    reader.readAsText(file)
  } catch (e) {
    console.error('Import error:', e)
    showToast('导入失败，请重试', 'error')
    isImporting.value = false
  }
}

// Confirm import
const confirmImport = () => {
  const data = importDataToConfirm.value
  if (!data) return
  
  try {
    // Import data
    if (data.tasks?.length) localStorage.setItem('tasks', JSON.stringify(data.tasks))
    if (data.habits?.length) localStorage.setItem('habits', JSON.stringify(data.habits))
    if (data.journal?.length) localStorage.setItem('journal', JSON.stringify(data.journal))
    if (data.achievements?.length) localStorage.setItem('achievements', JSON.stringify(data.achievements))
    if (data.rewards?.length) localStorage.setItem('rewards', JSON.stringify(data.rewards))
    if (data.checkinHistory) localStorage.setItem('checkinHistory', JSON.stringify(data.checkinHistory))
    if (data.focus?.length) localStorage.setItem('focusHistory', JSON.stringify(data.focus))
    if (data.milestones?.length) localStorage.setItem('milestones', JSON.stringify(data.milestones))
    
    if (data.points) {
      if (data.points.lovePoints) localStorage.setItem('lovePoints', data.points.lovePoints.toString())
      if (data.points.pointsHistory) localStorage.setItem('pointsHistory', JSON.stringify(data.points.pointsHistory))
    }
    
    if (data.settings) localStorage.setItem('settings', JSON.stringify(data.settings))
    
    showToast('数据导入成功！请刷新页面查看数据')
    showImportConfirm.value = false
    importDataToConfirm.value = null
    
    // Trigger custom event for other components to reload
    window.dispatchEvent(new CustomEvent('dataImported'))
    
  } catch (e) {
    console.error('Confirm import error:', e)
    showToast('导入过程中发生错误', 'error')
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div:nth-child(2),
.modal-leave-to > div:nth-child(2) {
  transform: scale(0.95);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
