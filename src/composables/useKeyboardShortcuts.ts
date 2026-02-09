/**
 * 🎹 键盘快捷键管理
 * 支持全局快捷键和组件级快捷键
 */
import { onMounted, onUnmounted, ref, type Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// 快捷键定义类型
export interface Shortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
  description: string
  action: () => void
  preventDefault?: boolean
}

// 快捷键配置
export const DEFAULT_SHORTCUTS: Shortcut[] = [
  // 导航快捷键
  { key: 'h', description: '返回首页', action: () => navigateTo('/') },
  { key: 't', description: '任务页面', action: () => navigateTo('/tasks') },
  { key: 'f', description: '专注计时', action: () => navigateTo('/focus') },
  { key: 'c', description: '习惯打卡', action: () => navigateTo('/checkin') },
  { key: 's', description: '统计页面', action: () => navigateTo('/stats') },
  { key: 'a', description: '成就页面', action: () => navigateTo('/achievements') },
  { key: 'p', description: '积分中心', action: () => navigateTo('/points') },
  { key: 'l', description: '学习计划', action: () => navigateTo('/plan') },
  { key: 'j', description: '学习心得', action: () => navigateTo('/journal') },
  { key: 'r', description: '心愿单', action: () => navigateTo('/rewards') },
  { key: 'm', description: '日历页面', action: () => navigateTo('/calendar') },
  { key: 'g', description: '设置页面', action: () => navigateTo('/settings') },
  
  // 功能快捷键
  { key: 'n', description: '新建任务', action: () => triggerAction('newTask') },
  { key: 'd', alt: true, description: '切换深色模式', action: () => toggleDarkMode() },
  { key: '/', description: '显示快捷键帮助', action: () => toggleHelp() },
  { key: 'Escape', description: '关闭弹窗/帮助', action: () => closeModal() },
  { key: 'z', ctrl: true, description: '撤销操作', action: () => triggerAction('undo') },
  { key: 's', ctrl: true, description: '保存数据', action: () => triggerAction('save') },
  
  // 专注模式快捷键
  { key: ' ', description: '开始/暂停专注', action: () => triggerAction('toggleFocus'), preventDefault: true },
  { key: 'ArrowLeft', description: '休息5分钟', action: () => triggerAction('shortBreak') },
  { key: 'ArrowRight', description: '长休息15分钟', action: () => triggerAction('longBreak') },
]

// 路由和状态管理
let router: any = null
let darkModeRef: Ref<boolean> | null = null
let helpVisible = false
let customActions: Map<string, () => void> = new Map()

export function useKeyboardShortcuts(
  options?: {
    darkMode?: Ref<boolean>
    onNewTask?: () => void
    onUndo?: () => void
    onSave?: () => void
    onToggleFocus?: () => void
    onShortBreak?: () => void
    onLongBreak?: () => void
    onCloseModal?: () => void
  }
) {
  const shortcuts: Ref<Shortcut[]> = ref([...DEFAULT_SHORTCUTS])
  const helpVisibleRef = ref(false)
  const showHelp = ref(false)
  const pressedKeys = ref<string[]>([])

  // 初始化
  onMounted(() => {
    // 注册全局键盘事件
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('keyup', handleKeyup)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('keyup', handleKeyup)
  })

  // 检查快捷键是否匹配
  const matchesShortcut = (event: KeyboardEvent, shortcut: Shortcut): boolean => {
    const { key, ctrl, alt, shift, meta } = shortcut
    
    // 检查修饰键
    const ctrlMatch = ctrl ? (event.ctrlKey || event.metaKey) : !(event.ctrlKey || event.metaKey)
    const altMatch = alt ? event.altKey : !event.altKey
    const shiftMatch = shift ? event.shiftKey : !event.shiftKey
    const metaMatch = meta ? event.metaKey : !event.metaKey
    
    // 检查主键
    const keyMatch = event.key.toLowerCase() === key.toLowerCase()
    
    return ctrlMatch && altMatch && shiftMatch && metaMatch && keyMatch
  }

  // 处理键盘按下
  const handleKeydown = (event: KeyboardEvent) => {
    // 防止在输入框中触发快捷键（除了 Escape）
    const target = event.target as HTMLElement
    const isInput = target.tagName === 'INPUT' || 
                    target.tagName === 'TEXTAREA' || 
                    target.isContentEditable

    if (isInput && event.key !== 'Escape') {
      return
    }

    // 更新按下的键
    pressedKeys.value.push(event.key)

    // 查找匹配的快捷键
    const matchedShortcut = shortcuts.value.find(s => matchesShortcut(event, s))

    if (matchedShortcut) {
      if (matchedShortcut.preventDefault) {
        event.preventDefault()
      }
      
      matchedShortcut.action()
    }

    // 显示帮助
    if (event.key === '?' && event.shiftKey) {
      event.preventDefault()
      showHelp.value = !showHelp.value
    }
  }

  // 处理键盘释放
  const handleKeyup = (event: KeyboardEvent) => {
    pressedKeys.value = pressedKeys.value.filter(k => k !== event.key)
  }

  // 添加自定义快捷键
  const addShortcut = (shortcut: Shortcut) => {
    // 检查是否已存在
    const existingIndex = shortcuts.value.findIndex(
      s => s.key === shortcut.key && 
           s.ctrl === shortcut.ctrl && 
           s.alt === shortcut.alt &&
           s.shift === shortcut.shift &&
           s.meta === shortcut.meta
    )
    
    if (existingIndex >= 0) {
      shortcuts.value[existingIndex] = shortcut
    } else {
      shortcuts.value.push(shortcut)
    }
  }

  // 移除快捷键
  const removeShortcut = (key: string, modifiers?: { ctrl?: boolean; alt?: boolean; shift?: boolean; meta?: boolean }) => {
    const index = shortcuts.value.findIndex(s => {
      if (s.key !== key) return false
      if (modifiers) {
        return s.ctrl === modifiers.ctrl && 
               s.alt === modifiers.alt && 
               s.shift === modifiers.shift &&
               s.meta === modifiers.meta
      }
      return !s.ctrl && !s.alt && !s.shift && !s.meta
    })
    
    if (index >= 0) {
      shortcuts.value.splice(index, 1)
    }
  }

  // 获取快捷键字符串表示
  const getShortcutText = (shortcut: Shortcut): string => {
    const parts: string[] = []
    
    if (shortcut.ctrl || shortcut.meta) parts.push('Ctrl')
    if (shortcut.alt) parts.push('Alt')
    if (shortcut.shift) parts.push('Shift')
    parts.push(shortcut.key.toUpperCase())
    
    return parts.join(' + ')
  }

  // 格式化快捷键显示
  const formatShortcut = (shortcut: Shortcut): string => {
    return getShortcutText(shortcut)
  }

  // 检查组合键是否正在被按下
  const isComboPressed = (keys: string[]): boolean => {
    return keys.every(k => pressedKeys.value.includes(k))
  }

  return {
    shortcuts,
    showHelp,
    helpVisibleRef,
    pressedKeys,
    addShortcut,
    removeShortcut,
    getShortcutText,
    formatShortcut,
    isComboPressed,
    handleKeydown,
    handleKeyup
  }
}

// 导航辅助函数
function navigateTo(path: string) {
  // 延迟执行，确保在组件挂载后可以访问 router
  setTimeout(() => {
    try {
      const router = (window as any).__appRouter
      if (router) {
        router.push(path)
      }
    } catch (e) {
      console.log('导航到:', path)
    }
  }, 10)
}

// 切换深色模式
function toggleDarkMode() {
  const event = new CustomEvent('toggleDarkMode')
  window.dispatchEvent(event)
}

// 显示/隐藏帮助
let helpToggleCallback: (() => void) | null = null
function toggleHelp() {
  if (helpToggleCallback) {
    helpToggleCallback()
  }
}

// 关闭模态框
function closeModal() {
  const event = new CustomEvent('closeModal')
  window.dispatchEvent(event)
}

// 触发操作
function triggerAction(action: string) {
  const event = new CustomEvent('shortcutAction', { detail: { action } })
  window.dispatchEvent(event)
}

// 导出快捷键帮助组件数据
export function getShortcutsForHelp() {
  return DEFAULT_SHORTCUTS.map(s => ({
    key: s.key,
    description: s.description,
    shortcut: (() => {
      const parts: string[] = []
      if (s.ctrl || s.meta) parts.push('Ctrl')
      if (s.alt) parts.push('Alt')
      if (s.shift) parts.push('Shift')
      parts.push(s.key.toUpperCase())
      return parts.join(' + ')
    })()
  }))
}

export function setHelpToggleCallback(callback: () => void) {
  helpToggleCallback = callback
}
