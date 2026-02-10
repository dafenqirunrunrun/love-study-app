<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- 遮罩层 -->
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="handleCancel"
        ></div>

        <!-- 对话框 -->
        <div
          class="relative glass-card p-6 w-full max-w-sm shadow-2xl"
          :class="darkMode ? 'bg-gray-800/90' : 'bg-white/90'"
        >
          <!-- 图标 -->
          <div class="flex items-center gap-4 mb-4">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              :class="iconBgClass"
            >
              {{ icon }}
            </div>
            <div>
              <h3
                class="text-lg font-bold text-gray-800 dark:text-white"
              >
                {{ title }}
              </h3>
              <p
                v-if="subtitle"
                class="text-sm text-gray-500 dark:text-gray-400 mt-1"
              >
                {{ subtitle }}
              </p>
            </div>
          </div>

          <!-- 消息 -->
          <p
            class="text-gray-600 dark:text-gray-300 mb-6"
          >
            {{ message }}
          </p>

          <!-- 复选框 -->
          <div
            v-if="showRememberChoice"
            class="mb-4 flex items-center gap-2"
          >
            <input
              type="checkbox"
              :id="rememberId"
              v-model="rememberChoice"
              class="w-4 h-4 text-orange-500 rounded"
            />
            <label
              :for="rememberId"
              class="text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
            >
              {{ rememberText }}
            </label>
          </div>

          <!-- 按钮组 -->
          <div class="flex gap-3 justify-end">
            <button
              @click="handleCancel"
              class="px-4 py-2 rounded-xl font-medium transition-all"
              :class="cancelClass"
            >
              {{ cancelText }}
            </button>
            <button
              @click="handleConfirm"
              class="px-4 py-2 rounded-xl font-bold transition-all"
              :class="confirmClass"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // 是否显示
  visible: {
    type: Boolean,
    default: false
  },
  // 标题
  title: {
    type: String,
    default: '确认操作'
  },
  // 副标题
  subtitle: {
    type: String,
    default: ''
  },
  // 消息
  message: {
    type: String,
    default: '确定要执行此操作吗？'
  },
  // 图标
  icon: {
    type: String,
    default: '⚠️'
  },
  // 图标背景颜色
  iconType: {
    type: String,
    default: 'warning', // warning, danger, info, success
    validator: (v) => ['warning', 'danger', 'info', 'success'].includes(v)
  },
  // 确认按钮文字
  confirmText: {
    type: String,
    default: '确定'
  },
  // 取消按钮文字
  cancelText: {
    type: String,
    default: '取消'
  },
  // 确认按钮类型
  confirmType: {
    type: String,
    default: 'danger', // danger, primary, warning
    validator: (v) => ['danger', 'primary', 'warning'].includes(v)
  },
  // 是否显示记住选择
  showRememberChoice: {
    type: Boolean,
    default: false
  },
  // 记住选择文字
  rememberText: {
    type: String,
    default: '下次不再询问'
  },
  // 记住选择的ID（用于localStorage存储）
  rememberId: {
    type: String,
    default: 'default-confirm'
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const darkMode = ref(false)
const rememberChoice = ref(false)

const iconBgClass = computed(() => {
  const classes = {
    warning: 'bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400',
    danger: 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400',
    success: 'bg-green-100 text-green-500 dark:bg-green-900/30 dark:text-green-400'
  }
  return classes[props.iconType]
})

const confirmClass = computed(() => {
  const classes = {
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    primary: 'bg-orange-500 hover:bg-orange-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white'
  }
  return classes[props.confirmType]
})

const cancelClass = computed(() => {
  return darkMode.value
    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
})

const handleConfirm = () => {
  // 如果记住选择，存储到localStorage
  if (props.showRememberChoice && rememberChoice.value) {
    localStorage.setItem(`confirm-${props.rememberId}`, 'true')
  }
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}

const checkDarkMode = () => {
  darkMode.value = document.documentElement.classList.contains('dark')
}

// 检查是否记住选择
const checkRememberChoice = () => {
  if (props.showRememberChoice) {
    const saved = localStorage.getItem(`confirm-${props.rememberId}`)
    if (saved === 'true') {
      rememberChoice.value = true
      emit('confirm')
    }
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    checkRememberChoice()
  }
})

onMounted(() => {
  checkDarkMode()
  window.addEventListener('darkmodechange', checkDarkMode)
})

onUnmounted(() => {
  window.removeEventListener('darkmodechange', checkDarkMode)
})
</script>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease-out;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>
