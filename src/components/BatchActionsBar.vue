<template>
  <Transition name="slide-up">
    <div
      v-if="visible && selectedCount > 0"
      class="fixed bottom-0 left-0 right-0 z-40 p-4 pb-6"
    >
      <div class="glass-card p-4 flex items-center justify-between shadow-2xl"
           :class="darkMode ? 'bg-gray-800/90' : 'bg-white/90'"
      >
        <!-- 左侧：选择数量 -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              :checked="isAllSelected"
              :indeterminate="isIndeterminate"
              @change="toggleSelectAll"
              class="w-5 h-5 text-orange-500 rounded cursor-pointer"
            />
            <span class="text-gray-700 dark:text-gray-200 font-medium">
              已选择 {{ selectedCount }} 项
            </span>
          </div>
        </div>

        <!-- 右侧：操作按钮 -->
        <div class="flex items-center gap-2">
          <!-- 批量完成 -->
          <button
            v-if="showComplete"
            @click="handleComplete"
            :disabled="selectedCount === 0"
            class="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all"
            :class="completeButtonClass"
          >
            <span>✅</span>
            <span>批量完成</span>
          </button>

          <!-- 批量删除 -->
          <button
            v-if="showDelete"
            @click="handleDelete"
            :disabled="selectedCount === 0"
            class="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all"
            :class="deleteButtonClass"
          >
            <span>🗑️</span>
            <span>删除</span>
          </button>

          <!-- 取消选择 -->
          <button
            @click="handleCancel"
            class="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all"
            :class="cancelButtonClass"
          >
            <span>✕</span>
            <span>取消</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // 是否显示
  visible: {
    type: Boolean,
    default: true
  },
  // 已选择的ID列表
  selectedIds: {
    type: Array,
    default: () => []
  },
  // 总数量
  totalCount: {
    type: Number,
    default: 0
  },
  // 是否显示批量完成按钮
  showComplete: {
    type: Boolean,
    default: true
  },
  // 是否显示批量删除按钮
  showDelete: {
    type: Boolean,
    default: true
  },
  // 删除确认文字
  deleteText: {
    type: String,
    default: '确认删除所选？'
  }
})

const emit = defineEmits([
  'toggle-select-all',
  'complete',
  'delete',
  'cancel'
])

const darkMode = ref(false)

const selectedCount = computed(() => props.selectedIds.length)

const isAllSelected = computed(() => {
  return props.selectedCount > 0 && props.selectedIds.length === props.totalCount
})

const isIndeterminate = computed(() => {
  return props.selectedIds.length > 0 && props.selectedIds.length < props.totalCount
})

const completeButtonClass = computed(() => {
  return darkMode.value
    ? 'bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed'
    : 'bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
})

const deleteButtonClass = computed(() => {
  return darkMode.value
    ? 'bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed'
    : 'bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
})

const cancelButtonClass = computed(() => {
  return darkMode.value
    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
})

const toggleSelectAll = () => {
  emit('toggle-select-all')
}

const handleComplete = () => {
  emit('complete')
}

const handleDelete = () => {
  // 如果选择了所有项目，显示确认
  if (confirm(props.deleteText)) {
    emit('delete')
  }
}

const handleCancel = () => {
  emit('cancel')
}

const checkDarkMode = () => {
  darkMode.value = document.documentElement.classList.contains('dark')
}

onMounted(() => {
  checkDarkMode()
  window.addEventListener('darkmodechange', checkDarkMode)
})

onUnmounted(() => {
  window.removeEventListener('darkmodechange', checkDarkMode)
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
