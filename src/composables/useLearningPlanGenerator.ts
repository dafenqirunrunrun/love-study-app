/**
 * AI学习计划生成器 - 智能生成逻辑
 */
import { ref, computed } from 'vue'
import type { 
  LearningConfig, 
  LearningPlan, 
  PlanPhase, 
  WeeklyTemplate, 
  DailyTask, 
  TaskSession,
  SmartSuggestion,
  SubjectConfig
} from '../types/LearningPlan'
import { generateSmartSuggestions, generatePhaseGoals, PLAN_TEMPLATES, DAILY_SCHEDULE } from '../types/LearningPlan'

// 学习科目映射
const SUBJECT_MAP: Record<string, { emoji: string; fullName: string }> = {
  english: { emoji: '🔤', fullName: '英语' },
  politics: { emoji: '📰', fullName: '政治' },
  math: { emoji: '🔢', fullName: '数学' },
  major: { emoji: '🎓', fullName: '专业课' },
  study: { emoji: '📚', fullName: '学习' },
  exercise: { emoji: '🏃', fullName: '运动' },
  rest: { emoji: '😴', fullName: '休息' }
}

// 生成学习计划
export function useLearningPlanGenerator() {
  const isGenerating = ref(false)
  const generatedPlan = ref<LearningPlan | null>(null)
  
  // 生成完整的AI学习计划
  const generatePlan = async (config: LearningConfig): Promise<LearningPlan> => {
    isGenerating.value = true
    
    // 模拟AI思考时间
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    try {
      const today = new Date()
      const examDate = new Date(config.examDate)
      const startDate = config.startDate ? new Date(config.startDate) : today
      
      // 计算总天数和周数
      const totalDays = Math.ceil((examDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const totalWeeks = Math.max(1, Math.ceil(totalDays / 7))
      
      // 生成阶段计划
      const phases = generatePhases(config, totalWeeks, startDate)
      
      // 生成每周模板
      const weeklyTemplates = generateWeeklyTemplates(config, totalWeeks, startDate)
      
      // 创建计划对象
      const plan: LearningPlan = {
        id: `plan_${Date.now()}`,
        name: `${config.phase === 'foundation' ? '基础' : config.phase === 'strengthening' ? '强化' : '冲刺'}学习计划`,
        createdAt: new Date().toISOString(),
        config,
        phases,
        weeklyTemplates,
        totalDays,
        totalHours: config.dailyHours * totalDays,
        subjects: config.subjects.map(s => s.name)
      }
      
      generatedPlan.value = plan
      return plan
    } finally {
      isGenerating.value = false
    }
  }
  
  // 生成阶段计划
  const generatePhases = (config: LearningConfig, totalWeeks: number, startDate: Date): PlanPhase[] => {
    const phases: PlanPhase[] = []
    
    // 根据总周数分配阶段
    let phaseConfig: { name: string; weeks: number; focus: string[] }[]
    
    if (totalWeeks <= 12) {
      // 短期冲刺
      phaseConfig = [
        { name: '冲刺阶段', weeks: totalWeeks, focus: ['真题', '重点巩固'] }
      ]
    } else if (totalWeeks <= 20) {
      // 中期强化
      phaseConfig = [
        { name: '强化阶段', weeks: Math.floor(totalWeeks * 0.6), focus: ['专项训练', '真题'] },
        { name: '冲刺阶段', weeks: Math.ceil(totalWeeks * 0.4), focus: ['查漏补缺', '模拟'] }
      ]
    } else {
      // 完整规划
      phaseConfig = [
        { name: '基础阶段', weeks: Math.floor(totalWeeks * 0.4), focus: ['基础知识', '教材通读'] },
        { name: '强化阶段', weeks: Math.floor(totalWeeks * 0.35), focus: ['专项训练', '真题精练'] },
        { name: '冲刺阶段', weeks: Math.ceil(totalWeeks * 0.25), focus: ['模拟考试', '最后冲刺'] }
      ]
    }
    
    let currentWeek = 0
    
    phaseConfig.forEach((phase, index) => {
      const phaseStartWeek = currentWeek + 1
      currentWeek += phase.weeks
      
      phases.push({
        name: phase.name,
        startWeek: phaseStartWeek,
        endWeek: currentWeek,
        duration: phase.weeks,
        focus: phase.focus,
        goals: generatePhaseGoals(
          phase.name === '基础阶段' ? 'foundation' : 
          phase.name === '强化阶段' ? 'strengthening' : 'sprint',
          config.subjects[0]?.name || 'general'
        ),
        weeklyHours: config.dailyHours * 7 * (phase.weeks / totalWeeks),
        tasks: []
      })
    })
    
    return phases
  }
  
  // 生成每周模板
  const generateWeeklyTemplates = (config: LearningConfig, totalWeeks: number, startDate: Date): WeeklyTemplate[] => {
    const templates: WeeklyTemplate[] = []
    const weekThemes = [
      '适应期 - 建立学习节奏',
      '基础巩固 - 夯实根基',
      '稳步提升 - 循序渐进',
      '专项突破 - 薄弱环节',
      '综合训练 - 融会贯通',
      '查漏补缺 - 巩固强化',
      '模拟演练 - 检验成果',
      '最后冲刺 - 全力拼搏'
    ]
    
    for (let week = 1; week <= Math.min(totalWeeks, 52); week++) {
      // 根据阶段调整重点
      let focusSubjects: string[]
      if (week <= totalWeeks * 0.4) {
        focusSubjects = config.subjects.slice(0, 2).map(s => s.name)
      } else if (week <= totalWeeks * 0.75) {
        focusSubjects = config.subjects.slice(1, 3).map(s => s.name)
      } else {
        focusSubjects = config.subjects.slice(-2).map(s => s.name)
      }
      
      // 生成每日任务
      const dailyTasks: DailyTask[] = []
      for (let day = 0; day < 7; day++) {
        dailyTasks.push(generateDailyTask(config, startDate, week, day))
      }
      
      templates.push({
        weekNumber: week,
        theme: weekThemes[(week - 1) % weekThemes.length],
        focusSubjects,
        dailyTasks,
        goals: [
          `完成本周计划的${Math.round(100 - (week / totalWeeks) * 20)}%`,
          `重点复习 ${focusSubjects.join('、')}`,
          '保持每天7-8小时专注学习'
        ],
        tips: generateWeeklyTips(week, totalWeeks)
      })
    }
    
    return templates
  }
  
  // 生成每日任务
  const generateDailyTask = (config: LearningConfig, startDate: Date, week: number, day: number): DailyTask => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + (week - 1) * 7 + day)
    
    // 根据日期获取具体时间安排
    const scheduleKey = config.preferMorning ? 'morning' : 
                       config.preferAfternoon ? 'afternoon' : 'evening'
    const schedule = DAILY_SCHEDULE[scheduleKey as keyof typeof DAILY_SCHEDULE]
    
    // 为每个学习时段分配科目
    const sessions: TaskSession[] = []
    const morningSubjects = config.subjects.slice(0, 2)
    const afternoonSubjects = config.subjects.slice(2)
    
    // 上午时段 (2个90分钟)
    morningSubjects.forEach((subject, index) => {
      sessions.push(createStudySession(subject, 90, week, day))
    })
    
    // 休息
    sessions.push(createBreakSession(15))
    
    // 下午时段 (2个90分钟)
    afternoonSubjects.forEach((subject, index) => {
      sessions.push(createStudySession(subject, 90, week, day))
    })
    
    // 晚间安排
    sessions.push(createReviewSession(config.subjects[0], 60))
    sessions.push(createExerciseSession(30))
    
    // 计算当日总时长
    const totalHours = sessions
      .filter(s => s.type !== 'break' && s.type !== 'exercise')
      .reduce((sum, s) => sum + s.duration, 0) / 60
    
    return {
      dayOfWeek: day,
      // 修复：使用本地时区格式，避免日期偏移
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      dayTheme: getDayTheme(day),
      totalHours,
      sessions
    }
  }
  
  // 创建学习时段
  const createStudySession = (subject: SubjectConfig, duration: number, week: number, day: number): TaskSession => {
    const taskTypes = ['知识点学习', '专项练习', '章节复习', '真题训练', '错题重做']
    
    return {
      subject: subject.name,
      subjectEmoji: SUBJECT_MAP[subject.id]?.emoji || '📚',
      duration,
      type: 'study',
      task: `${subject.name} - ${taskTypes[Math.floor(Math.random() * taskTypes.length)]}`,
      priority: week > 8 ? 'high' : 'medium'
    }
  }
  
  // 创建休息时段
  const createBreakSession = (duration: number): TaskSession => ({
    subject: '休息',
    subjectEmoji: '☕',
    duration,
    type: 'break',
    task: '适当休息，活动一下',
    priority: 'low'
  })
  
  // 创建复习时段
  const createReviewSession = (subject: SubjectConfig | undefined, duration: number): TaskSession => ({
    subject: subject?.name || '复习',
    subjectEmoji: SUBJECT_MAP[subject?.id]?.emoji || '📝',
    duration,
    type: 'review',
    task: '当日知识点回顾与总结',
    priority: 'medium'
  })
  
  // 创建运动时段
  const createExerciseSession = (duration: number): TaskSession => ({
    subject: '运动',
    subjectEmoji: '🏃',
    duration,
    type: 'exercise',
    task: '适量运动，保持健康',
    priority: 'low'
  })
  
  // 获取每日主题
  const getDayTheme = (day: number): string => {
    const themes = ['新的一周开始了！', '继续努力！', '周三半程！', '坚持就是胜利！', '周末前的冲刺！', '周末复习巩固', '休息调整心态']
    return themes[day]
  }
  
  // 生成每周建议
  const generateWeeklyTips = (week: number, totalWeeks: number): string[] => {
    const tips: string[][] = [
      ['保持积极心态', '规律作息很重要'],
      ['做好笔记整理', '发现问题及时解决'],
      ['适当增加难度', '保持学习节奏'],
      ['查漏补缺', '重点难点突破'],
      ['多做真题', '模拟真实考试环境'],
      ['回顾错题本', '巩固薄弱环节'],
      ['全真模拟', '调整考试心态'],
      ['保持状态', '相信自己！']
    ]
    
    return tips[Math.min(week - 1, tips.length - 1)]
  }
  
  return {
    isGenerating,
    generatedPlan,
    generatePlan,
    generateSmartSuggestions: (config: LearningConfig) => generateSmartSuggestions(config)
  }
}

// 导出任务到任务列表
export function exportPlanToTasks(plan: LearningPlan): any[] {
  const tasks: any[] = []
  const taskIds = new Set() // 用于去重
  
  plan.weeklyTemplates.forEach((week, weekIndex) => {
    week.dailyTasks.forEach((day, dayIndex) => {
      day.sessions
        .filter(s => s.type === 'study' || s.type === 'review')
        .forEach((session, sessionIndex) => {
          const taskId = `${plan.id}_w${weekIndex + 1}_d${dayIndex + 1}_s${sessionIndex}`
          
          // 修复：跳过已存在的任务ID（去重）
          if (taskIds.has(taskId)) return
          taskIds.add(taskId)
          
          const categoryMap: Record<string, string> = {
            '英语': 'english',
            '政治': 'politics',
            '数学': 'math',
            '专业课': 'major'
          }
          
          tasks.push({
            id: taskId,
            text: `[第${weekIndex + 1}周] ${day.date} - ${session.task}`,
            completed: false,
            category: categoryMap[session.subject] || 'study',
            priority: session.priority,
            dueDate: day.date,
            notes: `${session.subject} | ${session.duration}分钟 | ${week.theme}`,
            createdAt: new Date().toISOString(),
            fromPlan: plan.id,
            weekNumber: weekIndex + 1,
            dayOfWeek: dayIndex
          })
        })
    })
  })
  
  return tasks
}
