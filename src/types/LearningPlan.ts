/**
 * AI学习计划生成器 - 类型定义
 */

// 用户配置
export interface LearningConfig {
  // 基础信息
  examDate: string                    // 考试日期
  startDate: string                    // 开始日期
  dailyHours: number                  // 每日学习时长（小时）
  
  // 目标
  targetScore?: string               // 目标分数
  targetSchool?: string              // 目标院校
  
  // 当前阶段
  phase: 'foundation' | 'strengthening' | 'sprint'  // 基础/强化/冲刺
  
  // 科目配置
  subjects: SubjectConfig[]
  
  // 强弱项
  strongSubjects: string[]           // 强项科目
  weakSubjects: string[]             // 弱项科目
  
  // 学习偏好
  preferMorning: boolean             // 偏好上午学习
  preferAfternoon: boolean            // 偏好下午学习
  preferEvening: boolean              // 偏好晚上学习
  breakInterval: number              // 休息间隔（分钟）
}

// 科目配置
export interface SubjectConfig {
  id: string
  name: string
  emoji: string
  weight: number                    // 权重 (1-10)
  hoursPerWeek: number              // 每周学习小时
  priority: 'high' | 'medium' | 'low'
}

// 学习计划
export interface LearningPlan {
  id: string
  name: string
  createdAt: string
  config: LearningConfig
  
  // 阶段计划
  phases: PlanPhase[]
  
  // 每周任务模板
  weeklyTemplates: WeeklyTemplate[]
  
  // 统计
  totalDays: number
  totalHours: number
  subjects: string[]
}

// 阶段计划
export interface PlanPhase {
  name: string                    // 阶段名称
  startWeek: number              // 开始周数
  endWeek: number                // 结束周数
  duration: number               // 持续周数
  focus: string[]                // 重点科目
  goals: string[]                // 阶段目标
  weeklyHours: number            // 每周建议时长
  tasks: WeeklyTask[]
}

// 每周模板
export interface WeeklyTemplate {
  weekNumber: number
  theme: string                   // 周主题
  focusSubjects: string[]         // 重点科目
  dailyTasks: DailyTask[]
  goals: string[]                 // 周目标
  tips: string[]                 // 学习建议
}

// 每日任务
export interface DailyTask {
  dayOfWeek: number              // 0-6 (周一到周日)
  date: string                   // 具体日期
  dayTheme: string               // 每日主题
  totalHours: number             // 总学习时长
  sessions: TaskSession[]
}

// 任务时段
export interface TaskSession {
  subject: string
  subjectEmoji: string
  duration: number                // 时长（分钟）
  type: 'study' | 'review' | 'exercise' | 'break'
  task: string                   // 具体任务描述
  priority: 'high' | 'medium' | 'low'
}

// 智能建议
export interface SmartSuggestion {
  type: 'warning' | 'tip' | 'encouragement'
  category: 'schedule' | 'subject' | 'health' | 'motivation'
  title: string
  message: string
  actionable?: boolean
  action?: string
}

// 预设模板
export const PLAN_TEMPLATES = {
  foundation: {
    name: '基础阶段',
    description: '夯实基础，全面复习',
    duration: 12,      // 周
    focus: ['英语', '政治', '数学/专业课'],
    weeklyHours: 40,
    subjects: [
      { id: 'english', name: '英语', emoji: '🔤', weight: 8, priority: 'high' },
      { id: 'politics', name: '政治', emoji: '📰', weight: 6, priority: 'medium' },
      { id: 'math', name: '数学', emoji: '🔢', weight: 10, priority: 'high' },
      { id: 'major', name: '专业课', emoji: '🎓', weight: 9, priority: 'high' }
    ]
  },
  strengthening: {
    name: '强化阶段',
    description: '深化理解，专项训练',
    duration: 10,
    focus: ['专业课', '英语真题', '政治背诵'],
    weeklyHours: 50,
    subjects: [
      { id: 'english', name: '英语', emoji: '🔤', weight: 7, priority: 'high' },
      { id: 'politics', name: '政治', emoji: '📰', weight: 8, priority: 'high' },
      { id: 'math', name: '数学', emoji: '🔢', weight: 9, priority: 'high' },
      { id: 'major', name: '专业课', emoji: '🎓', weight: 10, priority: 'high' }
    ]
  },
  sprint: {
    name: '冲刺阶段',
    description: '查漏补缺，模拟考试',
    duration: 8,
    focus: ['真题演练', '错题复习', '知识点巩固'],
    weeklyHours: 55,
    subjects: [
      { id: 'english', name: '英语', emoji: '🔤', weight: 6, priority: 'high' },
      { id: 'politics', name: '政治', emoji: '📰', weight: 10, priority: 'high' },
      { id: 'math', name: '数学', emoji: '🔢', weight: 8, priority: 'high' },
      { id: 'major', name: '专业课', emoji: '🎓', weight: 10, priority: 'high' }
    ]
  }
}

// 每日模板
export const DAILY_SCHEDULE = {
  morning: {
    start: '08:00',
    sessions: [
      { type: 'study', duration: 90, label: '第一学习段' },
      { type: 'break', duration: 15, label: '休息' },
      { type: 'study', duration: 90, label: '第二学习段' }
    ]
  },
  afternoon: {
    start: '14:00',
    sessions: [
      { type: 'study', duration: 90, label: '第三学习段' },
      { type: 'break', duration: 15, label: '休息' },
      { type: 'study', duration: 90, label: '第四学习段' }
    ]
  },
  evening: {
    start: '19:00',
    sessions: [
      { type: 'review', duration: 60, label: '晚间复习' },
      { type: 'exercise', duration: 30, label: '运动时间' },
      { type: 'study', duration: 60, label: '收尾学习' }
    ]
  }
}

// 智能建议生成器
export function generateSmartSuggestions(config: LearningConfig): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = []
  const today = new Date()
  const examDate = new Date(config.examDate)
  const daysRemaining = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  // 根据剩余时间给建议
  if (daysRemaining > 365) {
    suggestions.push({
      type: 'tip',
      category: 'schedule',
      title: '时间充裕',
      message: '你有超过一年的时间，充分打好基础，建议每天学习6-8小时。',
      actionable: true,
      action: '设置基础阶段模板'
    })
  } else if (daysRemaining > 180) {
    suggestions.push({
      type: 'tip',
      category: 'schedule',
      title: '黄金复习期',
      message: '还有半年时间，正是强化提升的好时机！',
      actionable: false
    })
  } else if (daysRemaining > 90) {
    suggestions.push({
      type: 'warning',
      category: 'schedule',
      title: '时间紧张',
      message: '不到三个月就要考试了，建议加大马力冲刺！',
      actionable: true,
      action: '切换到冲刺模式'
    })
  } else {
    suggestions.push({
      type: 'encouragement',
      category: 'motivation',
      title: '最后冲刺',
      message: '黎明前的黑暗，坚持就是胜利！',
      actionable: false
    })
  }
  
  // 根据弱项给建议
  if (config.weakSubjects.length > 0) {
    suggestions.push({
      type: 'tip',
      category: 'subject',
      title: '弱项强化',
      message: `你的弱项是 ${config.weakSubjects.join('、')}，建议每天多分配1-2小时专项练习。`,
      actionable: true,
      action: '调整时间分配'
    })
  }
  
  // 健康提醒
  suggestions.push({
    type: 'warning',
    category: 'health',
    title: '劳逸结合',
    message: '建议每1-2小时休息15分钟，每天保证7-8小时睡眠。',
    actionable: false
  })
  
  return suggestions
}

// 阶段目标生成器
export function generatePhaseGoals(phase: string, subject: string): string[] {
  const goals: Record<string, string[]> = {
    foundation: {
      general: [
        '完成基础知识体系构建',
        '建立错题本并整理',
        '形成自己的知识框架'
      ],
      english: ['掌握3500核心词汇', '熟悉语法基础', '阅读理解入门'],
      politics: ['完成马原学习', '理解基本概念', '建立知识框架'],
      math: ['夯实计算基础', '掌握核心公式', '完成基础题训练'],
      major: ['通读教材一遍', '整理核心笔记', '标记重点难点']
    },
    strengthening: {
      general: [
        '专项训练突破',
        '真题第一轮',
        '查漏补缺'
      ],
      english: ['词汇量达到6000', '真题阅读精练', '作文模板积累'],
      politics: ['完成选择题刷题', '开始分析题学习', '时政热点关注'],
      math: ['强化题型训练', '真题难点攻关', '提高解题速度'],
      major: ['真题研究透彻', '形成答题套路', '重点难点突破']
    },
    sprint: {
      general: [
        '全真模拟考试',
        '重点回顾巩固',
        '调整心态迎接考试'
      ],
      english: ['作文专项突破', '保持做题手感', '错题最后复习'],
      politics: ['时政最后押题', '分析题疯狂背诵', '选择题保持手感'],
      math: ['真题最后两遍', '错题清零', '保持状态'],
      major: ['真题答案背诵', '模拟考试演练', '知识点最后巩固']
    }
  }
  
  return goals[phase]?.general || goals.foundation.general
}
