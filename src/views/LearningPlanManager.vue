<template>
  <div class="learning-plan-manager">
    <!-- 页面头部 -->
    <div class="page-header glass-card animate-fade-in-up">
      <div class="header-content">
        <h1 class="page-title">🧠 AI学习计划生成器</h1>
        <p class="page-desc">智能规划你的学习路径</p>
      </div>
      <div class="header-stats" v-if="savedPlans.length > 0">
        <span class="stat-badge">已保存 {{ savedPlans.length }} 个计划</span>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 向导模式 -->
      <LearningPlanWizard 
        v-if="viewMode === 'wizard'"
        @generate="handleGenerate"
        @cancel="viewMode = 'list'"
      />

      <!-- 预览模式 -->
      <LearningPlanPreview 
        v-else-if="viewMode === 'preview' && currentPlan"
        :plan="currentPlan"
        @edit="viewMode = 'wizard'"
        @import="handleImportTasks"
      />

      <!-- 列表模式 -->
      <div v-else class="plans-list glass-card animate-fade-in-up">
        <div class="list-header">
          <h2 class="section-title">📚 我的学习计划</h2>
          <button class="create-btn" @click="viewMode = 'wizard'">
            + 创建新计划
          </button>
        </div>

        <div v-if="savedPlans.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>还没有学习计划</h3>
          <p>创建第一个AI学习计划，开始智能备考之旅！</p>
          <button class="glass-btn primary" @click="viewMode = 'wizard'">
            立即创建
          </button>
        </div>

        <div v-else class="plans-grid">
          <div 
            v-for="plan in savedPlans" 
            :key="plan.id"
            class="plan-card glass-card"
            @click="viewPlan(plan)"
          >
            <div class="plan-card-header">
              <h3 class="plan-name">{{ plan.name }}</h3>
              <span class="plan-date">{{ formatDate(plan.createdAt) }}</span>
            </div>
            <div class="plan-card-stats">
              <div class="mini-stat">
                <span class="mini-value">{{ plan.totalDays }}</span>
                <span class="mini-label">天</span>
              </div>
              <div class="mini-stat">
                <span class="mini-value">{{ plan.phases.length }}</span>
                <span class="mini-label">阶段</span>
              </div>
              <div class="mini-stat">
                <span class="mini-value">{{ plan.subjects.length }}</span>
                <span class="mini-label">科目</span>
              </div>
            </div>
            <div class="plan-card-subjects">
              <span 
                v-for="subject in plan.subjects.slice(0, 4)" 
                :key="subject"
                class="subject-tag"
              >
                {{ getSubjectEmoji(subject) }}
              </span>
            </div>
            <div class="plan-card-actions">
              <button 
                class="action-btn"
                @click.stop="deletePlan(plan.id)"
              >
                🗑️
              </button>
              <button 
                class="action-btn primary"
                @click.stop="importToTasks(plan)"
              >
                导入任务
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载动画 -->
    <div v-if="isGenerating" class="loading-overlay">
      <div class="loading-content glass-card">
        <div class="loading-spinner"></div>
        <h2 class="loading-title">🤖 AI正在生成学习计划</h2>
        <p class="loading-desc">正在分析你的需求并生成最佳方案...</p>
        <div class="loading-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
          </div>
          <span class="progress-text">{{ loadingProgress }}%</span>
        </div>
      </div>
    </div>

    <!-- Toast 通知 -->
    <div v-if="toast.show" class="toast-notification" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LearningPlanWizard from '../components/LearningPlanWizard.vue'
import LearningPlanPreview from '../components/LearningPlanPreview.vue'
import type { LearningConfig, LearningPlan } from '../types/LearningPlan'
import { useLearningPlanGenerator } from '../composables/useLearningPlanGenerator'

const { generatePlan } = useLearningPlanGenerator()

const viewMode = ref<'list' | 'wizard' | 'preview'>('list')
const isGenerating = ref(false)
const loadingProgress = ref(0)
const currentPlan = ref<LearningPlan | null>(null)
const savedPlans = ref<LearningPlan[]>([])

const toast = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error' | 'info'
})

// 从本地存储加载保存的计划
onMounted(() => {
  const saved = localStorage.getItem('learningPlans')
  if (saved) {
    try {
      savedPlans.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse saved plans:', e)
    }
  }
})

// 保存计划到本地存储
const savePlan = (plan: LearningPlan) => {
  savedPlans.value.unshift(plan)
  localStorage.setItem('learningPlans', JSON.stringify(savedPlans.value))
}

const handleGenerate = async (config: LearningConfig) => {
  isGenerating.value = true
  loadingProgress.value = 0
  
  // 模拟加载进度
  const progressInterval = setInterval(() => {
    if (loadingProgress.value < 90) {
      loadingProgress.value += Math.random() * 15
    }
  }, 200)
  
  try {
    const plan = await generatePlan(config)
    loadingProgress.value = 100
    clearInterval(progressInterval)
    
    savePlan(plan)
    currentPlan.value = plan
    viewMode.value = 'preview'
    showToast('学习计划生成成功！', 'success')
  } catch (error) {
    clearInterval(progressInterval)
    showToast('生成失败，请重试', 'error')
  } finally {
    isGenerating.value = false
    loadingProgress.value = 0
  }
}

const viewPlan = (plan: LearningPlan) => {
  currentPlan.value = plan
  viewMode.value = 'preview'
}

const deletePlan = (planId: string) => {
  savedPlans.value = savedPlans.value.filter(p => p.id !== planId)
  localStorage.setItem('learningPlans', JSON.stringify(savedPlans.value))
  showToast('计划已删除', 'info')
}

const handleImportTasks = (tasks: any[]) => {
  // 获取现有任务
  const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]')
  
  // 修复：使用Set去重，基于任务ID只保留一个
  const existingTaskIds = new Set(existingTasks.map((t: any) => t.id))
  const newUniqueTasks = tasks.filter((t: any) => !existingTaskIds.has(t.id))
  const newTasks = [...newUniqueTasks, ...existingTasks]
  
  localStorage.setItem('tasks', JSON.stringify(newTasks))
  showToast(`已导入 ${newUniqueTasks.length} 个新任务到任务列表`, 'success')
}

const importToTasks = (plan: LearningPlan) => {
  const tasks = plan.weeklyTemplates.flatMap(week => 
    week.dailyTasks.flatMap(day =>
      day.sessions
        .filter(s => s.type === 'study' || s.type === 'review')
        .map((session, idx) => ({
          id: `${plan.id}_${day.date}_${idx}`,
          text: `[计划] ${session.task}`,
          completed: false,
          category: getCategory(session.subject),
          priority: session.priority,
          dueDate: day.date,
          notes: `${session.subject} | ${session.duration}分钟`,
          createdAt: new Date().toISOString(),
          fromPlan: plan.id
        }))
    )
  )
  
  const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]')
  
  // 修复：使用Set去重，基于任务ID只保留一个
  const existingTaskIds = new Set(existingTasks.map((t: any) => t.id))
  const newUniqueTasks = tasks.filter((t: any) => !existingTaskIds.has(t.id))
  const newTasks = [...newUniqueTasks, ...existingTasks]
  
  localStorage.setItem('tasks', JSON.stringify(newTasks))
  
  const duplicateCount = tasks.length - newUniqueTasks.length
  if (duplicateCount > 0) {
    showToast(`已成功导入 ${newUniqueTasks.length} 个新任务！（${duplicateCount}个重复任务已跳过）`, 'success')
  } else {
    showToast(`已成功导入 ${newUniqueTasks.length} 个任务！`, 'success')
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getSubjectEmoji = (subject: string) => {
  const emojis: Record<string, string> = {
    '英语': '🔤',
    '政治': '📰',
    '数学': '🔢',
    '专业课': '🎓'
  }
  return emojis[subject] || '📚'
}

const getCategory = (subject: string) => {
  const categories: Record<string, string> = {
    '英语': 'english',
    '政治': 'politics',
    '数学': 'math',
    '专业课': 'major'
  }
  return categories[subject] || 'study'
}

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}
</script>

<style scoped>
.learning-plan-manager {
  min-height: 100vh;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  margin-bottom: 30px;
}

.page-title {
  font-size: 32px;
  background: linear-gradient(135deg, var(--color-primary, #f97316), var(--color-pink, #f472b6));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.page-desc {
  color: var(--text-secondary, #4b5563);
  font-size: 16px;
}

.stat-badge {
  padding: 10px 20px;
  background: rgba(249, 115, 22, 0.15);
  border: 1px solid rgba(249, 115, 22, 0.3);
  border-radius: 20px;
  color: var(--color-primary, #f97316);
  font-size: 14px;
  font-weight: 500;
}

.plans-list {
  padding: 30px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-title {
  font-size: 24px;
  color: var(--text-primary, #1f2937);
  font-weight: 600;
}

.create-btn {
  padding: 12px 24px;
  background: var(--gradient-primary);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 24px;
  color: var(--text-primary, #1f2937);
  margin-bottom: 10px;
  font-weight: 600;
}

.empty-state p {
  color: var(--text-muted, #6b7280);
  margin-bottom: 30px;
}

.glass-btn {
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.glass-btn.primary {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
}

.glass-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(34, 197, 94, 0.4);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.plan-card {
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.plan-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.plan-name {
  font-size: 18px;
  color: var(--text-primary, #1f2937);
  font-weight: 600;
}

.plan-date {
  font-size: 12px;
  color: var(--text-muted, #6b7280);
}

.plan-card-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.mini-stat {
  text-align: center;
}

.mini-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(135deg, var(--color-primary, #f97316), var(--color-pink, #f472b6));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mini-label {
  font-size: 12px;
  color: var(--text-muted, #6b7280);
}

.plan-card-subjects {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.subject-tag {
  font-size: 18px;
  padding: 6px;
  background: rgba(249, 115, 22, 0.1);
  border-radius: 8px;
}

.plan-card-actions {
  display: flex;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid rgba(249, 115, 22, 0.15);
}

.action-btn {
  flex: 1;
  padding: 10px;
  background: rgba(249, 115, 22, 0.1);
  border: none;
  border-radius: 8px;
  color: var(--color-primary, #f97316);
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
  font-weight: 500;
}

.action-btn:hover {
  background: rgba(249, 115, 22, 0.2);
}

.action-btn.primary {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
  padding: 50px;
  max-width: 400px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--color-primary, #f97316);
  border-radius: 50%;
  margin: 0 auto 25px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-title {
  font-size: 22px;
  color: #fff;
  margin-bottom: 10px;
}

.loading-desc {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 30px;
}

.loading-progress {
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  transition: width 0.3s;
}

.progress-text {
  font-weight: bold;
  color: var(--color-primary, #f97316);
  min-width: 50px;
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

/* ===== 深色模式适配 ===== */
.dark .page-desc {
  color: var(--text-secondary, #cbd5e1);
}

.dark .section-title {
  color: #f1f5f9;
}

.dark .empty-state h3 {
  color: #f1f5f9;
}

.dark .empty-state p {
  color: var(--text-muted, #94a3b8);
}

.dark .plan-name {
  color: #f1f5f9;
}

.dark .plan-date {
  color: var(--text-muted, #94a3b8);
}

.dark .mini-label {
  color: var(--text-muted, #94a3b8);
}

.dark .subject-tag {
  background: rgba(255, 255, 255, 0.1);
}

.dark .plan-card-actions {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.dark .action-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
}

.dark .action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
  }
}
</style>
