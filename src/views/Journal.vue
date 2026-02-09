<template>
  <div class="max-w-7xl mx-auto">
    <!-- 骨架屏加载状态 -->
    <template v-if="isLoading">
      <div class="glass-card p-8">
        <div class="flex items-center justify-between mb-8">
          <div class="skeleton-pulse rounded h-8 w-48" :class="isDarkMode ? 'bg-white/20' : 'bg-white/40'"></div>
          <div class="skeleton-pulse rounded h-6 w-32" :class="isDarkMode ? 'bg-white/15' : 'bg-white/30'"></div>
        </div>
        <div class="skeleton-pulse rounded-2xl h-48 mb-4" :class="isDarkMode ? 'bg-white/15' : 'bg-white/30'"></div>
        <div class="mt-8">
          <SkeletonLoader type="list" :rows="3" :dark-mode="isDarkMode" />
        </div>
      </div>
    </template>

    <!-- 真实内容 -->
    <template v-else>
      <div class="glass-card p-8">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-gray-800">📔 学习心得</h2>
          <span class="text-gray-500">{{ today }}</span>
        </div>

        <!-- 心情选择 -->
        <div class="mb-4 flex items-center gap-3">
          <span class="text-gray-600 font-medium">今天的心情：</span>
          <div class="flex gap-2">
            <button
              v-for="mood in moodOptions"
              :key="mood.value"
              @click="currentMood = mood.value"
              :class="currentMood === mood.value ? 'bg-orange-100 scale-125' : 'hover:bg-white/50'"
              class="w-10 h-10 rounded-full text-xl transition-all"
              :title="mood.label"
            >
              {{ mood.emoji }}
            </button>
          </div>
          <span class="text-sm text-gray-400">{{ getCurrentMoodLabel() }}</span>
        </div>

        <!-- 今日写作提示 -->
        <div class="mb-4 flex flex-wrap gap-2">
          <button
            v-for="prompt in dailyPrompts"
            :key="prompt"
            @click="addPrompt(prompt)"
            class="px-3 py-1 bg-gradient-to-r from-orange-100 to-pink-100 text-orange-600 rounded-full text-sm hover:from-orange-200 hover:to-pink-200 transition-all"
          >
            💡 {{ prompt }}
          </button>
        </div>

        <!-- 编辑区 -->
        <div class="mb-6">
          <textarea
            v-model="currentJournal"
            placeholder="今天学习了什么？有什么收获和感悟？记录下来吧..."
            class="w-full h-48 px-6 py-4 bg-white/50 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:border-orange-400/50 focus:outline-none focus:bg-white/60 transition-all resize-none text-lg leading-relaxed"
            @keydown.ctrl.enter="saveJournal"
          ></textarea>
          <!-- 保存按钮区域 -->
          <div class="flex justify-between items-center mt-3">
            <div class="text-sm text-gray-500">
              <span class="mr-4">✏️ 支持 Ctrl+Enter 保存</span>
              <span>{{ currentJournal.length }} 字</span>
            </div>
            <button
              @click="saveJournal"
              :disabled="!currentJournal.trim()"
              class="jelly-button bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
            >
              💾 保存心得
            </button>
          </div>
          <div v-if="lastSaved" class="text-green-500 text-sm mt-2 flex items-center gap-2">
            <span class="animate-bounce-soft">✓</span>
            <span>已保存 {{ lastSaved }}</span>
          </div>
        </div>

        <!-- 历史记录 -->
        <div class="border-t border-white/20 pt-6">
          <h3 class="text-lg font-bold text-gray-700 mb-4">📜 历史记录</h3>
          <div v-if="journalHistory.length > 0" class="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
            <div
              v-for="(entry, index) in journalHistory"
              :key="index"
              class="p-6 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/40 transition-all"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <span class="text-2xl" :title="entry.mood">{{ getMoodEmoji(entry.mood) }}</span>
                  <div>
                    <span class="text-gray-600 font-medium">{{ entry.date }}</span>
                    <span v-if="entry.timestamp" class="text-gray-400 text-sm ml-2">{{ entry.timestamp }}</span>
                  </div>
                </div>
                <button
                  @click="deleteJournal(index)"
                  class="text-red-400 hover:text-red-600 text-sm px-3 py-1 rounded-lg hover:bg-red-100/50 transition-all"
                >
                  🗑️ 删除
                </button>
              </div>
              <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ entry.content }}</p>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-12">
            暂无心得记录，开始写下你的第一篇学习心得吧！
          </div>
        </div>

        <!-- 快捷短语 -->
        <div class="border-t border-white/20 pt-6 mt-6">
          <h3 class="text-lg font-bold text-gray-700 mb-4">💡 快捷添加</h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="phrase in quickPhrases"
              :key="phrase"
              @click="addPhrase(phrase)"
              class="px-4 py-2 bg-white/30 rounded-full text-sm text-gray-600 hover:bg-white/50 transition-all"
            >
              {{ phrase }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'

const currentJournal = ref('')
const currentMood = ref('normal')
const lastSaved = ref('')
const today = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
})

const journalHistory = ref([])
const isLoading = ref(true)
const isDarkMode = ref(false)

// 心情选项
const moodOptions = [
  { value: 'excited', emoji: '🤩', label: '超级兴奋' },
  { value: 'happy', emoji: '😊', label: '心情愉快' },
  { value: 'motivated', emoji: '💪', label: '动力满满' },
  { value: 'normal', emoji: '🙂', label: '平静如水' },
  { value: 'tired', emoji: '😴', label: '有点疲惫' },
  { value: 'anxious', emoji: '😰', label: '有些焦虑' }
]

// 根据日期生成今日提示
const dailyPrompts = computed(() => {
  const dayOfWeek = new Date().getDay()
  const prompts = {
    0: ['这周有什么收获？', '周末也要保持学习状态！', '回顾这周的成长'],
    1: ['新的一周开始啦！', '这周的目标是什么？', '加油冲鸭！'],
    2: ['已经周三了，坚持住！', '学习进度怎么样了？', '中途总结一下'],
    3: ['周中总结，今天学到了什么？', '半周过去了，继续努力！'],
    4: ['明天就周五了！', '这周目标完成了吗？', '最后冲刺！'],
    5: ['周末愉快！', '放松之余别忘了复习这周内容'],
    6: ['这周的最后一天！', '周末也要加油哦！', '总结这周的收获']
  }
  
  return prompts[dayOfWeek] || prompts[1]
})

const quickPhrases = [
  "今天完成了...",
  "学到了...",
  "遇到了...",
  "明天要...",
  "加油！"
]

const getMoodEmoji = (mood) => {
  const moodData = moodOptions.find(m => m.value === mood)
  return moodData ? moodData.emoji : '🙂'
}

const getCurrentMoodLabel = () => {
  const moodData = moodOptions.find(m => m.value === currentMood.value)
  return moodData ? moodData.label : ''
}

const addPrompt = (prompt) => {
  currentJournal.value += (currentJournal.value ? '\n' : '') + '• ' + prompt + ' '
}

const addPhrase = (phrase) => {
  currentJournal.value += (currentJournal.value ? '\n' : '') + phrase
}

const saveJournal = () => {
  if (currentJournal.value.trim()) {
    const now = new Date()
    const entry = {
      content: currentJournal.value.trim(),
      date: today,
      mood: currentMood.value,
      createdAt: now.toISOString(),
      timestamp: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    
    // 检查今天是否已有记录
    const existingIndex = journalHistory.value.findIndex(
      e => e.date === today
    )
    
    if (existingIndex >= 0) {
      journalHistory.value[existingIndex] = entry
    } else {
      journalHistory.value.unshift(entry)
      // 只保留最近50条
      if (journalHistory.value.length > 50) {
        journalHistory.value = journalHistory.value.slice(0, 50)
      }
    }
    
    localStorage.setItem('dailyJournal', currentJournal.value)
    localStorage.setItem('journalMood', currentMood.value)
    localStorage.setItem('journalHistory', JSON.stringify(journalHistory.value))
    
    lastSaved.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    
    // 显示Toast提示
    const event = new CustomEvent('showToast', { 
      detail: { 
        message: '心得保存成功！', 
        type: 'success',
        title: '💾 已保存'
      } 
    })
    window.dispatchEvent(event)
    
    setTimeout(() => {
      lastSaved.value = ''
    }, 3000)
  }
}

const deleteJournal = (index) => {
  if (confirm('确定要删除这篇心得吗？')) {
    journalHistory.value.splice(index, 1)
    localStorage.setItem('journalHistory', JSON.stringify(journalHistory.value))
  }
}

const loadData = () => {
  // 显示骨架屏
  isLoading.value = true
  
  try {
    const saved = localStorage.getItem('dailyJournal')
    if (saved) currentJournal.value = saved
    
    const savedMood = localStorage.getItem('journalMood')
    if (savedMood) currentMood.value = savedMood
    
    const history = localStorage.getItem('journalHistory')
    if (history) journalHistory.value = JSON.parse(history)
    
    // 检查深色模式
    isDarkMode.value = document.documentElement.classList.contains('dark')
  } catch (error) {
    console.error('Error loading journal:', error)
  } finally {
    // 隐藏骨架屏，显示内容
    setTimeout(() => {
      isLoading.value = false
    }, 300)
  }
}

// 初始化
onMounted(loadData)
</script>
