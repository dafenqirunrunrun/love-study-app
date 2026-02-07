<template>
  <div class="max-w-7xl mx-auto">
    <div class="glass-card p-8">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-gray-800">📔 学习心得</h2>
        <span class="text-gray-500">{{ today }}</span>
      </div>

      <!-- 编辑区 -->
      <div class="mb-8">
        <textarea
          v-model="currentJournal"
          @blur="saveJournal"
          placeholder="今天学习了什么？有什么收获和感悟？记录下来吧..."
          class="w-full h-48 px-6 py-4 bg-white/50 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:border-orange-400/50 focus:outline-none focus:bg-white/60 transition-all resize-none text-lg leading-relaxed"
        ></textarea>
        <div class="flex justify-end mt-2 text-sm text-gray-500">
          {{ currentJournal.length }} 字
        </div>
      </div>

      <!-- 历史记录 -->
      <div class="border-t border-white/20 pt-6">
        <h3 class="text-lg font-bold text-gray-700 mb-4">📜 历史记录</h3>
        <div v-if="journalHistory.length > 0" class="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
          <div
            v-for="(entry, index) in journalHistory"
            :key="index"
            class="p-6 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ getMoodEmoji(entry.mood) }}</span>
                <span class="text-gray-600 font-medium">{{ entry.date }}</span>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentJournal = ref('')
const today = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
})

const journalHistory = ref([])

const quickPhrases = [
  "今天完成了...",
  "学到了...",
  "遇到了...",
  "明天要...",
  "加油！"
]

const getMoodEmoji = (mood) => {
  const moods = {
    happy: '😊',
    excited: '🤩',
    tired: '😴',
    motivated: '💪',
    normal: '🙂'
  }
  return moods[mood] || '🙂'
}

const addPhrase = (phrase) => {
  currentJournal.value += (currentJournal.value ? '\n' : '') + phrase
}

const saveJournal = () => {
  if (currentJournal.value.trim()) {
    const entry = {
      content: currentJournal.value.trim(),
      date: today,
      mood: 'normal',
      createdAt: new Date().toISOString()
    }
    
    // 检查今天是否已有记录
    const existingIndex = journalHistory.value.findIndex(
      e => e.date === today
    )
    
    if (existingIndex >= 0) {
      journalHistory.value[existingIndex].content = currentJournal.value.trim()
    } else {
      journalHistory.value.unshift(entry)
      // 只保留最近50条
      if (journalHistory.value.length > 50) {
        journalHistory.value = journalHistory.value.slice(0, 50)
      }
    }
    
    localStorage.setItem('dailyJournal', currentJournal.value)
    localStorage.setItem('journalHistory', JSON.stringify(journalHistory.value))
  }
}

const deleteJournal = (index) => {
  if (confirm('确定要删除这篇心得吗？')) {
    journalHistory.value.splice(index, 1)
    localStorage.setItem('journalHistory', JSON.stringify(journalHistory.value))
  }
}

const loadData = () => {
  try {
    const saved = localStorage.getItem('dailyJournal')
    if (saved) currentJournal.value = saved
    
    const history = localStorage.getItem('journalHistory')
    if (history) journalHistory.value = JSON.parse(history)
  } catch (error) {
    console.error('Error loading journal:', error)
  }
}

// 初始化
loadData()
</script>
