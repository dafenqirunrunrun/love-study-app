// useKeyboardShortcuts.js - 键盘快捷键管理
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// Global state
const isEnabled = ref(true)
const showShortcutsHelp = ref(false)
const pressedKeys = ref([])

// Shortcuts definition
const shortcuts = [
  {
    key: 'k',
    ctrl: true,
    macCtrl: true,
    label: '打开搜索',
    description: '打开全局搜索框',
    action: 'openSearch',
    category: 'navigation'
  },
  {
    key: 'n',
    ctrl: false,
    macCtrl: false,
    label: '新建任务',
    description: '跳转到任务页面并聚焦输入框',
    action: 'newTask',
    category: 'tasks'
  },
  {
    key: '/',
    ctrl: false,
    macCtrl: false,
    label: '聚焦搜索',
    description: '在当前页面聚焦搜索',
    action: 'focusSearch',
    category: 'navigation'
  },
  {
    key: 'Escape',
    ctrl: false,
    macCtrl: false,
    label: '关闭弹窗',
    description: '关闭当前打开的弹窗',
    action: 'closeModal',
    category: 'navigation'
  },
  {
    key: 'ArrowLeft',
    ctrl: false,
    macCtrl: false,
    label: '上一个标签',
    description: '切换到左侧标签页',
    action: 'prevTab',
    category: 'navigation'
  },
  {
    key: 'ArrowRight',
    ctrl: false,
    macCtrl: false,
    label: '下一个标签',
    description: '切换到右侧标签页',
    action: 'nextTab',
    category: 'navigation'
  },
  {
    key: 'h',
    ctrl: false,
    macCtrl: false,
    label: '首页',
    description: '跳转到首页',
    action: 'goHome',
    category: 'navigation'
  },
  {
    key: 't',
    ctrl: false,
    macCtrl: false,
    label: '任务',
    description: '跳转到任务页面',
    action: 'goTasks',
    category: 'navigation'
  },
  {
    key: 'f',
    ctrl: false,
    macCtrl: false,
    label: '专注',
    description: '跳转到专注页面',
    action: 'goFocus',
    category: 'navigation'
  },
  {
    key: 'c',
    ctrl: false,
    macCtrl: false,
    label: '打卡',
    description: '跳转到习惯打卡页面',
    action: 'goCheckin',
    category: 'navigation'
  },
  {
    key: 's',
    ctrl: false,
    macCtrl: false,
    label: '统计',
    description: '跳转到数据统计页面',
    action: 'goStats',
    category: 'navigation'
  },
  {
    key: '?',
    ctrl: false,
    macCtrl: false,
    label: '显示帮助',
    description: '显示快捷键帮助',
    action: 'showHelp',
    category: 'help'
  }
]

// Action handlers
const actions = {}

// Setup keyboard shortcuts
function useKeyboardShortcutsFn(options = {}) {
  const router = useRouter()

  // Load settings
  onMounted(function() {
    try {
      const settings = JSON.parse(localStorage.getItem('settings') || '{}')
      isEnabled.value = settings.keyboardShortcutsEnabled !== false
      
      // Check if first time user
      const hasSeenHelp = localStorage.getItem('hasSeenShortcutsHelp')
      if (!hasSeenHelp) {
        setTimeout(function() {
          showShortcutsHelp.value = true
          localStorage.setItem('hasSeenShortcutsHelp', 'true')
        }, 5000)
      }
    } catch (e) {
      console.error('Error loading shortcut settings:', e)
    }
  })

  // Setup action handlers
  Object.assign(actions, {
    openSearch: options.openSearch || function() {},
    newTask: function() {
      router.push('/tasks')
      setTimeout(function() {
        var input = document.querySelector('input[placeholder*="添加新任务"]')
        if (input) input.focus()
      }, 300)
    },
    focusSearch: function() {
      var input = document.querySelector('input[placeholder*="搜索"]')
      if (input) input.focus()
    },
    closeModal: function() {
      var modals = document.querySelectorAll('.fixed.inset-0.z-\\[50\\]')
      if (modals.length > 0) {
        modals[0].click()
      }
    },
    prevTab: function() {
      var routes = ['/', '/tasks', '/focus', '/checkin', '/stats', '/rewards', '/journal', '/achievements']
      var currentIndex = routes.indexOf(router.currentRoute.value.path)
      if (currentIndex > 0) {
        router.push(routes[currentIndex - 1])
      }
    },
    nextTab: function() {
      var routes = ['/', '/tasks', '/focus', '/checkin', '/stats', '/rewards', '/journal', '/achievements']
      var currentIndex = routes.indexOf(router.currentRoute.value.path)
      if (currentIndex < routes.length - 1) {
        router.push(routes[currentIndex + 1])
      }
    },
    goHome: function() { router.push('/') },
    goTasks: function() { router.push('/tasks') },
    goFocus: function() { router.push('/focus') },
    goCheckin: function() { router.push('/checkin') },
    goStats: function() { router.push('/stats') },
    showHelp: function() { showShortcutsHelp.value = true },
    ...options
  })

  // Handle keydown
  function handleKeydown(e) {
    if (!isEnabled.value) return

    var tagName = e.target.tagName.toLowerCase()
    if (tagName === 'input' || tagName === 'textarea' || e.target.isContentEditable) {
      if (e.key === 'Escape') {
        actions.closeModal()
      }
      return
    }

    for (var i = 0; i < shortcuts.length; i++) {
      var shortcut = shortcuts[i]
      var ctrlPressed = e.ctrlKey || e.metaKey
      
      var matches = false
      
      if (shortcut.key === 'Escape') {
        matches = e.key === 'Escape'
      } else if (shortcut.ctrl) {
        matches = ctrlPressed && e.key.toLowerCase() === shortcut.key.toLowerCase()
      } else if (shortcut.macCtrl) {
        matches = (ctrlPressed || e.key === 'Meta') && e.key.toLowerCase() === shortcut.key.toLowerCase()
      } else {
        matches = e.key.toLowerCase() === shortcut.key.toLowerCase()
      }

      if (matches && !e.repeat) {
        e.preventDefault()
        var action = actions[shortcut.action]
        if (action) {
          action()
        }
        return
      }
    }
  }

  // Track pressed keys for display
  function handleKeyup(e) {
    pressedKeys.value = pressedKeys.value.filter(function(k) { return k !== e.key })
  }

  function handleKeydownTrack(e) {
    if (!pressedKeys.value.includes(e.key)) {
      pressedKeys.value.push(e.key)
    }
  }

  onMounted(function() {
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('keydown', handleKeydownTrack)
    window.addEventListener('keyup', handleKeyup)
  })

  onUnmounted(function() {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('keydown', handleKeydownTrack)
    window.removeEventListener('keyup', handleKeyup)
  })

  return {
    isEnabled: isEnabled,
    showShortcutsHelp: showShortcutsHelp,
    pressedKeys: pressedKeys,
    shortcuts: shortcuts,
    enable: function() {
      isEnabled.value = true
      saveSettings()
    },
    disable: function() {
      isEnabled.value = false
      saveSettings()
    },
    toggleHelp: function() {
      showShortcutsHelp.value = !showShortcutsHelp.value
    },
    closeHelp: function() {
      showShortcutsHelp.value = false
    }
  }
}

// Save keyboard shortcuts settings
function saveSettings() {
  try {
    var settings = JSON.parse(localStorage.getItem('settings') || '{}')
    settings.keyboardShortcutsEnabled = isEnabled.value
    localStorage.setItem('settings', JSON.stringify(settings))
  } catch (e) {
    console.error('Error saving shortcut settings:', e)
  }
}

// Get shortcuts by category
function getShortcutsByCategory() {
  var categories = {}
  
  for (var i = 0; i < shortcuts.length; i++) {
    var shortcut = shortcuts[i]
    if (!categories[shortcut.category]) {
      categories[shortcut.category] = []
    }
    categories[shortcut.category].push(shortcut)
  }
  
  return categories
}

// Check if a key combination is registered
function checkShortcut(e) {
  for (var i = 0; i < shortcuts.length; i++) {
    var shortcut = shortcuts[i]
    var ctrlPressed = e.ctrlKey || e.metaKey
    
    var matches = false
    
    if (shortcut.key === 'Escape') {
      matches = e.key === 'Escape'
    } else if (shortcut.ctrl) {
      matches = ctrlPressed && e.key.toLowerCase() === shortcut.key.toLowerCase()
    } else {
      matches = e.key.toLowerCase() === shortcut.key.toLowerCase()
    }

    if (matches) {
      return shortcut
    }
  }
  
  return null
}

// Export
export { shortcuts as DEFAULT_SHORTCUTS }
export { shortcuts }
export { getShortcutsByCategory }
export { checkShortcut }
export { useKeyboardShortcutsFn as useKeyboardShortcuts }
