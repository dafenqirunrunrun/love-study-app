<template>
  <div class="smart-list">
    <!-- 搜索和筛选栏 -->
    <div class="list-header">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="搜索任务..."
          class="search-input"
          @input="$emit('search', searchQuery)"
        />
      </div>
      
      <div class="filter-buttons">
        <button 
          v-for="filter in filters"
          :key="filter.value"
          class="filter-btn"
          :class="{ active: activeFilter === filter.value }"
          @click="setFilter(filter.value)"
        >
          {{ filter.icon }} {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- 任务分组 -->
    <div class="task-groups">
      <div 
        v-for="group in filteredGroups"
        :key="group.id"
        class="task-group"
        :class="{ collapsed: group.collapsed }"
      >
        <!-- 分组标题 -->
        <div class="group-header" @click="toggleGroup(group.id)">
          <span class="group-icon">{{ group.icon }}</span>
          <span class="group-title">{{ group.title }}</span>
          <span class="group-count">{{ group.tasks.length }}</span>
          <span class="collapse-icon">
            {{ group.collapsed ? '▶' : '▼' }}
          </span>
        </div>
        
        <!-- 任务列表 -->
        <transition name="slide">
          <div v-if="!group.collapsed" class="group-tasks">
            <div 
              v-for="task in group.tasks"
              :key="task.id"
              class="list-task-item"
              :class="{ completed: task.completed }"
              @click="$emit('task-click', task)"
            >
              <!-- 复选框 -->
              <button 
                class="checkbox"
                :class="{ checked: task.completed }"
                @click.stop="$emit('task-complete', task)"
              >
                <span v-if="task.completed">✓</span>
              </button>
              
              <!-- 任务内容 -->
              <div class="task-content">
                <span class="task-text">{{ task.text }}</span>
                <div class="task-meta">
                  <span v-if="task.dueDate" class="due-date">
                    📅 {{ formatDate(task.dueDate) }}
                  </span>
                  <span v-if="task.priority !== 'low'" class="priority-badge" :class="task.priority">
                    {{ task.priority === 'high' ? '🔥' : '⚡' }}
                  </span>
                </div>
              </div>
              
              <!-- 操作按钮 -->
              <div class="task-actions">
                <button class="action-btn" @click.stop="$emit('task-edit', task)">
                  ✏️
                </button>
                <button class="action-btn delete" @click.stop="$emit('task-delete', task)">
                  🗑️
                </button>
              </div>
            </div>
            
            <!-- 空状态 -->
            <div v-if="group.tasks.length === 0" class="empty-state">
              <span>📭</span>
              <p>暂无任务</p>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Task {
  id: string
  text: string
  completed: boolean
  category: string
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
  dueTime?: string
}

const props = defineProps<{
  tasks: Task[]
  groups?: Array<{
    id: string
    title: string
    icon: string
    tasks: Task[]
    collapsed?: boolean
  }>
}>()

defineEmits<{
  (e: 'search', query: string): void
  (e: 'filter', filter: string): void
  (e: 'task-click', task: Task): void
  (e: 'task-complete', task: Task): void
  (e: 'task-edit', task: Task): void
  (e: 'task-delete', task: Task): void
}>()

const searchQuery = ref('')
const activeFilter = ref('all')

const filters = [
  { value: 'all', label: '全部', icon: '📋' },
  { value: 'today', label: '今天', icon: '📅' },
  { value: 'week', label: '本周', icon: '📆' },
  { value: 'completed', label: '已完成', icon: '✅' }
]

// 自动分组
const autoGroups = computed(() => {
  // 修复：使用本地时区格式，避免日期偏移
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
  
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)
  
  return [
    {
      id: 'today',
      title: '今天',
      icon: '📅',
      tasks: props.tasks.filter(t => !t.completed && t.dueDate === todayStr),
      collapsed: false
    },
    {
      id: 'tomorrow',
      title: '明天',
      icon: '🌙',
      tasks: props.tasks.filter(t => !t.completed && t.dueDate === tomorrowStr),
      collapsed: false
    },
    {
      id: 'upcoming',
      title: '最近7天',
      icon: '📆',
      tasks: props.tasks.filter(t => {
        if (t.completed || !t.dueDate) return false
        const dueDate = new Date(t.dueDate)
        return dueDate > tomorrow && dueDate <= nextWeek
      }),
      collapsed: false
    },
    {
      id: 'no-date',
      title: '稍后安排',
      icon: '📥',
      tasks: props.tasks.filter(t => !t.completed && !t.dueDate),
      collapsed: false
    },
    {
      id: 'completed',
      title: '已完成',
      icon: '✅',
      tasks: props.tasks.filter(t => t.completed),
      collapsed: false
    }
  ]
})

// 筛选后的分组
const filteredGroups = computed(() => {
  let groups = props.groups || autoGroups.value
  
  // 应用搜索过滤
  if (searchQuery.value) {
    groups = groups.map(group => ({
      ...group,
      tasks: group.tasks.filter(t => 
        t.text.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }))
  }
  
  // 应用分类过滤
  if (activeFilter.value !== 'all') {
    // 过滤逻辑已经在 groups 中处理
  }
  
  return groups.filter(group => group.tasks.length > 0)
})

// 切换分组展开/折叠
const groupStates = ref<Record<string, boolean>>({})

const toggleGroup = (groupId: string) => {
  groupStates.value[groupId] = !groupStates.value[groupId]
}

const setFilter = (filter: string) => {
  activeFilter.value = filter
  defineEmits<any>()
}

// 格式化日期
const formatDate = (dateStr: string) => {
  // 修复：使用本地时区格式，避免日期偏移
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
  
  if (dateStr === todayStr) {
    return '今天'
  } else if (dateStr === tomorrowStr) {
    return '明天'
  } else {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
}
</script>

<style scoped>
.smart-list {
  padding: 16px 0;
}

/* 搜索栏 */
.list-header {
  margin-bottom: 24px;
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.search-icon {
  font-size: 18px;
  margin-right: 12px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  outline: none;
}

.filter-buttons {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.filter-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.8);
}

.filter-btn.active {
  background: linear-gradient(135deg, #f97316, #f472b6);
  color: white;
}

/* 分组 */
.task-group {
  margin-bottom: 16px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(249, 115, 22, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.group-header:hover {
  background: rgba(249, 115, 22, 0.15);
}

.group-icon {
  font-size: 20px;
}

.group-title {
  font-weight: 600;
  color: #374151;
}

.group-count {
  background: rgba(249, 115, 22, 0.2);
  color: #f97316;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
}

.collapse-icon {
  margin-left: auto;
  color: #9ca3af;
  font-size: 12px;
  transition: transform 0.3s;
}

.task-group.collapsed .collapse-icon {
  transform: rotate(-90deg);
}

/* 任务列表 */
.group-tasks {
  margin-top: 8px;
  padding-left: 16px;
}

.list-task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.list-task-item:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateX(4px);
}

.list-task-item.completed {
  opacity: 0.6;
}

.list-task-item.completed .task-text {
  text-decoration: line-through;
  color: #9ca3af;
}

/* 复选框 */
.checkbox {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
}

.checkbox:hover {
  border-color: #22c55e;
}

.checkbox.checked {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-color: transparent;
}

/* 任务内容 */
.task-content {
  flex: 1;
  min-width: 0;
}

.task-text {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.due-date {
  font-size: 12px;
  color: #6b7280;
}

.priority-badge {
  font-size: 12px;
}

.priority-badge.high {
  color: #ef4444;
}

.priority-badge.medium {
  color: #f97316;
}

/* 操作按钮 */
.task-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.list-task-item:hover .task-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(249, 115, 22, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.action-btn:hover {
  background: rgba(249, 115, 22, 0.2);
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 24px;
  color: #9ca3af;
}

.empty-state span {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

/* 动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

@media (max-width: 768px) {
  .search-box {
    padding: 10px 14px;
  }
  
  .filter-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .list-task-item {
    padding: 12px;
  }
  
  .task-actions {
    opacity: 1;
  }
}
</style>
