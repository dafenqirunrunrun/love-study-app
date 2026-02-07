<template>
  <div class="max-w-7xl mx-auto">
    <div class="glass-card p-8">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-gray-800">🎁 心愿单兑换</h2>
        <div class="flex items-center gap-2 text-orange-600">
          <span class="text-xl">💰</span>
          <span class="text-2xl font-bold">{{ lovePoints }}</span>
        </div>
      </div>

      <!-- 积分展示 -->
      <div class="mb-8">
        <div class="bg-gradient-to-br from-orange-100/50 to-pink-100/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/30">
          <div class="text-6xl mb-4">💰</div>
          <div class="text-orange-600 font-bold text-5xl mb-2">{{ lovePoints }}</div>
          <div class="text-gray-600 text-lg">当前可用积分</div>
          <div class="mt-4 text-sm text-gray-500">
            完成更多任务和打卡来获取积分吧！
          </div>
        </div>
      </div>

      <!-- 奖励列表 -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="reward in rewards"
          :key="reward.id"
          class="bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transition-all hover:bg-white/40 hover:shadow-lg"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="text-5xl">{{ reward.icon }}</div>
            <div class="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold">
              {{ reward.points }} 积分
            </div>
          </div>
          <h3 class="font-bold text-gray-800 text-xl mb-2">{{ reward.name }}</h3>
          <p class="text-gray-600 text-sm mb-4">{{ reward.description }}</p>
          <button
            @click="redeemReward(reward)"
            :disabled="lovePoints < reward.points"
            :class="lovePoints >= reward.points 
              ? 'jelly-button bg-orange-500 hover:bg-orange-600 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
            class="w-full px-4 py-3 rounded-xl font-bold shadow-md"
          >
            {{ lovePoints >= reward.points ? '🎉 立即兑换' : '💤 积分不足' }}
          </button>
        </div>
      </div>

      <!-- 兑换历史 -->
      <div class="border-t border-white/20 pt-6 mt-8">
        <h3 class="text-lg font-bold text-gray-700 mb-4">📜 兑换记录</h3>
        <div v-if="redeemHistory.length > 0" class="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
          <div
            v-for="(record, index) in redeemHistory"
            :key="index"
            class="flex items-center justify-between p-4 bg-white/30 rounded-xl"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ record.icon }}</span>
              <div>
                <div class="font-medium text-gray-800">{{ record.name }}</div>
                <div class="text-sm text-gray-500">{{ record.date }}</div>
              </div>
            </div>
            <div class="text-red-500 font-bold">-{{ record.points }} 积分</div>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-8">
          暂无兑换记录，快去完成任务获取积分吧！
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['updatePoints'])

const lovePoints = ref(0)
const redeemHistory = ref([])

const rewards = ref([
  { id: 1, name: '奶茶一杯', icon: '🥤', points: 100, description: '甜蜜的奶茶，犒劳努力的自己' },
  { id: 2, name: '蛋糕一份', icon: '🍰', points: 150, description: '美味甜点，补充能量' },
  { id: 3, name: '看电影约会', icon: '🎬', points: 300, description: '和恋人一起看场电影' },
  { id: 4, name: '神秘礼物', icon: '🎁', points: 500, description: '给对方准备的神秘惊喜' },
  { id: 5, name: '按摩一次', icon: '💆', points: 400, description: '放松身心，缓解疲劳' },
  { id: 6, name: '美食大餐', icon: '🍽️', points: 600, description: '吃一顿好的庆祝进步' }
])

const redeemReward = (reward) => {
  if (lovePoints.value >= reward.points) {
    lovePoints.value -= reward.points
    localStorage.setItem('lovePoints', lovePoints.value.toString())
    
    // 添加到历史
    redeemHistory.value.unshift({
      ...reward,
      date: new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    })
    localStorage.setItem('redeemHistory', JSON.stringify(redeemHistory.value))
    
    emit('updatePoints')
    alert(`🎉 成功兑换 ${reward.name}！快联系恋人兑现吧～`)
  }
}

const loadData = () => {
  try {
    const savedPoints = localStorage.getItem('lovePoints')
    if (savedPoints) lovePoints.value = parseInt(savedPoints)
    
    const savedHistory = localStorage.getItem('redeemHistory')
    if (savedHistory) {
      redeemHistory.value = JSON.parse(savedHistory)
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

// 初始化
loadData()
</script>
