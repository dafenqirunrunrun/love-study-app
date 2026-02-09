<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 倒计时逻辑 - 从设置中读取
const countdownSettings = ref({
  eventName: '学习目标',
  targetDate: '2025-12-21'
})

const countdownDays = computed(() => {
  if (!countdownSettings.value.targetDate) return 0
  const target = new Date(countdownSettings.value.targetDate)
  const today = new Date()
  const diff = target - today
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

const eventName = computed(() => countdownSettings.value.eventName || '目标')

// 从 LocalStorage 获取数据
const getFromStorage = (key, defaultVal) => {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : defaultVal
  } catch (e) {
    return defaultVal
  }
}

// 修复：focusHistory 在其他页面存为 Object { "日期": { minutes, sessions } }，需要转换为 Array
const normalizeFocusHistory = (data) => {
  if (!data) return []
  if (Array.isArray(data)) return data
  // Object 格式转换为 Array
  return Object.entries(data).map(([date, value]) => ({
    date,
    ...value
  }))
}

const tasks = ref(getFromStorage('tasks', []))
const focusHistoryRaw = ref(getFromStorage('focusHistory', {}))
const focusHistory = computed(() => normalizeFocusHistory(focusHistoryRaw.value))
const checkinHistory = ref(getFromStorage('checkinHistory', []))
const lovePoints = ref(getFromStorage('lovePoints', 0))
const dailyMessage = ref(getFromStorage('dailyMessage', { quote: '', author: '' }))
const habits = ref(getFromStorage('habits', []))

// 本周挑战数据 - 从 LocalStorage 读取
const weeklyChallenge = ref({
  checkinStreak: 3,      // 连续打卡天数
  checkinGoal: 5,        // 目标打卡天数
  focusMinutes: 240,     // 专注分钟数
  focusGoalMinutes: 300  // 目标专注分钟数
})

// 学习记录数据 - 从 LocalStorage 读取
const learningStats = ref({
  streakDays: 0,     // 连续学习天数
  totalDays: 0      // 总学习天数
})

// 今日任务
const todayTasks = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  return tasks.value.filter(t => {
    const taskDate = t.date || t.createdAt?.split('T')[0]
    return taskDate === todayStr && !t.completed
  }).slice(0, 8)
})

// 统计数据
const todayFocusMinutes = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  return focusHistory.value
    .filter(f => f.date === todayStr && f.completed)
    .reduce((sum, f) => sum + (f.duration || 0), 0)
})

const todayCheckins = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  return checkinHistory.value.filter(c => c.date === todayStr).length
})

const completedTasksCount = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  return tasks.value.filter(t => {
    const taskDate = t.date || t.createdAt?.split('T')[0]
    return taskDate === todayStr && t.completed
  }).length
})

// 展开更多
const showMore = ref(false)

// 跳转到对应页面
const navigateTo = (path) => {
  router.push(path)
}

// 刷新数据
const refreshData = () => {
  tasks.value = getFromStorage('tasks', [])
  focusHistoryRaw.value = getFromStorage('focusHistory', {})
  checkinHistory.value = getFromStorage('checkinHistory', [])
  lovePoints.value = getFromStorage('lovePoints', 0)
  dailyMessage.value = getFromStorage('dailyMessage', { quote: '', author: '' })
  habits.value = getFromStorage('habits', [])

  // 加载倒计时设置
  const savedCountdown = localStorage.getItem('countdownSettings')
  if (savedCountdown) {
    try {
      countdownSettings.value = JSON.parse(savedCountdown)
    } catch (e) {
      console.error('Failed to parse countdown settings:', e)
    }
  }

  // 加载本周挑战数据
  const savedChallenge = localStorage.getItem('weeklyChallenge')
  if (savedChallenge) {
    try {
      weeklyChallenge.value = JSON.parse(savedChallenge)
    } catch (e) {
      console.error('Failed to parse weekly challenge:', e)
    }
  }

  // 加载学习记录数据
  const savedStats = localStorage.getItem('learningStats')
  if (savedStats) {
    try {
      learningStats.value = JSON.parse(savedStats)
    } catch (e) {
      console.error('Failed to parse learning stats:', e)
    }
  }
}

onMounted(() => {
  refreshData()
  window.addEventListener('storage', refreshData)
})
</script>

<template>
  <div class="home-page">
    <!-- 顶部倒计时卡片 -->
    <div class="hero-countdown glass-card" @click="navigateTo('/settings')">
      <div class="countdown-header">
        <span class="countdown-title">{{ eventName }}倒计时</span>
        <span class="countdown-icon">🎯</span>
      </div>
      <div class="countdown-main">
        <span class="countdown-number">{{ countdownDays }}</span>
        <span class="countdown-unit">天</span>
      </div>
      <div class="countdown-date">{{ countdownSettings.targetDate ? new Date(countdownSettings.targetDate).toLocaleDateString('zh-CN') : '未设置' }}</div>
    </div>

    <!-- 今日概览 -->
    <div class="overview-section">
      <h2 class="section-title">今日概览</h2>
      
      <!-- 今日时间轴 -->
      <div class="timeline-section glass-card" @click="navigateTo('/tasks')">
        <div class="timeline-header">
          <span class="timeline-icon">📋</span>
          <span class="timeline-title">今日计划</span>
          <span class="timeline-count">{{ todayTasks.length }}项任务</span>
        </div>
        
        <div class="timeline-list" v-if="todayTasks.length > 0">
          <div 
            v-for="(task, index) in todayTasks" 
            :key="task.id || index"
            class="timeline-item"
            :class="['priority-' + (task.priority || 'normal')]"
          >
            <div class="timeline-dot"></div>
            <div class="task-content">
              <span class="task-text">{{ task.text }}</span>
              <div class="task-meta">
                <span class="task-time" v-if="task.time">{{ task.time }}</span>
                <span class="task-tag" :class="task.subject || 'default'">
                  {{ task.subject || '通用' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="timeline-empty" v-else>
          <span class="empty-icon">✨</span>
          <span class="empty-text">今日任务已完成，休息一下吧！</span>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card glass-card" @click="navigateTo('/focus')">
          <div class="stat-icon">⏱️</div>
          <div class="stat-value">{{ Math.floor(todayFocusMinutes / 60) }}h{{ todayFocusMinutes % 60 }}m</div>
          <div class="stat-label">今日专注</div>
        </div>
        
        <div class="stat-card glass-card" @click="navigateTo('/checkin')">
          <div class="stat-icon">✅</div>
          <div class="stat-value">{{ todayCheckins }}</div>
          <div class="stat-label">今日打卡</div>
        </div>
        
        <div class="stat-card glass-card" @click="navigateTo('/tasks')">
          <div class="stat-icon">📝</div>
          <div class="stat-value">{{ completedTasksCount }}/{{ todayTasks.length + completedTasksCount }}</div>
          <div class="stat-label">完成任务</div>
        </div>
        
        <div class="stat-card glass-card" @click="navigateTo('/points')">
          <div class="stat-icon">💎</div>
          <div class="stat-value">{{ lovePoints }}</div>
          <div class="stat-label">当前积分</div>
        </div>
      </div>
    </div>

    <!-- 展开更多区域 -->
    <div class="more-section">
      <button class="toggle-more" @click="showMore = !showMore">
        <span>{{ showMore ? '收起' : '展开' }}更多</span>
        <span class="toggle-icon">{{ showMore ? '▲' : '▼' }}</span>
      </button>
      
      <transition name="slide">
        <div class="more-content glass-card" v-if="showMore">
          <!-- 每日一句 -->
          <div class="widget-card" @click="navigateTo('/checkin')">
            <div class="widget-header">
              <span class="widget-icon">📖</span>
              <span class="widget-title">每日一句</span>
            </div>
            <div class="widget-content">
              <p class="quote-text">"{{ dailyMessage.quote || '志不立，天下无可成之事。' }}"</p>
              <p class="quote-author">— {{ dailyMessage.author || '王阳明' }}</p>
            </div>
          </div>
          
          <!-- 本周挑战 -->
          <div class="widget-card" @click="navigateTo('/checkin')">
            <div class="widget-header">
              <span class="widget-icon">🏆</span>
              <span class="widget-title">本周挑战</span>
            </div>
            <div class="widget-content">
              <div class="challenge-item">
                <span class="challenge-label">连续打卡</span>
                <div class="challenge-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: (weeklyChallenge.checkinStreak / weeklyChallenge.checkinGoal * 100) + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ weeklyChallenge.checkinStreak }}/{{ weeklyChallenge.checkinGoal }}天</span>
                </div>
              </div>
              <div class="challenge-item">
                <span class="challenge-label">专注时长</span>
                <div class="challenge-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: (weeklyChallenge.focusMinutes / weeklyChallenge.focusGoalMinutes * 100) + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ Math.floor(weeklyChallenge.focusMinutes / 60) }}h{{ weeklyChallenge.focusMinutes % 60 }}m</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 学习记录 -->
          <div class="widget-card" @click="navigateTo('/stats')">
            <div class="widget-header">
              <span class="widget-icon">🔥</span>
              <span class="widget-title">学习记录</span>
            </div>
            <div class="widget-content streak-content">
              <div class="streak-badge">
                <span class="streak-number">{{ learningStats.streakDays }}</span>
                <span class="streak-label">连续学习</span>
              </div>
              <div class="streak-badge">
                <span class="streak-number">{{ learningStats.totalDays }}</span>
                <span class="streak-label">总学习天数</span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 悬浮快捷操作 -->
    <div class="fab-container">
      <div class="fab-wrapper">
        <button class="fab main" @click="navigateTo('/tasks')">+</button>
        <div class="fab-menu" v-if="false">
          <button class="fab mini" @click="navigateTo('/tasks')">📝</button>
          <button class="fab mini" @click="navigateTo('/focus')">⏱️</button>
          <button class="fab mini" @click="navigateTo('/checkin')">✅</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 16px;
  padding-bottom: 100px;
}

/* 倒计时卡片 */
.hero-countdown {
  background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
  padding: 24px;
  border-radius: 20px;
  color: white;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hero-countdown:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(255, 107, 107, 0.3);
}

.countdown-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.countdown-title {
  font-size: 16px;
  font-weight: 500;
  opacity: 0.9;
}

.countdown-main {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 4px;
}

.countdown-number {
  font-size: 80px;
  font-weight: 700;
  line-height: 1;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
}

.countdown-unit {
  font-size: 28px;
  font-weight: 500;
}

.countdown-date {
  margin-top: 12px;
  font-size: 14px;
  opacity: 0.8;
}

/* 今日概览 */
.overview-section {
  margin-top: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

/* 时间轴 */
.timeline-section {
  padding: 20px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.timeline-icon {
  font-size: 20px;
}

.timeline-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.timeline-count {
  font-size: 12px;
  color: #666;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.timeline-item:hover {
  background: rgba(255, 255, 255, 0.8);
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.priority-high .timeline-dot {
  background: #ff6b6b;
}

.priority-medium .timeline-dot {
  background: #feca57;
}

.priority-normal .timeline-dot {
  background: #48dbfb;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-text {
  display: block;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.task-time {
  font-size: 12px;
  color: #666;
}

.task-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.timeline-empty {
  text-align: center;
  padding: 32px;
  color: #666;
}

.empty-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-card {
  padding: 16px;
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

/* 展开更多 */
.more-section {
  margin-top: 20px;
}

.toggle-more {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.more-content {
  margin-top: 12px;
  padding: 16px;
  border-radius: 20px;
}

.widget-card {
  padding: 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.widget-card:last-child {
  margin-bottom: 0;
}

.widget-card:hover {
  background: rgba(255, 255, 255, 0.8);
}

.widget-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.widget-icon {
  font-size: 18px;
}

.widget-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.widget-content {
  color: #666;
}

.quote-text {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 8px;
  font-style: italic;
}

.quote-author {
  font-size: 12px;
  text-align: right;
}

.challenge-item {
  margin-bottom: 12px;
}

.challenge-item:last-child {
  margin-bottom: 0;
}

.challenge-label {
  display: block;
  font-size: 12px;
  margin-bottom: 4px;
}

.challenge-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b 0%, #feca57 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
  min-width: 40px;
}

.streak-content {
  display: flex;
  gap: 24px;
}

.streak-badge {
  text-align: center;
}

.streak-number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #ff6b6b;
}

.streak-label {
  font-size: 12px;
  color: #666;
}

/* 动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* 悬浮按钮 */
.fab-container {
  position: fixed;
  bottom: 100px;
  right: 20px;
  z-index: 100;
}

.fab-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab.main {
  background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.4);
}

.fab.main:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 30px rgba(255, 107, 107, 0.5);
}

.fab.mini {
  width: 44px;
  height: 44px;
  font-size: 18px;
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.fab-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
