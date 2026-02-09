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
        <!-- 标题栏 -->
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span class="text-3xl animate-bounce-soft">💎</span>
            <span class="text-rainbow">个人积分中心</span>
          </h2>
          
          <!-- 等级徽章 -->
          <div class="level-badge glass-card p-3 flex items-center gap-3">
            <div class="level-avatar bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl w-12 h-12 flex items-center justify-center">
              <span class="text-2xl font-bold text-white">{{ levelInfo.level }}</span>
            </div>
            <div class="level-details">
              <div class="font-bold text-gray-800">{{ levelInfo.name }}</div>
              <div class="text-xs text-gray-500">{{ levelInfo.exp }}/{{ levelInfo.nextLevelExp }} 经验</div>
            </div>
            <div class="level-progress w-20 h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-orange-400 to-pink-500"
                :style="{ width: levelInfo.progress + '%' }"
              ></div>
            </div>
          </div>
          
          <div class="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl">
            <span class="text-2xl animate-pulse-glow">💰</span>
            <span class="text-3xl font-bold text-orange-600">{{ lovePoints }}</span>
          </div>
        </div>

        <!-- 虚拟宠物 -->
        <div class="pet-section glass-card p-6 mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="pet-avatar w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center text-5xl animate-bounce-soft">
                {{ pet.avatar }}
              </div>
              <div>
                <div class="font-bold text-gray-800 text-lg">{{ pet.name }}</div>
                <div class="text-gray-500">{{ pet.mood }}</div>
                <div class="flex items-center gap-2 mt-2">
                  <span class="text-xs text-gray-500">饥饿度:</span>
                  <div class="w-24 h-2 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      class="h-full rounded-full transition-all"
                      :class="pet.hunger > 50 ? 'bg-green-400' : pet.hunger > 20 ? 'bg-yellow-400' : 'bg-red-400'"
                      :style="{ width: pet.hunger + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <button 
              @click="feedPet"
              class="feed-btn"
              :disabled="pet.hunger >= 100"
            >
              🍖 喂食 (+5积分)
            </button>
          </div>
        </div>

        <!-- 积分统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- 当前积分 -->
          <div class="relative group">
            <div class="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div class="relative glass-card p-6 text-center border-0 overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"></div>
              <div class="relative">
                <div class="text-5xl mb-3">💰</div>
                <div class="text-4xl font-bold text-gradient-orange-pink mb-2">{{ lovePoints }}</div>
                <div class="text-gray-600 font-medium">当前可用积分</div>
              </div>
            </div>
          </div>

          <!-- 总获得 -->
          <div class="relative group">
            <div class="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div class="relative glass-card p-6 text-center border-0 overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>
              <div class="relative">
                <div class="text-5xl mb-3">📈</div>
                <div class="text-4xl font-bold text-gradient-green mb-2">{{ totalEarned }}</div>
                <div class="text-gray-600 font-medium">累计获得积分</div>
              </div>
            </div>
          </div>

          <!-- 已消费 -->
          <div class="relative group">
            <div class="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div class="relative glass-card p-6 text-center border-0 overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent"></div>
              <div class="relative">
                <div class="text-5xl mb-3">🛒</div>
                <div class="text-4xl font-bold text-gradient-red mb-2">{{ totalSpent }}</div>
                <div class="text-gray-600 font-medium">已消费积分</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 积分获取统计 -->
        <div class="mb-8">
          <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span class="text-2xl">📊</span>
            <span class="text-rainbow">积分来源统计</span>
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="stat in pointStats" :key="stat.label" 
                 class="p-4 bg-white/30 backdrop-blur-sm rounded-2xl text-center hover:bg-white/50 transition-all hover:scale-105">
              <div class="text-3xl mb-2">{{ stat.icon }}</div>
              <div class="text-2xl font-bold text-orange-600">{{ stat.count }}</div>
              <div class="text-sm text-gray-500">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <!-- 标签页切换 -->
        <div class="flex flex-wrap gap-2 mb-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="activeTab === tab.id 
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30' 
              : 'bg-white/40 text-gray-600 hover:bg-white/60'"
            class="px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
          >
            <span>{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </button>
          
          <!-- 筛选下拉菜单 -->
          <div class="filter-dropdown ml-auto">
            <select v-model="activeFilter" class="filter-select">
              <option v-for="filter in filters" :key="filter.value" :value="filter.value">
                {{ filter.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- 积分获取记录 -->
        <div v-if="activeTab === 'earn'" class="mb-8">
          <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span class="text-2xl">🎁</span>
            <span class="text-rainbow">积分获取记录</span>
          </h3>
          <div v-if="filteredPointsHistory.length > 0" class="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
            <div
              v-for="(record, index) in filteredPointsHistory"
              :key="index"
              class="group relative p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/50 transition-all hover:scale-[1.02]"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {{ record.icon }}
                  </div>
                  <div>
                    <div class="font-bold text-gray-800">{{ record.description }}</div>
                    <div class="text-sm text-gray-500">{{ record.date }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-green-500 font-bold text-lg">+{{ record.points }}</span>
                  <span class="text-gray-400">积分</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12">
            <div class="text-6xl mb-4 opacity-50">📭</div>
            <div class="text-gray-500 text-lg">暂无积分记录</div>
            <div class="text-gray-400 text-sm">完成任务、打卡、专注来获取积分吧！</div>
          </div>
        </div>

        <!-- 兑换记录 -->
        <div v-if="activeTab === 'spend'" class="mb-8">
          <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span class="text-2xl">🛍️</span>
            <span class="text-rainbow">兑换记录</span>
          </h3>
          <div v-if="redeemHistory.length > 0" class="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
            <div
              v-for="(record, index) in redeemHistory"
              :key="index"
              class="group relative p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/50 transition-all hover:scale-[1.02]"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {{ record.icon }}
                  </div>
                  <div>
                    <div class="font-bold text-gray-800">{{ record.name }}</div>
                    <div class="text-sm text-gray-500">{{ record.date }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-red-500 font-bold text-lg">-{{ record.points }}</span>
                  <span class="text-gray-400">积分</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12">
            <div class="text-6xl mb-4 opacity-50">🛒</div>
            <div class="text-gray-500 text-lg">暂无兑换记录</div>
            <div class="text-gray-400 text-sm">快去兑换心仪的奖励吧！</div>
          </div>
        </div>

        <!-- 奖励列表 -->
        <div v-if="activeTab === 'rewards'">
          <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span class="text-2xl">🎁</span>
            <span class="text-rainbow">可兑换奖励</span>
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div
              v-for="reward in rewards"
              :key="reward.id"
              class="group relative bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20 transition-all hover:bg-white/40 hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-2"
            >
              <!-- 已解锁标记 -->
              <div v-if="lovePoints >= reward.points" 
                   class="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg z-10 animate-bounce-soft">
                ✓
              </div>
              
              <!-- 图标 -->
              <div class="text-6xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
                {{ reward.icon }}
              </div>
              
              <!-- 名称和价格 -->
              <div class="text-center mb-3">
                <h3 class="font-bold text-gray-800 text-lg mb-1">{{ reward.name }}</h3>
                <div class="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full">
                  <span class="text-orange-600 font-bold">{{ reward.points }}</span>
                  <span class="text-gray-500 text-sm">积分</span>
                </div>
              </div>
              
              <!-- 描述 -->
              <p class="text-gray-600 text-sm text-center mb-4">{{ reward.description }}</p>
              
              <!-- 兑换按钮 -->
              <button
                @click="redeemReward(reward)"
                :disabled="lovePoints < reward.points"
                class="w-full py-3 rounded-xl font-bold text-sm transition-all"
                :class="lovePoints >= reward.points 
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-lg hover:shadow-orange-500/30' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
              >
                {{ lovePoints >= reward.points ? '🎉 立即兑换' : '💤 积分不足' }}
              </button>
            </div>
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
const activeTab = ref('earn')
const activeFilter = ref('all')

// 等级系统
const levelInfo = computed(() => {
  const totalExp = lovePoints.value / 10
  const level = Math.floor(Math.sqrt(totalExp / 10)) + 1
  const currentLevelExp = Math.pow((level - 1) * 10, 2)
  const nextLevelExp = Math.pow(level * 10, 2)
  const exp = totalExp - currentLevelExp
  const nextExp = nextLevelExp - currentLevelExp
  const progress = Math.min(100, (exp / nextExp) * 100)
  
  const ranks = [
    { level: 1, name: '新手', icon: '🌱' },
    { level: 5, name: '学者', icon: '📚' },
    { level: 10, name: '学霸', icon: '🎓' },
    { level: 20, name: '大咖', icon: '⭐' },
    { level: 50, name: '传奇', icon: '🏆' }
  ]
  
  const currentRank = [...ranks].reverse().find(r => level >= r.level) || ranks[0]
  
  return {
    level,
    name: currentRank.name,
    exp: Math.floor(exp),
    nextLevelExp: Math.floor(nextExp),
    progress
  }
})

// 虚拟宠物
const pet = ref({
  name: '学习小助手',
  avatar: '🐱',
  mood: '开心',
  hunger: 80
})

const feedPet = () => {
  if (pet.value.hunger < 100) {
    pet.value.hunger = Math.min(100, pet.value.hunger + 10)
    lovePoints.value += 5
    pet.value.mood = '超开心!'
    saveData()
    
    setTimeout(() => {
      pet.value.mood = pet.value.hunger > 50 ? '开心' : '有点饿'
    }, 2000)
  }
}

const tabs = [
  { id: 'earn', label: '获取记录', icon: '📈' },
  { id: 'spend', label: '兑换记录', icon: '🛍️' },
  { id: 'rewards', label: '兑换奖励', icon: '🎁' }
]

const filters = [
  { label: '全部', value: 'all' },
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' }
]

const rewards = ref([
  { id: 1, name: '冰淇淋', icon: '🍦', points: 50, description: '清凉一夏，甜蜜小确幸' },
  { id: 2, name: '咖啡一杯', icon: '☕', points: 80, description: '提神醒脑，继续加油' },
  { id: 3, name: '奶茶一杯', icon: '🥤', points: 100, description: '甜蜜的奶茶，犒劳努力的自己' },
  { id: 4, name: '蛋糕一份', icon: '🍰', points: 150, description: '美味甜点，补充能量' },
  { id: 5, name: '汉堡套餐', icon: '🍔', points: 180, description: '快餐自由，大快朵颐' },
  { id: 6, name: '披萨一份', icon: '🍕', points: 200, description: '芝士拉丝，满足味蕾' },
  { id: 7, name: '下午茶', icon: '🍵', points: 250, description: '悠闲时光，放松片刻' },
  { id: 8, name: '看电影约会', icon: '🎬', points: 300, description: '和恋人一起看场电影' },
  { id: 9, name: '盲盒一个', icon: '🎰', points: 350, description: '惊喜与期待并存' },
  { id: 10, name: '按摩一次', icon: '💆', points: 400, description: '放松身心，缓解疲劳' },
  { id: 11, name: '神秘礼物', icon: '🎁', points: 500, description: '给对方准备的神秘惊喜' },
  { id: 12, name: '剧本杀', icon: '🎭', points: 550, description: '沉浸式体验，换个身份' },
  { id: 13, name: '密室逃脱', icon: '🔐', points: 600, description: '烧脑刺激，团队协作' },
  { id: 14, name: '美食大餐', icon: '🍽️', points: 600, description: '吃一顿好的庆祝进步' },
  { id: 15, name: '短途旅行', icon: '🚗', points: 800, description: '换个城市，换种心情' },
  { id: 16, name: '演唱会门票', icon: '🎤', points: 1000, description: '近距离感受音乐魅力' },
  { id: 17, name: '游乐园一日', icon: '🎢', points: 1200, description: '重拾童年的快乐' },
  { id: 18, name: 'SPA水疗', icon: '🧖', points: 1500, description: '极致放松，焕发活力' },
  { id: 19, name: '奢侈品', icon: '💎', points: 2000, description: '犒劳自己的努力成果' },
  { id: 20, name: '环球旅行', icon: '🌍', points: 5000, description: '世界那么大，想去看看' }
])

// 计算总获得和总消费
const totalEarned = computed(() => {
  return pointsHistory.value.reduce((sum, record) => sum + record.points, 0)
})

const totalSpent = computed(() => {
  return redeemHistory.value.reduce((sum, record) => sum + record.points, 0)
})

// 筛选后的积分记录
const filteredPointsHistory = computed(() => {
  let history = pointsHistory.value
  
  if (activeFilter.value === 'today') {
    const today = new Date().toLocaleDateString('zh-CN')
    history = history.filter(r => r.date.includes(today))
  } else if (activeFilter.value === 'week') {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    history = history.filter(r => new Date(r.date) >= weekAgo)
  } else if (activeFilter.value === 'month') {
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    history = history.filter(r => new Date(r.date) >= monthAgo)
  }
  
  return history
})

// 积分统计
const pointStats = computed(() => {
  const taskCount = pointsHistory.value.filter(r => r.description?.includes('任务')).length
  const habitCount = pointsHistory.value.filter(r => r.description?.includes('习惯')).length
  const focusCount = pointsHistory.value.filter(r => r.description?.includes('专注')).length
  const bonusCount = pointsHistory.value.filter(r => !taskCount && !habitCount && !focusCount).length
  
  return [
    { icon: '📝', label: '完成任务', count: taskCount },
    { icon: '📅', label: '习惯打卡', count: habitCount },
    { icon: '⏱️', label: '专注次数', count: focusCount },
    { icon: '🎁', label: '额外奖励', count: bonusCount }
  ]
})

const redeemReward = (reward) => {
  if (lovePoints.value >= reward.points) {
    // 动画效果
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
    showSuccess(`成功兑换 ${reward.icon} ${reward.name}！快联系恋人兑现吧～`)
  }
}

const showSuccess = (message) => {
  // 使用全局toast
  const event = new CustomEvent('showToast', { 
    detail: { message, type: 'success' } 
  })
  window.dispatchEvent(event)
}

const saveData = () => {
  localStorage.setItem('lovePoints', lovePoints.value.toString())
  localStorage.setItem('petState', JSON.stringify(pet.value))
}

const loadData = () => {
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
    
    // 加载宠物状态
    const savedPet = localStorage.getItem('petState')
    if (savedPet) {
      pet.value = JSON.parse(savedPet)
    }
    
    isDarkMode.value = document.documentElement.classList.contains('dark')
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 300)
  }
}

onMounted(loadData)
</script>

<style scoped>
.text-gradient-orange-pink {
  background: linear-gradient(135deg, #f97316, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-green {
  background: linear-gradient(135deg, #22c55e, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-red {
  background: linear-gradient(135deg, #ef4444, #f43f5e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.filter-select {
  padding: 8px 16px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  color: #666;
  font-size: 14px;
  cursor: pointer;
}

.feed-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #f97316, #f472b6);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.feed-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
}

.feed-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
