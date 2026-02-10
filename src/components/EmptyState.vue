<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <!-- Animated Icon -->
    <div 
      class="mb-6 relative"
      :class="iconSize"
    >
      <!-- Background Circle -->
      <div 
        class="absolute inset-0 rounded-full opacity-20 animate-pulse"
        :class="bgColor"
      ></div>
      
      <!-- Icon with animation -->
      <div 
        class="relative z-10 animate-bounce-soft"
        :class="iconClass"
      >
        {{ icon }}
      </div>
      
      <!-- Floating decorations -->
      <div 
        v-if="showDecorations"
        class="absolute -top-2 -right-2 text-2xl animate-float"
        style="animation-delay: 0s;"
      >
        ✨
      </div>
      <div 
        v-if="showDecorations"
        class="absolute -bottom-1 -left-3 text-xl animate-float"
        style="animation-delay: 0.5s;"
      >
        🌟
      </div>
    </div>
    
    <!-- Title -->
    <h3 
      v-if="title"
      class="text-xl font-bold mb-2"
      :class="titleClass"
    >
      {{ title }}
    </h3>
    
    <!-- Description -->
    <p 
      v-if="description"
      class="text-sm max-w-md mb-6"
      :class="descriptionClass"
    >
      {{ description }}
    </p>
    
    <!-- Action Button -->
    <button
      v-if="actionText"
      @click="handleAction"
      class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
      :disabled="actionLoading"
    >
      <span 
        v-if="actionLoading" 
        class="animate-spin"
      >
        ⏳
      </span>
      <span v-else>{{ actionIcon || '➕' }}</span>
      <span>{{ actionText }}</span>
    </button>
    
    <!-- Tips -->
    <div 
      v-if="tips && tips.length > 0"
      class="mt-8 p-4 bg-white/30 dark:bg-gray-800/30 rounded-xl max-w-sm"
    >
      <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        💡 小贴士
      </div>
      <ul class="text-sm space-y-1 text-gray-600 dark:text-gray-300">
        <li 
          v-for="(tip, index) in tips" 
          :key="index"
          class="flex items-start gap-2"
        >
          <span class="text-orange-400 mt-0.5">•</span>
          <span>{{ tip }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Content
  icon: {
    type: String,
    default: '📭'
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  
  // Action
  actionText: {
    type: String,
    default: ''
  },
  actionIcon: {
    type: String,
    default: ''
  },
  actionLoading: {
    type: Boolean,
    default: false
  },
  
  // Tips
  tips: {
    type: Array,
    default: () => []
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default', // default, tasks, habits, journal, achievements, rewards
    validator: (val) => ['default', 'tasks', 'habits', 'journal', 'achievements', 'rewards'].includes(val)
  },
  
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (val) => ['small', 'medium', 'large'].includes(val)
  },
  
  darkMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['action'])

// Computed styles based on variant
const variantConfig = computed(() => {
  const configs = {
    default: {
      bgColor: 'bg-orange-500',
      iconColor: 'text-orange-500',
      bgClass: 'bg-orange-100 dark:bg-orange-900/20'
    },
    tasks: {
      bgColor: 'bg-blue-500',
      iconColor: 'text-blue-500',
      bgClass: 'bg-blue-100 dark:bg-blue-900/20'
    },
    habits: {
      bgColor: 'bg-green-500',
      iconColor: 'text-green-500',
      bgClass: 'bg-green-100 dark:bg-green-900/20'
    },
    journal: {
      bgColor: 'bg-purple-500',
      iconColor: 'text-purple-500',
      bgClass: 'bg-purple-100 dark:bg-purple-900/20'
    },
    achievements: {
      bgColor: 'bg-yellow-500',
      iconColor: 'text-yellow-500',
      bgClass: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    rewards: {
      bgColor: 'bg-pink-500',
      iconColor: 'text-pink-500',
      bgClass: 'bg-pink-100 dark:bg-pink-900/20'
    }
  }
  return configs[props.variant] || configs.default
})

const sizeConfig = computed(() => {
  const configs = {
    small: {
      iconWrapper: 'w-16 h-16',
      icon: 'text-3xl',
      title: 'text-lg',
      description: 'text-sm'
    },
    medium: {
      iconWrapper: 'w-24 h-24',
      icon: 'text-5xl',
      title: 'text-xl',
      description: 'text-sm'
    },
    large: {
      iconWrapper: 'w-32 h-32',
      icon: 'text-7xl',
      title: 'text-2xl',
      description: 'text-base'
    }
  }
  return configs[props.size] || configs.medium
})

const iconSize = computed(() => sizeConfig.value.iconWrapper)
const iconClass = computed(() => `${variantConfig.value.iconColor} ${sizeConfig.value.icon}`)
const bgColor = computed(() => variantConfig.value.bgColor)
const titleClass = computed(() => props.darkMode ? 'text-gray-100' : 'text-gray-800')
const descriptionClass = computed(() => props.darkMode ? 'text-gray-400' : 'text-gray-500')

const showDecorations = computed(() => props.variant !== 'default')

// Handle action click
const handleAction = () => {
  emit('action')
}
</script>

<script>
// Preset empty state configurations
export const emptyStateConfigs = {
  tasks: {
    icon: '📋',
    title: '暂无任务',
    description: '开始规划你的学习任务，让每一天都充满目标！',
    actionText: '添加第一个任务',
    variant: 'tasks',
    tips: [
      '建议设置任务优先级和截止日期',
      '可以将大任务拆分成小任务',
      '定期回顾和调整任务计划'
    ]
  },
  habits: {
    icon: '🎯',
    title: '还没有习惯',
    description: '养成好习惯，让学习变得更轻松！',
    actionText: '添加第一个习惯',
    variant: 'habits',
    tips: [
      '建议从简单的小习惯开始',
      '保持连续打卡可以获得额外积分',
      '习惯贵在坚持，不要轻易放弃'
    ]
  },
  journal: {
    icon: '💭',
    title: '还没有心得',
    description: '记录你的学习感悟，让成长有迹可循！',
    actionText: '写第一条心得',
    variant: 'journal',
    tips: [
      '每天花5分钟记录学习收获',
      '可以记录困惑和解决方法',
      '定期回顾会发现自己的进步'
    ]
  },
  achievements: {
    icon: '🏆',
    title: '还没有成就',
    description: '完成学习任务，解锁专属成就！',
    variant: 'achievements',
    tips: [
      '完成任务可以获得成就',
      '连续打卡会解锁特殊成就',
      '积累专注时间也能获得成就'
    ]
  },
  rewards: {
    icon: '🎁',
    title: '还没有奖励',
    description: '设定你想要的奖励，为学习增添动力！',
    actionText: '添加第一个奖励',
    variant: 'rewards',
    tips: [
      '建议设置有吸引力的奖励',
      '可以用积分兑换喜欢的奖励',
      '完成目标后记得奖励自己'
    ]
  },
  noSearchResults: {
    icon: '🔍',
    title: '没有找到结果',
    description: '试试其他关键词，或者扩大搜索范围？',
    variant: 'default',
    tips: [
      '检查拼写是否正确',
      '尝试使用更简单的关键词',
      '可以浏览所有内容再筛选'
    ]
  }
}

export default {
  name: 'EmptyState'
}
</script>
