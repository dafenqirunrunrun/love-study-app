<template>
  <!-- 快捷键帮助弹窗 -->
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        @click.self="close"
      >
        <!-- 遮罩层 -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close"></div>
        
        <!-- 弹窗内容 -->
        <div 
          class="relative glass-card max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in"
          style="animation: scaleIn 0.3s ease-out;"
        >
          <!-- 标题栏 -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200/20">
            <div class="flex items-center gap-3">
              <span class="text-2xl">⌨️</span>
              <h2 class="text-xl font-bold text-theme-primary">键盘快捷键</h2>
            </div>
            <button 
              @click="close"
              class="group p-2 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              <span class="text-xl group-hover:rotate-90 transition-transform duration-300">✕</span>
            </button>
          </div>

          <!-- 快捷键列表 -->
          <div class="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
            <!-- 导航快捷键 -->
            <div class="mb-8">
              <h3 class="text-sm font-semibold text-theme-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>🧭</span> 导航快捷键
              </h3>
              <div class="grid gap-3">
                <ShortcutItem 
                  v-for="shortcut in navigationShortcuts" 
                  :key="shortcut.key"
                  :shortcut="shortcut"
                />
              </div>
            </div>

            <!-- 功能快捷键 -->
            <div class="mb-8">
              <h3 class="text-sm font-semibold text-theme-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>⚡</span> 功能快捷键
              </h3>
              <div class="grid gap-3">
                <ShortcutItem 
                  v-for="shortcut in functionShortcuts" 
                  :key="shortcut.key"
                  :shortcut="shortcut"
                />
              </div>
            </div>

            <!-- 专注模式 -->
            <div>
              <h3 class="text-sm font-semibold text-theme-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>⏱️</span> 专注模式
              </h3>
              <div class="grid gap-3">
                <ShortcutItem 
                  v-for="shortcut in focusShortcuts" 
                  :key="shortcut.key"
                  :shortcut="shortcut"
                />
              </div>
            </div>
          </div>

          <!-- 底部提示 -->
          <div class="p-4 border-t border-gray-200/20 text-center text-theme-muted text-sm">
            <span class="flex items-center justify-center gap-2">
              <span>💡</span>
              按 <kbd class="px-2 py-1 rounded-lg bg-white/10 font-mono text-xs">?</kbd> 快速打开此帮助
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { DEFAULT_SHORTCUTS } from '../composables/useKeyboardShortcuts'

// Import scale animation
const scaleIn = 'scaleIn'

// Props
interface Props {
  isOpen: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false
})

// Emits
const emit = defineEmits<{
  (e: 'close'): void
}>()

// Shortcut categories
const navigationShortcuts = computed(() => {
  return DEFAULT_SHORTCUTS.filter(function(s) { 
    return ['h', 't', 'f', 'c', 's'].indexOf(s.key) !== -1 && !s.ctrl && !s.alt && !s.shift && !s.meta
  })
})

const functionShortcuts = computed(() => {
  return DEFAULT_SHORTCUTS.filter(function(s) { 
    return ['n', '/', 'Escape'].indexOf(s.key) !== -1
  })
})

const focusShortcuts = computed(() => {
  return DEFAULT_SHORTCUTS.filter(function(s) { 
    return ['ArrowLeft', 'ArrowRight'].indexOf(s.key) !== -1
  })
})

// Close
var close = function() {
  emit('close')
}

// ESC close
var handleKeydown = function(event) {
  if (event.key === 'Escape' && props.isOpen) {
    close()
  }
}

onMounted(function() {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(function() {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<script lang="ts">
// Child component definition
import { defineComponent, h, type PropType } from 'vue'

// Shortcut item component
var ShortcutItem = defineComponent({
  name: 'ShortcutItem',
  props: {
    shortcut: {
      type: Object as PropType<typeof DEFAULT_SHORTCUTS[0]>,
      required: true
    }
  },
  render: function(props) {
    var shortcut = props.shortcut
    
    // Generate shortcut display
    var parts = []
    if (shortcut.ctrl || shortcut.meta) parts.push('Ctrl')
    if (shortcut.alt) parts.push('Alt')
    if (shortcut.shift) parts.push('Shift')
    if (!shortcut.ctrl && !shortcut.alt && !shortcut.shift && !shortcut.meta) {
      parts.push(shortcut.key.toUpperCase())
    }
    
    var shortcutText = parts.length > 0 ? parts.join(' + ') : shortcut.key.toUpperCase()
    
    return h('div', {
      class: 'flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 group'
    }, [
      h('span', { class: 'text-theme-secondary text-sm' }, shortcut.description),
      h('kbd', {
        class: 'px-3 py-1.5 rounded-lg bg-white/10 font-mono text-xs text-theme-primary group-hover:bg-white/20 transition-all duration-200 border border-white/10'
      }, shortcutText)
    ])
  }
})

export { ShortcutItem }
</script>

<style scoped>
/* 弹窗过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.9);
}

/* 滚动条样式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(249, 115, 22, 0.3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(249, 115, 22, 0.5);
}
</style>
