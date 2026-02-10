// useNotifications.js - 浏览器通知管理
import { ref, onMounted, onUnmounted } from 'vue'

// Global state
const isSupported = ref(false)
const permission = ref('default')
const isEnabled = ref(true)

// Notification callbacks
const callbacks = {
  onTaskReminder: null,
  onFocusComplete: null,
  onAchievementUnlock: null,
  onDailyReminder: null
}

/**
 * Initialize notification system
 */
export function useNotifications() {
  onMounted(() => {
    // Check support
    isSupported.value = 'Notification' in window
    
    if (isSupported.value) {
      permission.value = Notification.permission
      
      // Load settings
      try {
        const settings = JSON.parse(localStorage.getItem('settings') || '{}')
        isEnabled.value = settings.notificationsEnabled !== false
      } catch (e) {
        console.error('Error loading notification settings:', e)
      }
    }
  })

  return {
    isSupported,
    permission,
    isEnabled
  }
}

/**
 * Request notification permission
 * @returns {Promise<boolean>} - Whether permission was granted
 */
export async function requestPermission() {
  if (!isSupported.value) {
    console.warn('Notifications not supported')
    return false
  }

  try {
    const result = await Notification.requestPermission()
    permission.value = result
    return result === 'granted'
  } catch (e) {
    console.error('Error requesting notification permission:', e)
    return false
  }
}

/**
 * Send a notification
 * @param {Object} options - Notification options
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {string} [options.icon] - Icon URL
 * @param {string} [options.tag] - Notification tag (for replacing)
 * @param {string} [options.type] - Notification type
 */
export function sendNotification({ title, body, icon, tag, type = 'info' }) {
  if (!isSupported.value || !isEnabled.value) {
    console.log('Notification disabled or not supported:', { title, body })
    return null
  }

  if (permission.value !== 'granted') {
    console.warn('Notification permission not granted')
    return null
  }

  try {
    const options = {
      body,
      icon: icon || '/favicon.ico',
      tag: tag || type,
      requireInteraction: type === 'urgent',
      silent: false
    }

    // Use emoji as badge if no icon
    if (!options.icon) {
      const emojis = {
        task: '📝',
        focus: '⏱️',
        achievement: '🏆',
        reminder: '⏰',
        info: 'ℹ️'
      }
      options.badge = emojis[type] || emojis.info
    }

    const notification = new Notification(title, options)

    // Handle click
    notification.onclick = () => {
      window.focus()
      notification.close()
      
      // Trigger callback
      if (type && callbacks[type]) {
        callbacks[type]()
      }
    }

    // Auto close after 5 seconds unless urgent
    if (type !== 'urgent') {
      setTimeout(() => notification.close(), 5000)
    }

    return notification
  } catch (e) {
    console.error('Error sending notification:', e)
    return null
  }
}

/**
 * Register notification callbacks
 * @param {Object} handlers - Event handlers
 */
export function registerCallbacks(handlers) {
  Object.assign(callbacks, handlers)
}

/**
 * Send task reminder notification
 * @param {Object} task - Task object
 */
export function sendTaskReminder(task) {
  if (!isEnabled.value) return

  const dueDate = task.dueDate 
    ? new Date(task.dueDate).toLocaleDateString('zh-CN')
    : ''

  sendNotification({
    title: '📝 任务提醒',
    body: task.text + (dueDate ? ` (截止: ${dueDate})` : ''),
    type: 'task',
    tag: `task-${task.id}`
  })
}

/**
 * Send focus complete notification
 * @param {Object} session - Focus session data
 */
export function sendFocusComplete(session) {
  if (!isEnabled.value) return

  const minutes = Math.round(session.duration / 60)

  sendNotification({
    title: '⏱️ 专注完成！',
    body: `太棒了！你刚刚完成了 ${minutes} 分钟的专注学习`,
    type: 'focus',
    tag: 'focus-complete'
  })
}

/**
 * Send achievement unlock notification
 * @param {Object} achievement - Achievement object
 */
export function sendAchievementUnlock(achievement) {
  if (!isEnabled.value) return

  sendNotification({
    title: '🏆 成就解锁！',
    body: `${achievement.icon} ${achievement.name} - ${achievement.description}`,
    type: 'achievement',
    tag: `achievement-${achievement.id}`
  })
}

/**
 * Send daily learning reminder
 * @param {Object} stats - Daily stats
 */
export function sendDailyReminder(stats) {
  if (!isEnabled.value) return

  const messages = [
    '今天还没有开始学习哦，快来制定计划吧！📚',
    '学习伴侣提醒你：今天的任务还没有完成呢 💪',
    '别忘了今天的打卡记录哦，保持连续打卡！🔥',
    '休息好了吗？让我们开始今天的学习吧！🌟'
  ]

  const message = messages[Math.floor(Math.random() * messages.length)]

  sendNotification({
    title: '⏰ 学习提醒',
    body: message,
    type: 'reminder',
    tag: 'daily-reminder'
  })
}

/**
 * Enable/disable notifications
 * @param {boolean} enabled - Whether to enable notifications
 */
export function setNotificationsEnabled(enabled) {
  isEnabled.value = enabled
  
  // Save to settings
  try {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}')
    settings.notificationsEnabled = enabled
    localStorage.setItem('settings', JSON.stringify(settings))
  } catch (e) {
    console.error('Error saving notification settings:', e)
  }
}

/**
 * Check for overdue tasks and send reminders
 * @param {Array} tasks - List of tasks
 */
export function checkOverdueTasks(tasks) {
  if (!isEnabled.value) return

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.completed) return false
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today
  })

  if (overdueTasks.length > 0) {
    sendNotification({
      title: '⚠️ 有任务已过期！',
      body: `你有 ${overdueTasks.length} 个任务已过期，请及时处理`,
      type: 'urgent',
      tag: 'overdue-tasks'
    })
  }
}

/**
 * Schedule a notification for a specific time
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Date} time - Time to send notification
 * @param {string} type - Notification type
 * @returns {number|null} - Timeout ID for cancellation
 */
export function scheduleNotification(title, body, time, type = 'reminder') {
  const now = Date.now()
  const target = time.getTime()
  const delay = target - now

  if (delay <= 0) {
    // Time has passed, send immediately
    return sendNotification({ title, body, type })
  }

  const timeoutId = setTimeout(() => {
    sendNotification({ title, body, type })
  }, delay)

  return timeoutId
}

/**
 * Cancel a scheduled notification
 * @param {number} timeoutId - Timeout ID from scheduleNotification
 */
export function cancelScheduledNotification(timeoutId) {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
}

export default {
  useNotifications,
  requestPermission,
  sendNotification,
  registerCallbacks,
  sendTaskReminder,
  sendFocusComplete,
  sendAchievementUnlock,
  sendDailyReminder,
  setNotificationsEnabled,
  checkOverdueTasks,
  scheduleNotification,
  cancelScheduledNotification
}
