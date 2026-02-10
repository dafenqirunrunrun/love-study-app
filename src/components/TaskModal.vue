<template>
  <transition name="modal">
    <div class="modal-overlay" v-if="show" @click.self="close">
      <div class="modal-content glass-card">
        <!-- 头部 -->
        <div class="modal-header">
          <h2>{{ isEditing ? '编辑任务' : '添加任务' }}</h2>
          <button class="close-btn" @click="close">×</button>
        </div>
        
        <!-- 主体 -->
        <div class="modal-body">
          <!-- 标题输入 -->
          <div class="form-group">
            <input 
              v-model="task.text"
              type="text"
              placeholder="输入任务标题..."
              class="task-input"
              ref="titleInput"
              @keyup.enter="save"
            />
          </div>
          
          <!-- 时间选择 -->
          <div class="form-section">
            <h3>📅 日期与时间</h3>
            <div class="time-row">
              <div class="time-picker">
                <label>截止日期</label>
                <input 
                  type="date" 
                  v-model="task.dueDate"
                  class="date-input"
                />
              </div>
              <div class="time-picker" v-if="task.dueDate">
                <label>时间</label>
                <input 
                  type="time" 
                  v-model="task.dueTime"
                  class="time-input"
                />
              </div>
            </div>
            <label class="all-day">
              <input type="checkbox" v-model="task.allDay" />
              <span>全天</span>
            </label>
          </div>
          
          <!-- 优先级 -->
          <div class="form-section">
            <h3>🔥 优先级</h3>
            <div class="priority-options">
              <button 
                v-for="level in priorities"
                :key="level.value"
                class="priority-btn"
                :class="{ active: task.priority === level.value }"
                @click="task.priority = level.value"
              >
                <span class="priority-icon">{{ level.icon }}</span>
                <span>{{ level.label }}</span>
              </button>
            </div>
          </div>
          
          <!-- 分类 -->
          <div class="form-section">
            <h3>📁 分类</h3>
            <div class="category-options">
              <button 
                v-for="cat in categories"
                :key="cat.value"
                class="category-btn"
                :class="{ active: task.category === cat.value }"
                @click="task.category = cat.value"
              >
                <span>{{ cat.icon }}</span>
                <span>{{ cat.label }}</span>
              </button>
            </div>
          </div>
          
          <!-- 备注 -->
          <div class="form-section">
            <h3>📝 备注</h3>
            <textarea 
              v-model="task.notes"
              placeholder="添加备注..."
              class="notes-input"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <!-- 底部 -->
        <div class="modal-footer">
          <button class="btn-cancel" @click="close">取消</button>
          <button 
            class="btn-save" 
            @click="save"
            :disabled="!task.text.trim()"
          >
            {{ isEditing ? '保存' : '添加' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'

interface Task {
  id?: string
  text: string
  dueDate?: string
  dueTime?: string
  allDay: boolean
  priority: 'high' | 'medium' | 'low'
  category: string
  notes?: string
}

const props = defineProps<{
  show: boolean
  taskToEdit?: Task | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', task: Task): void
}>()

// 辅助函数：获取本地时区日期字符串
const getLocalDateString = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const titleInput = ref<HTMLInputElement | null>(null)

const isEditing = computed(() => !!props.taskToEdit?.id)

const task = ref<Task>({
  text: '',
  dueDate: getLocalDateString(),
  dueTime: '',
  allDay: false,
  priority: 'medium',
  category: 'study',
  notes: ''
})

const priorities = [
  { value: 'high', label: '高', icon: '🔥' },
  { value: 'medium', label: '中', icon: '⚡' },
  { value: 'low', label: '低', icon: '🌱' }
]

const categories = [
  { value: 'study', label: '学习', icon: '📚' },
  { value: 'english', label: '英语', icon: '🔤' },
  { value: 'politics', label: '政治', icon: '📰' },
  { value: 'math', label: '数学', icon: '🔢' },
  { value: 'major', label: '专业课', icon: '🎓' },
  { value: 'exercise', label: '运动', icon: '🏃' },
  { value: 'rest', label: '休息', icon: '😴' }
]

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.taskToEdit) {
      task.value = { ...props.taskToEdit }
    } else {
      task.value = {
        text: '',
        dueDate: getLocalDateString(),
        dueTime: '',
        allDay: false,
        priority: 'medium',
        category: 'study',
        notes: ''
      }
    }
    nextTick(() => {
      titleInput.value?.focus()
    })
  }
})

const close = () => {
  emit('close')
}

const save = () => {
  if (!task.value.text.trim()) return
  emit('save', { ...task.value })
  close()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  font-size: 20px;
  font-weight: bold;
  background: linear-gradient(135deg, #f97316, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.task-input {
  width: 100%;
  padding: 16px 20px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  font-size: 18px;
  color: #fff;
  outline: none;
}

.task-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-section {
  margin-bottom: 24px;
}

.form-section h3 {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
}

.time-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.time-picker label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 6px;
}

.date-input,
.time-input {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  outline: none;
}

.all-day {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.priority-options,
.category-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.priority-btn,
.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 12px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
}

.priority-btn:hover,
.category-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.priority-btn.active {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.2);
}

.category-btn.active {
  border-color: #f472b6;
  background: rgba(244, 114, 182, 0.2);
}

.priority-icon {
  font-size: 24px;
}

.notes-input {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  outline: none;
  resize: none;
}

.notes-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-cancel,
.btn-save {
  padding: 12px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-save {
  background: linear-gradient(135deg, #f97316, #f472b6);
  border: none;
  color: #fff;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(249, 115, 22, 0.4);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(20px) scale(0.95);
}

@media (max-width: 768px) {
  .modal-content {
    max-height: 85vh;
    margin: 0;
  }
  
  .priority-options,
  .category-options {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
