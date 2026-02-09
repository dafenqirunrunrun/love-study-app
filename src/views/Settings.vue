<template>
  <div class="settings-page max-w-7xl mx-auto">
    <div class="glass-card p-8">
      <!-- 页面标题 -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span class="text-3xl animate-bounce-soft">⚙️</span>
          <span class="text-rainbow">设置</span>
        </h1>
      </div>

      <!-- 设置分组 -->
      <div class="settings-sections">
        <!-- 倒计时目标设置 -->
        <div class="settings-section">
          <h2 class="section-title">🎯 目标倒计时</h2>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">📌</span>
              <div class="setting-text">
                <span class="setting-name">目标名称</span>
                <span class="setting-desc">如：考研初试、面试、答辩等</span>
              </div>
            </div>
            <input
              type="text"
              v-model="countdownSettings.eventName"
              @blur="saveCountdownSettings"
              class="setting-input"
              placeholder="输入目标名称"
            />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">📅</span>
              <div class="setting-text">
                <span class="setting-name">目标日期</span>
                <span class="setting-desc">距离目标还有 {{ countdownDays }} 天</span>
              </div>
            </div>
            <input
              type="date"
              v-model="countdownSettings.targetDate"
              @change="saveCountdownSettings"
              class="setting-input"
            />
          </div>
        </div>

        <!-- 外观设置 -->
        <div class="settings-section">
          <h2 class="section-title">🎨 外观</h2>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">🌙</span>
              <div class="setting-text">
                <span class="setting-name">深色模式</span>
                <span class="setting-desc">切换深色/浅色主题</span>
              </div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="isDarkMode" @change="toggleDarkMode" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- 番茄钟设置 -->
        <div class="settings-section">
          <h2 class="section-title">⏱️ 番茄钟</h2>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">🎯</span>
              <div class="setting-text">
                <span class="setting-name">专注时长</span>
                <span class="setting-desc">每次专注的时间（分钟）</span>
              </div>
            </div>
            <input 
              type="number" 
              v-model="focusSettings.focus"
              class="setting-input"
              min="1"
              max="60"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">☕</span>
              <div class="setting-text">
                <span class="setting-name">短休息时长</span>
                <span class="setting-desc">专注后的休息时间（分钟）</span>
              </div>
            </div>
            <input 
              type="number" 
              v-model="focusSettings.shortBreak"
              class="setting-input"
              min="1"
              max="30"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">🌙</span>
              <div class="setting-text">
                <span class="setting-name">长休息时长</span>
                <span class="setting-desc">4次专注后的长休息（分钟）</span>
              </div>
            </div>
            <input 
              type="number" 
              v-model="focusSettings.longBreak"
              class="setting-input"
              min="1"
              max="60"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">🎯</span>
              <div class="setting-text">
                <span class="setting-name">每日目标</span>
                <span class="setting-desc">每天完成的专注次数</span>
              </div>
            </div>
            <input 
              type="number" 
              v-model="focusSettings.goal"
              class="setting-input"
              min="1"
              max="20"
            />
          </div>
        </div>

        <!-- 通知设置 -->
        <div class="settings-section">
          <h2 class="section-title">🔔 通知</h2>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">📅</span>
              <div class="setting-text">
                <span class="setting-name">任务提醒</span>
                <span class="setting-desc">到期任务提醒通知</span>
              </div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="notifications.taskReminder" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">⏰</span>
              <div class="setting-text">
                <span class="setting-name">专注提醒</span>
                <span class="setting-desc">开始专注的提醒</span>
              </div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="notifications.focusReminder" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">🎉</span>
              <div class="setting-text">
                <span class="setting-name">成就解锁</span>
                <span class="setting-desc">解锁成就时的通知</span>
              </div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="notifications.achievement" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- 数据管理 -->
        <div class="settings-section">
          <h2 class="section-title">💾 数据管理</h2>

          <div class="setting-item init-item">
            <div class="setting-info">
              <span class="setting-icon">🚀</span>
              <div class="setting-text">
                <span class="setting-name">初始化数据</span>
                <span class="setting-desc">新用户开始使用，重置所有数据</span>
              </div>
            </div>
            <button class="setting-btn init" @click="initializeData">
              初始化
            </button>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">📤</span>
              <div class="setting-text">
                <span class="setting-name">导出数据</span>
                <span class="setting-desc">导出所有数据到JSON文件</span>
              </div>
            </div>
            <button class="setting-btn" @click="exportData">
              导出
            </button>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">📥</span>
              <div class="setting-text">
                <span class="setting-name">导入数据</span>
                <span class="setting-desc">从JSON文件导入数据</span>
              </div>
            </div>
            <button class="setting-btn" @click="importData">
              导入
            </button>
          </div>
          
          <div class="setting-item danger">
            <div class="setting-info">
              <span class="setting-icon">🗑️</span>
              <div class="setting-text">
                <span class="setting-name">清除所有数据</span>
                <span class="setting-desc">删除所有本地存储的数据</span>
              </div>
            </div>
            <button class="setting-btn danger" @click="clearAllData">
              清除
            </button>
          </div>
        </div>

        <!-- 关于 -->
        <div class="settings-section">
          <h2 class="section-title">ℹ️ 关于</h2>
          
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-icon">📚</span>
              <div class="setting-text">
                <span class="setting-name">考研伴侣</span>
                <span class="setting-desc">版本 1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const isDarkMode = ref(false)

// 倒计时设置
const countdownSettings = ref({
  eventName: '考研初试',
  targetDate: '2025-12-21'
})

// 番茄钟设置
const focusSettings = ref({
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  goal: 8
})

// 通知设置
const notifications = ref({
  taskReminder: true,
  focusReminder: true,
  achievement: true
})

// 动态计算倒计时天数
const countdownDays = computed(() => {
  const target = new Date(countdownSettings.value.targetDate)
  const today = new Date()
  const diff = target - today
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

onMounted(() => {
  // 加载深色模式
  const savedDarkMode = localStorage.getItem('darkMode')
  isDarkMode.value = savedDarkMode === 'true'

  // 加载倒计时设置
  const savedCountdown = localStorage.getItem('countdownSettings')
  if (savedCountdown) {
    try {
      countdownSettings.value = JSON.parse(savedCountdown)
    } catch (e) {
      console.error('Failed to parse countdown settings:', e)
    }
  }

  // 加载番茄钟设置
  const savedSettings = localStorage.getItem('focusSettings')
  if (savedSettings) {
    try {
      focusSettings.value = JSON.parse(savedSettings)
    } catch (e) {
      console.error('Failed to parse focus settings:', e)
    }
  }

  // 加载通知设置
  const savedNotifications = localStorage.getItem('notificationSettings')
  if (savedNotifications) {
    try {
      notifications.value = JSON.parse(savedNotifications)
    } catch (e) {
      console.error('Failed to parse notification settings:', e)
    }
  }
})

// 保存倒计时设置
const saveCountdownSettings = () => {
  localStorage.setItem('countdownSettings', JSON.stringify(countdownSettings.value))
}

const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  localStorage.setItem('darkMode', isDarkMode.value.toString())
}

const exportData = () => {
  const data = {
    tasks: localStorage.getItem('tasks'),
    focusHistory: localStorage.getItem('focusHistory'),
    checkinHistory: localStorage.getItem('checkinHistory'),
    lovePoints: localStorage.getItem('lovePoints'),
    pointsHistory: localStorage.getItem('pointsHistory'),
    redeemHistory: localStorage.getItem('redeemHistory'),
    habits: localStorage.getItem('habits'),
    dailyJournal: localStorage.getItem('dailyJournal'),
    journalMood: localStorage.getItem('journalMood'),
    journalHistory: localStorage.getItem('journalHistory'),
    learningPlans: localStorage.getItem('learningPlans'),
    unlockedBadges: localStorage.getItem('unlockedBadges'),
    focusSettings: localStorage.getItem('focusSettings'),
    countdownSettings: localStorage.getItem('countdownSettings'),
    weeklyChallenge: localStorage.getItem('weeklyChallenge'),
    learningStats: localStorage.getItem('learningStats')
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `考研伴侣备份_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const importData = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          Object.keys(data).forEach(key => {
            if (data[key]) {
              localStorage.setItem(key, data[key])
            }
          })
          alert('数据导入成功！')
          window.location.reload()
        } catch (err) {
          alert('导入失败，请检查文件格式')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const clearAllData = () => {
  if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
    localStorage.clear()
    window.location.reload()
  }
}

const initializeData = () => {
  if (confirm('初始化将保留基本设置但清除所有学习数据（任务、打卡、积分等），确定要继续吗？')) {
    // 保留的设置项
    const settingsToKeep = [
      'darkMode',
      'focusSettings',
      'notificationSettings',
      'countdownSettings'
    ]

    // 获取需要保留的设置
    const keptSettings: Record<string, any> = {}
    settingsToKeep.forEach(key => {
      const val = localStorage.getItem(key)
      if (val) keptSettings[key] = val
    })

    // 清除所有数据
    localStorage.clear()

    // 恢复设置
    Object.keys(keptSettings).forEach(key => {
      localStorage.setItem(key, keptSettings[key])
    })

    // 重置学习数据到默认值
    localStorage.setItem('weeklyChallenge', JSON.stringify({
      checkinStreak: 0,
      checkinGoal: 5,
      focusMinutes: 0,
      focusGoalMinutes: 300
    }))
    localStorage.setItem('learningStats', JSON.stringify({
      streakDays: 0,
      totalDays: 0
    }))

    alert('初始化完成！欢迎开始新的学习之旅～')
    window.location.reload()
  }
}
</script>

<style scoped>
.settings-page {
  padding-bottom: 100px;
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

:global(.dark) .settings-section {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.settings-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
}

:global(.dark) .section-title {
  color: rgba(255, 255, 255, 0.8);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 12px;
}

:global(.dark) .setting-item {
  background: rgba(255, 255, 255, 0.05);
}

.setting-item.danger {
  background: #fef2f2;
}

:global(.dark) .setting-item.danger {
  background: rgba(239, 68, 68, 0.1);
}

.setting-item.init-item {
  background: #f0fdf4;
  border: 2px solid #86efac;
}

:global(.dark) .setting-item.init-item {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.setting-icon {
  font-size: 24px;
}

.setting-text {
  display: flex;
  flex-direction: column;
}

.setting-name {
  font-weight: 500;
  color: #1f2937;
}

:global(.dark) .setting-name {
  color: #fff;
}

.setting-desc {
  font-size: 12px;
  color: #6b7280;
}

:global(.dark) .setting-desc {
  color: rgba(255, 255, 255, 0.5);
}

.setting-input {
  width: 120px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  color: #1f2937;
  text-align: center;
}

:global(.dark) .setting-input {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.setting-input[type="date"] {
  width: 150px;
}

.toggle-switch {
  position: relative;
  width: 52px;
  height: 28px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #d1d5db;
  border-radius: 28px;
  transition: all 0.3s;
}

:global(.dark) .toggle-slider {
  background: rgba(255, 255, 255, 0.2);
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-switch input:checked + .toggle-slider {
  background: linear-gradient(135deg, #f97316, #f472b6);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(24px);
}

.setting-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #f97316, #f472b6);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.setting-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
}

.setting-btn.danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.setting-btn.danger:hover {
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
}

.setting-btn.init {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.setting-btn.init:hover {
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
}
</style>
