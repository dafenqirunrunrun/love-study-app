<template>
  <div class="learning-plan-preview">
    <!-- 计划概览头部 -->
    <div class="plan-header glass-card animate-fade-in-up">
      <div class="plan-title-section">
        <h1 class="plan-title">📋 {{ plan.name }}</h1>
        <p class="plan-date">创建于 {{ formatDate(plan.createdAt) }}</p>
      </div>
      
      <div class="plan-stats">
        <div class="stat-item">
          <span class="stat-value">{{ plan.totalDays }}</span>
          <span class="stat-label">总天数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ plan.totalHours }}</span>
          <span class="stat-label">总学时</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ plan.phases.length }}</span>
          <span class="stat-label">阶段数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ plan.subjects.length }}</span>
          <span class="stat-label">科目数</span>
        </div>
      </div>
    </div>

    <!-- 阶段概览 -->
    <div class="phases-section glass-card animate-fade-in-up" style="animation-delay: 0.1s">
      <h2 class="section-title">📊 阶段规划</h2>
      <div class="phases-timeline">
        <div 
          v-for="(phase, index) in plan.phases" 
          :key="index"
          class="phase-card"
          :class="{ active: currentPhase === index }"
          @click="currentPhase = index"
        >
          <div class="phase-header">
            <span class="phase-icon">
              {{ index === 0 ? '📖' : index === 1 ? '💪' : '🚀' }}
            </span>
            <div class="phase-info">
              <h3>{{ phase.name }}</h3>
              <p>第{{ phase.startWeek }}周 - 第{{ phase.endWeek}}周 · {{ phase.duration }}周</p>
            </div>
          </div>
          <div class="phase-focus">
            <span 
              v-for="focus in phase.focus" 
              :key="focus"
              class="focus-tag"
            >
              {{ focus }}
            </span>
          </div>
          <div class="phase-hours">
            ⏱️ 每周约 {{ Math.round(phase.weeklyHours) }} 小时
          </div>
        </div>
      </div>
    </div>

    <!-- 当前阶段详情 -->
    <div class="phase-detail glass-card animate-fade-in-up" style="animation-delay: 0.2s" v-if="selectedPhase">
      <div class="detail-header">
        <h2 class="section-title">{{ selectedPhase.name }} · 目标清单</h2>
        <p class="phase-duration">持续 {{ selectedPhase.duration }} 周</p>
      </div>
      
      <div class="goals-list">
        <div 
          v-for="(goal, idx) in selectedPhase.goals" 
          :key="idx"
          class="goal-item"
        >
          <span class="goal-check">○</span>
          <span class="goal-text">{{ goal }}</span>
        </div>
      </div>
    </div>

    <!-- 周计划预览 -->
    <div class="weekly-section glass-card animate-fade-in-up" style="animation-delay: 0.3s">
      <div class="section-header">
        <h2 class="section-title">📅 本周学习计划</h2>
        <div class="week-nav">
          <button 
            class="nav-btn"
            @click="prevWeek"
            :disabled="currentWeek <= 1"
          >
            ←
          </button>
          <span class="week-label">第 {{ currentWeek }} 周</span>
          <button 
            class="nav-btn"
            @click="nextWeek"
            :disabled="currentWeek >= plan.weeklyTemplates.length"
          >
            →
          </button>
        </div>
      </div>
      
      <div v-if="selectedWeek" class="week-detail">
        <div class="week-theme">
          <span class="theme-icon">📌</span>
          <span>{{ selectedWeek.theme }}</span>
        </div>
        
        <div class="week-goals">
          <span class="goals-label">本周目标：</span>
          <span v-for="goal in selectedWeek.goals" :key="goal" class="week-goal-tag">
            {{ goal }}
          </span>
        </div>
        
        <div class="daily-schedule">
          <div 
            v-for="(day, dayIdx) in selectedWeek.dailyTasks" 
            :key="dayIdx"
            class="day-card"
          >
            <div class="day-header">
              <span class="day-name">{{ getDayName(day.dayOfWeek) }}</span>
              <span class="day-date">{{ day.date }}</span>
            </div>
            <div class="day-theme">{{ day.dayTheme }}</div>
            <div class="day-hours">{{ day.totalHours.toFixed(1) }}小时</div>
            <div class="sessions-preview">
              <span 
                v-for="session in day.sessions.slice(0, 3)" 
                :key="session.task"
                class="session-tag"
                :class="session.type"
              >
                {{ session.subjectEmoji }}
              </span>
              <span v-if="day.sessions.length > 3" class="more-sessions">
                +{{ day.sessions.length - 3 }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="week-tips">
          <span class="tips-icon">💡</span>
          <div class="tips-content">
            <p v-for="(tip, idx) in selectedWeek.tips" :key="idx">{{ tip }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="preview-actions">
      <button class="glass-btn secondary" @click="$emit('edit')">
        ✏️ 修改配置
      </button>
      <button class="glass-btn secondary" @click="exportTasks">
        📥 导出任务
      </button>
      <button class="glass-btn primary" @click="importToTasks">
        ✅ 导入任务列表
      </button>
    </div>

    <!-- Toast 通知 -->
    <div v-if="toast.show" class="toast-notification" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { LearningPlan, PlanPhase, WeeklyTemplate } from '../types/LearningPlan'
import { exportPlanToTasks } from '../composables/useLearningPlanGenerator'

const props = defineProps<{
  plan: LearningPlan
}>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'import', tasks: any[]): void
}>()

const currentPhase = ref(0)
const currentWeek = ref(1)

const selectedPhase = computed(() => props.plan.phases[currentPhase.value])
const selectedWeek = computed(() => props.plan.weeklyTemplates[currentWeek.value - 1])

const toast = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error' | 'info'
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getDayName = (day: number) => {
  const names = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  return names[day]
}

const prevWeek = () => {
  if (currentWeek.value > 1) {
    currentWeek.value--
  }
}

const nextWeek = () => {
  if (currentWeek.value < props.plan.weeklyTemplates.length) {
    currentWeek.value++
  }
}

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const exportTasks = () => {
  const tasks = exportPlanToTasks(props.plan)
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  // 修复：使用本地时区格式作为文件名
  const now = new Date()
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  a.download = `学习计划任务_${dateStr}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast('任务已导出为JSON文件', 'success')
}

const importToTasks = () => {
  const tasks = exportPlanToTasks(props.plan)
  emit('import', tasks)
  showToast(`已成功导入 ${tasks.length} 个任务到任务列表！`, 'success')
}
</script>

<style scoped>
.learning-plan-preview {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.plan-header {
  padding: 30px;
  margin-bottom: 20px;
}

.plan-title-section {
  margin-bottom: 25px;
}

.plan-title {
  font-size: 28px;
  background: linear-gradient(135deg, #fff, #f97316);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.plan-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.plan-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.stat-value {
  display: block;
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, #f97316, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.phases-section {
  padding: 25px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  margin-bottom: 20px;
  color: #fff;
}

.phases-timeline {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.phase-card {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.phase-card:hover {
  background: rgba(255, 255, 255, 0.1);
}

.phase-card.active {
  background: rgba(249, 115, 22, 0.2);
  border-color: #f97316;
}

.phase-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.phase-icon {
  font-size: 28px;
}

.phase-info h3 {
  font-size: 16px;
  margin-bottom: 4px;
}

.phase-info p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.phase-focus {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.focus-tag {
  padding: 4px 10px;
  background: rgba(249, 115, 22, 0.2);
  border-radius: 12px;
  font-size: 12px;
  color: #f97316;
}

.phase-hours {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.phase-detail {
  padding: 25px;
  margin-bottom: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.phase-duration {
  color: rgba(255, 255, 255, 0.6);
}

.goals-list {
  display: grid;
  gap: 12px;
}

.goal-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.goal-check {
  font-size: 20px;
  color: #f97316;
}

.goal-text {
  color: rgba(255, 255, 255, 0.9);
}

.weekly-section {
  padding: 25px;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.week-nav {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(249, 115, 22, 0.3);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.week-label {
  font-weight: 500;
  min-width: 100px;
  text-align: center;
}

.week-detail {
  margin-top: 20px;
}

.week-theme {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(244, 114, 182, 0.2));
  border-radius: 12px;
  margin-bottom: 15px;
}

.theme-icon {
  font-size: 20px;
}

.week-goals {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.goals-label {
  color: rgba(255, 255, 255, 0.7);
}

.week-goal-tag {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  font-size: 13px;
}

.daily-schedule {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.day-card {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  text-align: center;
}

.day-header {
  margin-bottom: 8px;
}

.day-name {
  display: block;
  font-weight: 500;
  margin-bottom: 4px;
}

.day-date {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.day-theme {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  min-height: 32px;
}

.day-hours {
  font-size: 12px;
  color: #f97316;
  font-weight: 500;
  margin-bottom: 10px;
}

.sessions-preview {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
}

.session-tag {
  font-size: 14px;
}

.more-sessions {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.week-tips {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 3px solid #22c55e;
}

.tips-icon {
  font-size: 20px;
}

.tips-content p {
  margin: 4px 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.preview-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.glass-btn {
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.glass-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.glass-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.glass-btn.primary {
  flex: 1;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
}

.glass-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(34, 197, 94, 0.4);
}

.toast-notification {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 28px;
  border-radius: 12px;
  font-weight: 500;
  animation: slideUp 0.3s ease;
  z-index: 1000;
}

.toast-notification.success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
}

.toast-notification.error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
}

.toast-notification.info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@media (max-width: 768px) {
  .plan-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .phases-timeline {
    grid-template-columns: 1fr;
  }
  
  .daily-schedule {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .preview-actions {
    flex-direction: column;
  }
}

/* ===== 日间模式修复 - 解决白底白字问题 ===== */
/* 注意：只修改日间模式，不影响深色模式 */

/* 计划日期文字 */
.learning-plan-preview:not(.dark) .plan-date {
  color: var(--text-muted, #6b7280);
}

/* 统计标签 */
.learning-plan-preview:not(.dark) .stat-label {
  color: var(--text-secondary, #4b5563);
}

.learning-plan-preview:not(.dark) .stat-item {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(249, 115, 22, 0.2);
}

/* 区块标题 */
.learning-plan-preview:not(.dark) .section-title {
  color: var(--text-primary, #1f2937);
  font-weight: 600;
}

/* 阶段卡片 */
.learning-plan-preview:not(.dark) .phase-card {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(249, 115, 22, 0.2);
}

.learning-plan-preview:not(.dark) .phase-card:hover {
  background: rgba(255, 255, 255, 0.9);
}

.learning-plan-preview:not(.dark) .phase-card.active {
  background: rgba(249, 115, 22, 0.15);
  border-color: var(--color-primary, #f97316);
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.2);
}

.learning-plan-preview:not(.dark) .phase-info h3 {
  color: var(--text-primary, #1f2937);
  font-weight: 600;
}

.learning-plan-preview:not(.dark) .phase-info p {
  color: var(--text-muted, #6b7280);
}

.learning-plan-preview:not(.dark) .phase-hours {
  color: var(--text-secondary, #4b5563);
}

/* 阶段持续时间 */
.learning-plan-preview:not(.dark) .phase-duration {
  color: var(--text-muted, #6b7280);
}

/* 目标列表 */
.learning-plan-preview:not(.dark) .goal-item {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(249, 115, 22, 0.1);
}

.learning-plan-preview:not(.dark) .goal-text {
  color: var(--text-primary, #1f2937);
}

/* 导航按钮 */
.learning-plan-preview:not(.dark) .nav-btn {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(249, 115, 22, 0.3);
  color: var(--text-primary, #1f2937);
}

.learning-plan-preview:not(.dark) .nav-btn:hover:not(:disabled) {
  background: rgba(249, 115, 22, 0.2);
  color: var(--color-primary, #f97316);
}

/* 周标签 */
.learning-plan-preview:not(.dark) .week-label {
  color: var(--text-primary, #1f2937);
}

/* 周主题背景 */
.learning-plan-preview:not(.dark) .week-theme {
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.2);
  color: var(--text-primary, #1f2937);
}

/* 目标标签 */
.learning-plan-preview:not(.dark) .goals-label {
  color: var(--text-secondary, #4b5563);
}

.learning-plan-preview:not(.dark) .week-goal-tag {
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.2);
  color: var(--text-primary, #1f2937);
}

/* 每日卡片 */
.learning-plan-preview:not(.dark) .day-card {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(249, 115, 22, 0.1);
}

.learning-plan-preview:not(.dark) .day-name {
  color: var(--text-primary, #1f2937);
}

.learning-plan-preview:not(.dark) .day-date {
  color: var(--text-muted, #6b7280);
}

.learning-plan-preview:not(.dark) .day-theme {
  color: var(--text-secondary, #4b5563);
}

.learning-plan-preview:not(.dark) .day-hours {
  color: var(--color-primary, #f97316);
}

/* 更多会话 */
.learning-plan-preview:not(.dark) .more-sessions {
  color: var(--text-muted, #6b7280);
}

/* 周提示 */
.learning-plan-preview:not(.dark) .week-tips {
  background: rgba(255, 255, 255, 0.7);
  border-left-color: var(--color-primary, #f97316);
}

.learning-plan-preview:not(.dark) .tips-content p {
  color: var(--text-secondary, #4b5563);
}

/* 二次按钮 */
.learning-plan-preview:not(.dark) .glass-btn.secondary {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(249, 115, 22, 0.3);
  color: var(--text-primary, #1f2937);
}

.learning-plan-preview:not(.dark) .glass-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.95);
  color: var(--color-primary, #f97316);
}

/* 计划标题渐变 - 日间模式 */
.learning-plan-preview:not(.dark) .plan-title {
  background: linear-gradient(135deg, var(--color-primary, #f97316), var(--color-pink, #f472b6));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 焦点标签 */
.learning-plan-preview:not(.dark) .focus-tag {
  background: rgba(249, 115, 22, 0.15);
  border: 1px solid rgba(249, 115, 22, 0.3);
  color: var(--color-primary, #f97316);
}

/* 统计数值渐变 */
.learning-plan-preview:not(.dark) .stat-value {
  background: linear-gradient(135deg, var(--color-primary, #f97316), var(--color-pink, #f472b6));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 目标勾选 */
.learning-plan-preview:not(.dark) .goal-check {
  color: var(--color-primary, #f97316);
}
</style>
