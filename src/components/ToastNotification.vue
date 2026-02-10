<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto toast-item glass-card px-6 py-4 flex items-center gap-4 min-w-[320px] max-w-md shadow-2xl',
          toast.type === 'success' ? 'border-green-400/50' : '',
          toast.type === 'error' ? 'border-red-400/50' : '',
          toast.type === 'warning' ? 'border-yellow-400/50' : '',
          toast.type === 'info' ? 'border-blue-400/50' : ''
        ]"
      >
        <!-- 图标 -->
        <div 
          :class="[
            'w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0',
            toast.type === 'success' ? 'bg-gradient-to-br from-green-400 to-emerald-500' : '',
            toast.type === 'error' ? 'bg-gradient-to-br from-red-400 to-rose-500' : '',
            toast.type === 'warning' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : '',
            toast.type === 'info' ? 'bg-gradient-to-br from-blue-400 to-indigo-500' : ''
          ]"
        >
          <span v-if="toast.type === 'success'">🎉</span>
          <span v-else-if="toast.type === 'error'">❌</span>
          <span v-else-if="toast.type === 'warning'">⚠️</span>
          <span v-else-if="toast.type === 'info'">ℹ️</span>
          <span v-else>💬</span>
        </div>
        
        <!-- 内容 -->
        <div class="flex-1">
          <div v-if="toast.title" class="font-bold text-gray-800 dark:text-white mb-1">
            {{ toast.title }}
          </div>
          <div class="text-gray-600 dark:text-gray-300 text-sm">
            {{ toast.message }}
          </div>
        </div>
        
        <!-- 关闭按钮 -->
        <button
          @click="removeToast(toast.id)"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- 进度条 -->
        <div class="absolute bottom-0 left-0 right-0 h-1 bg-transparent overflow-hidden rounded-b-2xl">
          <div 
            class="h-full bg-gradient-to-r from-orange-400 to-pink-500 transition-all ease-linear"
            :style="{ 
              width: '100%',
              animation: `shrink ${toast.duration}ms linear forwards`
            }"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref, provide } from 'vue'

const toasts = ref([])
let toastId = 0

// 添加样式
const style = document.createElement('style')
style.textContent = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
  
  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .toast-enter-from {
    opacity: 0;
    transform: translateX(100px) scale(0.9);
  }
  
  .toast-leave-to {
    opacity: 0;
    transform: translateX(100px) scale(0.9);
  }
  
  .toast-move {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
`
document.head.appendChild(style)

const addToast = (options) => {
  const { 
    message, 
    title, 
    type = 'info', 
    duration = 4000 
  } = options
  
  const id = ++toastId
  const toast = { id, message, title, type, duration }
  toasts.value.push(toast)
  
  // 自动移除
  setTimeout(() => {
    removeToast(id)
  }, duration)
  
  return id
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// 提供给全局使用
provide('toast', {
  success: (message, title = '') => addToast({ message, title, type: 'success' }),
  error: (message, title = '') => addToast({ message, title, type: 'error' }),
  warning: (message, title = '') => addToast({ message, title, type: 'warning' }),
  info: (message, title = '') => addToast({ message, title, type: 'info' })
})

defineExpose({
  success: (message, title = '') => addToast({ message, title, type: 'success' }),
  error: (message, title = '') => addToast({ message, title, type: 'error' }),
  warning: (message, title = '') => addToast({ message, title, type: 'warning' }),
  info: (message, title = '') => addToast({ message, title, type: 'info' }),
  add: addToast,
  remove: removeToast
})
</script>
