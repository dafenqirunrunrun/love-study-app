<template>
  <Teleport to="body">
    <Transition name="undo-toast">
      <div
        v-if="visible && message"
        class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
      >
        <div
          class="glass-card px-6 py-4 flex items-center gap-4 shadow-2xl"
          :class="darkMode ? 'bg-gray-800/90' : 'bg-white/90'"
        >
          <span class="text-gray-700 dark:text-gray-200">
            {{ message }}
          </span>
          <button
            @click="handleUndo"
            class="text-orange-500 hover:text-orange-600 font-bold transition-colors"
          >
            {{ undoText }}
          </button>
          <button
            @click="close"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-2"
          >
            ✕
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // 显示消息
  message: {
    type: String,
    default: '操作已撤销'
  },
  // 撤销按钮文字
  undoText: {
    type: String,
    default: '撤销'
  },
  // 自动关闭时间（毫秒）
  duration: {
    type: Number,
    default: 5000
  },
  // 撤销回调
  onUndo: {
    type: Function,
    default: null
  },
  // 关闭回调
  onClose: {
    type: Function,
    default: null
  }
})

const visible = ref(false)
const darkMode = ref(false)
let timer = null

const show = () => {
  visible.value = true
  startTimer()
}

const close = () => {
  visible.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  props.onClose?.()
}

const handleUndo = () => {
  props.onUndo?.()
  close()
}

const startTimer = () => {
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    close()
  }, props.duration)
}

const checkDarkMode = () => {
  darkMode.value = document.documentElement.classList.contains('dark')
}

watch(() => props.message, (newVal) => {
  if (newVal && visible.value) {
    startTimer()
  }
})

onMounted(() => {
  checkDarkMode()
  window.addEventListener('darkmodechange', checkDarkMode)
})

onUnmounted(() => {
  window.removeEventListener('darkmodechange', checkDarkMode)
  if (timer) {
    clearTimeout(timer)
  }
})

// 暴露方法给父组件
defineExpose({
  show,
  close
})
</script>

<style scoped>
.undo-toast-enter-active,
.undo-toast-leave-active {
  transition: all 0.3s ease-out;
}

.undo-toast-enter-from {
  opacity: 0;
  transform: translate(-50%, 20px);
}

.undo-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}

.undo-toast-enter-to,
.undo-toast-leave-from {
  opacity: 1;
  transform: translate(-50%, 0);
}
</style>
