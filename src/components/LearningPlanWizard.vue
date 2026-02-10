<template>
  <div class="learning-plan-wizard">
    <!-- 步骤指示器 -->
    <div class="steps-indicator">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        class="step-item"
        :class="{ 
          active: currentStep === index,
          completed: currentStep > index
        }"
        @click="goToStep(index)"
      >
        <div class="step-circle">
          <span v-if="currentStep > index">✓</span>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <span class="step-label">{{ step }}</span>
      </div>
    </div>

    <!-- 步骤内容 -->
    <div class="step-content glass-card animate-fade-in-up">
      
      <!-- 步骤1: 基础信息 -->
      <div v-if="currentStep === 0" class="step-panel">
        <h2 class="step-title">📅 考试目标设置</h2>
        <p class="step-desc">告诉我你的学习目标，我来帮你规划学习计划</p>
        
        <div class="form-group">
          <label>考试日期</label>
          <input 
            type="date" 
            v-model="config.examDate"
            class="glass-input"
          />
        </div>
        
        <div class="form-group">
          <label>开始备考日期</label>
          <input 
            type="date" 
            v-model="config.startDate"
            class="glass-input"
          />
        </div>
        
        <div class="form-group">
          <label>每日学习时长</label>
          <div class="hours-selector">
            <button 
              v-for="h in [4, 6, 8, 10, 12]" 
              :key="h"
              class="hour-btn"
              :class="{ active: config.dailyHours === h }"
              @click="config.dailyHours = h"
            >
              {{ h }}小时
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label>当前阶段</label>
          <div class="phase-selector">
            <button 
              v-for="phase in phases" 
              :key="phase.value"
              class="phase-btn"
              :class="{ active: config.phase === phase.value }"
              @click="config.phase = phase.value"
            >
              <span class="phase-emoji">{{ phase.emoji }}</span>
              <span class="phase-name">{{ phase.label }}</span>
              <span class="phase-desc">{{ phase.desc }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 步骤2: 科目选择 -->
      <div v-if="currentStep === 1" class="step-panel">
        <h2 class="step-title">📚 选择学习科目</h2>
        <p class="step-desc">勾选你需要学习的科目</p>
        
        <div class="subjects-grid">
          <label 
            v-for="subject in availableSubjects" 
            :key="subject.id"
            class="subject-card"
            :class="{ selected: isSubjectSelected(subject.id) }"
          >
            <input 
              type="checkbox"
              :value="subject"
              v-model="config.subjects"
              class="hidden-checkbox"
            />
            <span class="subject-emoji">{{ subject.emoji }}</span>
            <span class="subject-name">{{ subject.name }}</span>
            <span v-if="isSubjectSelected(subject.id)" class="check-badge">✓</span>
          </label>
        </div>
        
        <div v-if="config.subjects.length > 0" class="selected-info">
          <p>已选择 {{ config.subjects.length }} 个科目</p>
          <div class="weight-info">
            <p>科目权重（决定时间分配）：</p>
            <div 
              v-for="subject in config.subjects" 
              :key="subject.id"
              class="weight-item"
            >
              <span>{{ subject.emoji }} {{ subject.name }}</span>
              <input 
                type="range" 
                min="1" 
                max="10" 
                v-model.number="subject.weight"
                class="weight-slider"
              />
              <span class="weight-value">{{ subject.weight }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤3: 强弱项设置 -->
      <div v-if="currentStep === 2" class="step-panel">
        <h2 class="step-title">💪 强弱项分析</h2>
        <p class="step-desc">帮助AI更好地为你分配学习时间</p>
        
        <div class="strength-weakness">
          <div class="sw-section">
            <h3>🎯 强项科目（可少花时间）</h3>
            <p class="sw-hint">选择你基础较好、有把握的科目</p>
            <div class="sw-tags">
              <button 
                v-for="subject in config.subjects" 
                :key="'strong-' + subject.id"
                class="sw-tag strong"
                :class="{ active: config.strongSubjects.includes(subject.name) }"
                @click="toggleStrongSubject(subject.name)"
              >
                {{ subject.emoji }} {{ subject.name }}
              </button>
            </div>
          </div>
          
          <div class="sw-section">
            <h3>⚠️ 弱项科目（需重点强化）</h3>
            <p class="sw-hint">选择你基础薄弱、需要多花时间的科目</p>
            <div class="sw-tags">
              <button 
                v-for="subject in config.subjects" 
                :key="'weak-' + subject.id"
                class="sw-tag weak"
                :class="{ active: config.weakSubjects.includes(subject.name) }"
                @click="toggleWeakSubject(subject.name)"
              >
                {{ subject.emoji }} {{ subject.name }}
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="warnings.length > 0" class="warnings">
          <div v-for="(warning, idx) in warnings" :key="idx" class="warning-item">
            ⚠️ {{ warning }}
          </div>
        </div>
      </div>

      <!-- 步骤4: 学习偏好 -->
      <div v-if="currentStep === 3" class="step-panel">
        <h2 class="step-title">⏰ 学习偏好设置</h2>
        <p class="step-desc">根据你的习惯定制最佳学习时段</p>
        
        <div class="preference-section">
          <h3>📅 每日学习时段偏好</h3>
          <div class="time-preference">
            <label 
              class="time-block"
              :class="{ active: config.preferMorning }"
            >
              <input type="checkbox" v-model="config.preferMorning" />
              <span class="time-icon">🌅</span>
              <span class="time-label">上午</span>
              <span class="time-desc">8:00 - 12:00</span>
            </label>
            <label 
              class="time-block"
              :class="{ active: config.preferAfternoon }"
            >
              <input type="checkbox" v-model="config.preferAfternoon" />
              <span class="time-icon">☀️</span>
              <span class="time-label">下午</span>
              <span class="time-desc">14:00 - 18:00</span>
            </label>
            <label 
              class="time-block"
              :class="{ active: config.preferEvening }"
            >
              <input type="checkbox" v-model="config.preferEvening" />
              <span class="time-icon">🌙</span>
              <span class="time-label">晚上</span>
              <span class="time-desc">19:00 - 23:00</span>
            </label>
          </div>
        </div>
        
        <div class="preference-section">
          <h3>☕ 休息间隔</h3>
          <div class="break-options">
            <button 
              v-for="interval in [15, 20, 30, 45]" 
              :key="interval"
              class="break-btn"
              :class="{ active: config.breakInterval === interval }"
              @click="config.breakInterval = interval"
            >
              {{ interval }}分钟
            </button>
          </div>
        </div>
        
        <!-- AI建议预览 -->
        <div v-if="suggestions.length > 0" class="ai-suggestions">
          <h3>💡 AI智能建议</h3>
          <div 
            v-for="(sug, idx) in suggestions.slice(0, 3)" 
            :key="idx"
            class="suggestion-card"
            :class="sug.type"
          >
            <span class="sug-icon">
              {{ sug.type === 'warning' ? '⚠️' : sug.type === 'tip' ? '💡' : '🎉' }}
            </span>
            <div class="sug-content">
              <strong>{{ sug.title }}</strong>
              <p>{{ sug.message }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- 底部按钮 -->
    <div class="wizard-actions">
      <button 
        v-if="currentStep > 0"
        class="glass-btn secondary"
        @click="prevStep"
      >
        ← 上一步
      </button>
      <button 
        v-if="currentStep < steps.length - 1"
        class="glass-btn primary"
        @click="nextStep"
        :disabled="!canProceed"
      >
        下一步 →
      </button>
      <button 
        v-else
        class="glass-btn generate-btn"
        @click="generatePlan"
        :disabled="isGenerating"
      >
        <span v-if="isGenerating">🤖 AI正在生成计划...</span>
        <span v-else>✨ 生成学习计划</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { LearningConfig, SubjectConfig, SmartSuggestion } from '../types/LearningPlan'
import { generateSmartSuggestions } from '../types/LearningPlan'

const emit = defineEmits<{
  (e: 'generate', config: LearningConfig): void
  (e: 'cancel'): void
}>()

const steps = ['目标设置', '科目选择', '强弱项', '学习偏好']
const currentStep = ref(0)
const isGenerating = ref(false)

const phases = [
  { value: 'foundation', emoji: '📖', label: '基础阶段', desc: '夯实基础，全面复习' },
  { value: 'strengthening', emoji: '💪', label: '强化阶段', desc: '深化理解，专项训练' },
  { value: 'sprint', emoji: '🚀', label: '冲刺阶段', desc: '查漏补缺，模拟考试' }
]

const availableSubjects: SubjectConfig[] = [
  { id: 'english', name: '英语', emoji: '🔤', weight: 8, priority: 'high', hoursPerWeek: 0 },
  { id: 'politics', name: '政治', emoji: '📰', weight: 6, priority: 'medium', hoursPerWeek: 0 },
  { id: 'math', name: '数学', emoji: '🔢', weight: 10, priority: 'high', hoursPerWeek: 0 },
  { id: 'major', name: '专业课', emoji: '🎓', weight: 9, priority: 'high', hoursPerWeek: 0 }
]

const config = ref<LearningConfig>({
  // 修复：使用本地时区格式，避免日期偏移
  examDate: (() => {
    const date = new Date(Date.now() + 300 * 24 * 60 * 60 * 1000)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })(),
  // 修复：使用本地时区格式
  startDate: (() => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })(),
  dailyHours: 8,
  phase: 'foundation',
  subjects: [...availableSubjects],
  strongSubjects: [],
  weakSubjects: [],
  preferMorning: true,
  preferAfternoon: true,
  preferEvening: false,
  breakInterval: 15
})

const suggestions = computed(() => generateSmartSuggestions(config.value))

const warnings = computed(() => {
  const warns: string[] = []
  if (config.value.strongSubjects.length > 0 && config.value.weakSubjects.length > 0) {
    if (config.value.strongSubjects.some(s => config.value.weakSubjects.includes(s))) {
      warns.push('同一个科目不能同时是强项和弱项！')
    }
  }
  if (config.value.weakSubjects.length === 0 && config.value.subjects.length > 1) {
    warns.push('建议至少选择一个弱项科目，以便AI更好地分配时间')
  }
  return warns
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0:
      return config.value.examDate && config.value.dailyHours > 0
    case 1:
      return config.value.subjects.length > 0
    case 2:
      return true
    case 3:
      return config.value.preferMorning || config.value.preferAfternoon || config.value.preferEvening
    default:
      return false
  }
})

const isSubjectSelected = (id: string) => {
  return config.value.subjects.some(s => s.id === id)
}

const toggleStrongSubject = (name: string) => {
  const idx = config.value.strongSubjects.indexOf(name)
  if (idx > -1) {
    config.value.strongSubjects.splice(idx, 1)
  } else {
    config.value.strongSubjects.push(name)
  }
}

const toggleWeakSubject = (name: string) => {
  const idx = config.value.weakSubjects.indexOf(name)
  if (idx > -1) {
    config.value.weakSubjects.splice(idx, 1)
  } else {
    config.value.weakSubjects.push(name)
  }
}

const goToStep = (index: number) => {
  if (index < currentStep.value || canProceed.value) {
    currentStep.value = index
  }
}

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const generatePlan = () => {
  isGenerating.value = true
  emit('generate', config.value)
}
</script>

<style scoped>
.learning-plan-wizard {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.steps-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  position: relative;
}

.steps-indicator::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 40px;
  right: 40px;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  z-index: 0;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
  cursor: pointer;
  transition: all 0.3s;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.step-item.active .step-circle {
  background: linear-gradient(135deg, #f97316, #f472b6);
  border-color: transparent;
  box-shadow: 0 0 20px rgba(249, 115, 22, 0.5);
}

.step-item.completed .step-circle {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-color: transparent;
}

.step-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.step-item.active .step-label {
  color: #fff;
  font-weight: bold;
}

.step-content {
  padding: 30px;
  min-height: 400px;
}

.step-title {
  font-size: 24px;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #fff, #f97316);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.step-desc {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.glass-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  outline: none;
  transition: all 0.3s;
}

.glass-input:focus {
  border-color: #f97316;
  box-shadow: 0 0 20px rgba(249, 115, 22, 0.2);
}

.hours-selector, .break-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hour-btn, .break-btn {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.hour-btn:hover, .break-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.hour-btn.active, .break-btn.active {
  background: linear-gradient(135deg, #f97316, #f472b6);
  border-color: transparent;
}

.phase-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.phase-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.phase-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.phase-btn.active {
  background: rgba(249, 115, 22, 0.2);
  border-color: #f97316;
  box-shadow: 0 0 30px rgba(249, 115, 22, 0.3);
}

.phase-emoji {
  font-size: 28px;
  margin-bottom: 8px;
}

.phase-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.phase-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.subjects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.subject-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.subject-card:hover {
  background: rgba(255, 255, 255, 0.15);
}

.subject-card.selected {
  background: rgba(249, 115, 22, 0.2);
  border-color: #f97316;
}

.subject-emoji {
  font-size: 32px;
  margin-bottom: 8px;
}

.subject-name {
  font-weight: 500;
}

.check-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.hidden-checkbox {
  position: absolute;
  opacity: 0;
}

.selected-info {
  margin-top: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.weight-info {
  margin-top: 15px;
}

.weight-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.weight-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  outline: none;
}

.weight-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #f97316, #f472b6);
  border-radius: 50%;
  cursor: pointer;
}

.weight-value {
  font-weight: bold;
  color: #f97316;
  min-width: 24px;
}

.strength-weakness {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.sw-section h3 {
  margin-bottom: 8px;
  font-size: 16px;
}

.sw-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 15px;
}

.sw-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.sw-tag {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.sw-tag.strong.active {
  background: rgba(34, 197, 94, 0.3);
  border-color: #22c55e;
}

.sw-tag.weak.active {
  background: rgba(249, 115, 22, 0.3);
  border-color: #f97316;
}

.warnings {
  margin-top: 20px;
}

.warning-item {
  padding: 12px 16px;
  background: rgba(251, 191, 36, 0.2);
  border: 1px solid rgba(251, 191, 36, 0.5);
  border-radius: 8px;
  color: #fbbf24;
  margin-bottom: 10px;
}

.preference-section {
  margin-bottom: 30px;
}

.preference-section h3 {
  margin-bottom: 15px;
  font-size: 16px;
}

.time-preference {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.time-block input {
  display: none;
}

.time-block.active {
  background: rgba(249, 115, 22, 0.2);
  border-color: #f97316;
}

.time-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.time-label {
  font-weight: bold;
  margin-bottom: 4px;
}

.time-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.ai-suggestions {
  margin-top: 30px;
}

.ai-suggestions h3 {
  margin-bottom: 15px;
  font-size: 16px;
}

.suggestion-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 10px;
  border-left: 3px solid #f97316;
}

.suggestion-card.warning {
  border-left-color: #fbbf24;
}

.suggestion-card.encouragement {
  border-left-color: #22c55e;
}

.sug-icon {
  font-size: 20px;
}

.sug-content strong {
  display: block;
  margin-bottom: 4px;
}

.sug-content p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.wizard-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  gap: 15px;
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

.glass-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.glass-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.glass-btn.primary {
  background: linear-gradient(135deg, #f97316, #f472b6);
  color: #fff;
}

.glass-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
}

.glass-btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.glass-btn.generate-btn {
  flex: 1;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
  font-size: 18px;
}

.glass-btn.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(34, 197, 94, 0.4);
}

@media (max-width: 768px) {
  .phase-selector {
    grid-template-columns: 1fr;
  }
  
  .subjects-grid {
    grid-template-columns: 1fr;
  }
  
  .strength-weakness {
    grid-template-columns: 1fr;
  }
  
  .time-preference {
    grid-template-columns: 1fr;
  }
}

/* ===== 日间模式修复 - 解决白底白字问题 ===== */
/* 注意：只修改日间模式，不影响深色模式 */

/* 步骤指示器文字颜色 */
.learning-plan-wizard:not(.dark) .step-label {
  color: var(--text-secondary, #4b5563);
}

.learning-plan-wizard:not(.dark) .step-item.active .step-label {
  color: var(--color-primary, #f97316);
  font-weight: 600;
}

/* 步骤描述文字 */
.learning-plan-wizard:not(.dark) .step-desc {
  color: var(--text-muted, #6b7280);
}

/* 表单标签 */
.learning-plan-wizard:not(.dark) .form-group label {
  color: var(--text-primary, #1f2937);
  font-weight: 600;
}

/* 输入框文字 */
.learning-plan-wizard:not(.dark) .glass-input {
  color: var(--text-primary, #1f2937);
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(249, 115, 22, 0.3);
}

.learning-plan-wizard:not(.dark) .glass-input::placeholder {
  color: var(--text-muted, #9ca3af);
}

.learning-plan-wizard:not(.dark) .glass-input:focus {
  background: rgba(255, 255, 255, 0.95);
  border-color: var(--color-primary, #f97316);
}

/* 按钮文字 */
.learning-plan-wizard:not(.dark) .hour-btn,
.learning-plan-wizard:not(.dark) .break-btn {
  background: rgba(249, 115, 22, 0.1);
  border-color: rgba(249, 115, 22, 0.3);
  color: var(--text-primary, #1f2937);
}

.learning-plan-wizard:not(.dark) .hour-btn:hover,
.learning-plan-wizard:not(.dark) .break-btn:hover {
  background: rgba(249, 115, 22, 0.2);
}

.learning-plan-wizard:not(.dark) .hour-btn.active,
.learning-plan-wizard:not(.dark) .break-btn.active {
  background: var(--gradient-primary);
  color: white;
}

/* 阶段选择按钮 */
.learning-plan-wizard:not(.dark) .phase-btn {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(249, 115, 22, 0.2);
  color: var(--text-primary, #1f2937);
}

.learning-plan-wizard:not(.dark) .phase-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
}

.learning-plan-wizard:not(.dark) .phase-btn.active {
  background: rgba(249, 115, 22, 0.15);
  border-color: var(--color-primary, #f97316);
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.2);
}

.learning-plan-wizard:not(.dark) .phase-desc {
  color: var(--text-muted, #6b7280);
}

/* 科目卡片 */
.learning-plan-wizard:not(.dark) .subject-card {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(249, 115, 22, 0.2);
}

.learning-plan-wizard:not(.dark) .subject-card:hover {
  background: rgba(255, 255, 255, 0.9);
}

.learning-plan-wizard:not(.dark) .subject-card.selected {
  background: rgba(249, 115, 22, 0.15);
  border-color: var(--color-primary, #f97316);
}

.learning-plan-wizard:not(.dark) .subject-name {
  color: var(--text-primary, #1f2937);
  font-weight: 600;
}

/* 强弱项标签 */
.learning-plan-wizard:not(.dark) .sw-hint {
  color: var(--text-muted, #6b7280);
}

.learning-plan-wizard:not(.dark) .sw-tag {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(249, 115, 22, 0.2);
  color: var(--text-primary, #1f2937);
}

.learning-plan-wizard:not(.dark) .sw-tag:hover {
  background: rgba(255, 255, 255, 0.9);
}

.learning-plan-wizard:not(.dark) .sw-tag.strong.active {
  background: rgba(34, 197, 94, 0.15);
  border-color: #22c55e;
  color: #15803d;
}

.learning-plan-wizard:not(.dark) .sw-tag.weak.active {
  background: rgba(249, 115, 22, 0.15);
  border-color: var(--color-primary, #f97316);
  color: #c2410c;
}

/* 时间段选择 */
.learning-plan-wizard:not(.dark) .time-block {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(249, 115, 22, 0.2);
}

.learning-plan-wizard:not(.dark) .time-block:hover {
  background: rgba(255, 255, 255, 0.9);
}

.learning-plan-wizard:not(.dark) .time-block.active {
  background: rgba(249, 115, 22, 0.15);
  border-color: var(--color-primary, #f97316);
}

.learning-plan-wizard:not(.dark) .time-label {
  color: var(--text-primary, #1f2937);
}

.learning-plan-wizard:not(.dark) .time-desc {
  color: var(--text-muted, #6b7280);
}

/* AI建议卡片 */
.learning-plan-wizard:not(.dark) .suggestion-card {
  background: rgba(255, 255, 255, 0.7);
  border-left-color: var(--color-primary, #f97316);
}

.learning-plan-wizard:not(.dark) .suggestion-card.warning {
  border-left-color: #f59e0b;
}

.learning-plan-wizard:not(.dark) .suggestion-card.encouragement {
  border-left-color: #22c55e;
}

.learning-plan-wizard:not(.dark) .sug-content strong {
  color: var(--text-primary, #1f2937);
}

.learning-plan-wizard:not(.dark) .sug-content p {
  color: var(--text-secondary, #4b5563);
}

/* 权重滑块数值 */
.learning-plan-wizard:not(.dark) .weight-value {
  color: var(--color-primary, #f97316);
}

/* 步骤进度线 */
.learning-plan-wizard:not(.dark) .steps-indicator::before {
  background: rgba(249, 115, 22, 0.2);
}

/* 步骤圆圈 */
.learning-plan-wizard:not(.dark) .step-circle {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(249, 115, 22, 0.3);
  color: var(--text-primary, #1f2937);
}

.learning-plan-wizard:not(.dark) .step-item.completed .step-circle {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-color: transparent;
  color: white;
}

/* 二次按钮 */
.learning-plan-wizard:not(.dark) .glass-btn.secondary {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(249, 115, 22, 0.3);
  color: var(--text-primary, #1f2937);
}

.learning-plan-wizard:not(.dark) .glass-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.95);
}

/* 已选信息背景 */
.learning-plan-wizard:not(.dark) .selected-info {
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.2);
}

/* 滑块轨道 */
.learning-plan-wizard:not(.dark) .weight-slider {
  background: rgba(249, 115, 22, 0.2);
}

/* 警告文字颜色 - 日间模式 */
.learning-plan-wizard:not(.dark) .warning-item {
  background: rgba(251, 191, 36, 0.15);
  border-color: rgba(251, 191, 36, 0.4);
  color: #b45309;
}

/* 提示文字 - 日间模式 */
.learning-plan-wizard:not(.dark) .sw-hint,
.learning-plan-wizard:not(.dark) .time-desc {
  color: var(--text-muted, #6b7280);
}
</style>
