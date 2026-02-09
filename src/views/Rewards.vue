<template>
  <div class="max-w-7xl mx-auto">
    <!-- 骨架屏加载状态 -->
    <template v-if="isLoading">
      <div class="glass-card p-8">
        <div class="flex items-center justify-between mb-8">
          <div class="skeleton-pulse rounded h-8 w-48" :class="isDarkMode ? 'bg-white/20' : 'bg-white/40'"></div>
          <div class="flex items-center gap-2">
            <div class="skeleton-pulse rounded-full w-8 h-8" :class="isDarkMode ? 'bg-white/20' : 'bg-white/40'"></div>
            <div class="skeleton-pulse rounded h-6 w-24" :class="isDarkMode ? 'bg-white/20' : 'bg-white/40'"></div>
          </div>
        </div>
        <SkeletonLoader type="full" :dark-mode="isDarkMode" />
      </div>
    </template>

    <!-- 真实内容 -->
    <template v-else>
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
            <div class="mt-4 flex justify-center gap-6 text-sm">
              <div class="text-green-600">
                <span class="font-bold">{{ totalEarned }}</span> 总获得
              </div>
              <div class="text-red-500">
                <span class="font-bold">{{ totalSpent }}</span> 已消费
              </div>
            </div>
          </div>
        </div>

        <!-- 积分获取记录 -->
        <div class="mb-8">
          <h3 class="text-lg font-bold text-gray-700 mb-4">📈 积分获取记录</h3>
          <div v-if="pointsHistory.length > 0" class="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
            <div
              v-for="(record, index) in pointsHistory"
              :key="index"
              class="flex items-center justify-between p-4 bg-white/30 rounded-xl"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ record.icon }}</span>
                <div>
                  <div class="font-medium text-gray-800">{{ record.description }}</div>
                  <div class="text-sm text-gray-500">{{ record.date }}</div>
                </div>
              </div>
              <div class="text-green-500 font-bold">+{{ record.points }} 积分</div>
            </div>
          </div>
          <div v-else class="text-center text-gray-500 py-8">
            暂无积分记录，开始完成任务获取积分吧！
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
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'

const emit = defineEmits(['updatePoints'])

const lovePoints = ref(0)
const redeemHistory = ref([])
const pointsHistory = ref([])
const isLoading = ref(true)
const isDarkMode = ref(false)

const rewards = ref([
  { id: 1, name: '奶茶一杯', icon: '🥤', points: 100, description: '甜蜜的奶茶，犒劳努力的自己' },
  { id: 2, name: '蛋糕一份', icon: '🍰', points: 150, description: '美味甜点，补充能量' },
  { id: 3, name: '看电影约会', icon: '🎬', points: 300, description: '和恋人一起看场电影' },
  { id: 4, name: '神秘礼物', icon: '🎁', points: 500, description: '给对方准备的神秘惊喜' },
  { id: 5, name: '按摩一次', icon: '💆', points: 400, description: '放松身心，缓解疲劳' },
  { id: 6, name: '美食大餐', icon: '🍽️', points: 600, description: '吃一顿好的庆祝进步' }
])

// 计算总获得和总消费
const totalEarned = computed(() => {
  return pointsHistory.value.reduce((sum, record) => sum + record.points, 0)
})

const totalSpent = computed(() => {
  return redeemHistory.value.reduce((sum, record) => sum + record.points, 0)
})

const redeemReward = (reward) => {
  if (lovePoints.value >= reward.points) {
    lovePoints.value -= reward.points
    localStorage.setItem('lovePoints', lovePoints.value.toString())
    
    // 添加到消费历史
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
    
    // 显示成功提示
    const event = new CustomEvent('showToast', { 
      detail: { 
        message: `成功兑换 ${reward.name}！快联系恋人兑现吧～`, 
        type: 'success',
        title: '兑换成功'
      } 
    })
    window.dispatchEvent(event)
  }
}

// 添加积分获取记录
const addPointsRecord = (points, description, icon) => {
  pointsHistory.value.unshift({
    points,
    description,
    icon,
    date: new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  })
  // 只保留最近100条
  if (pointsHistory.value.length > 100) {
    pointsHistory.value = pointsHistory.value.slice(0, 100)
  }
  localStorage.setItem('pointsHistory', JSON.stringify(pointsHistory.value))
}

const loadData = () => {
  // 显示骨架屏
  isLoading.value = true
  
  try {
    const savedPoints = localStorage.getItem('lovePoints')
    if (savedPoints) lovePoints.value = parseInt(savedPoints)
    
    const savedRedeemHistory = localStorage.getItem('redeemHistory')
    if (savedRedeemHistory) {
      redeemHistory.value = JSON.parse(savedRedeemHistory)
    }
    
    const savedPointsHistory = localStorage.getItem('pointsHistory')
    if (savedPointsHistory) {
      pointsHistory.value = JSON.parse(savedPointsHistory)
    }
    
    // 检查深色模式
    isDarkMode.value = document.documentElement.classList.contains('dark')
  } catch (error) {
    console.error('Error loading data:', error)
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
