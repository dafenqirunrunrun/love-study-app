<template>
  <div class="animate-pulse space-y-4">
    <!-- 标题骨架 -->
    <div v-if="type === 'card' || type === 'full'" class="space-y-4">
      <div class="flex items-center space-x-4">
        <div 
          class="skeleton-pulse rounded-full"
          :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
          :style="{ width: avatarSize, height: avatarSize }"
        ></div>
        <div class="flex-1 space-y-2">
          <div 
            class="skeleton-pulse rounded h-4"
            :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
            :style="{ width: titleWidth }"
          ></div>
          <div 
            class="skeleton-pulse rounded h-3"
            :class="darkMode ? 'bg-white/15' : 'bg-white/30'"
            :style="{ width: subtitleWidth }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 统计卡片骨架 -->
    <div v-if="type === 'stats'" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div 
        v-for="i in 4" 
        :key="i"
        class="rounded-2xl p-6 text-center"
        :class="darkMode ? 'bg-white/10' : 'bg-white/30'"
      >
        <div 
          class="skeleton-pulse rounded-full mx-auto mb-2"
          :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
          :style="{ width: iconSize, height: iconSize }"
        ></div>
        <div 
          class="skeleton-pulse rounded h-6 mx-auto mb-1"
          :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
          :style="{ width: statWidth }"
        ></div>
        <div 
          class="skeleton-pulse rounded h-3 mx-auto"
          :class="darkMode ? 'bg-white/15' : 'bg-white/30'"
          :style="{ width: labelWidth }"
        ></div>
      </div>
    </div>

    <!-- 列表骨架 -->
    <div v-if="type === 'list'" class="space-y-3">
      <div 
        v-for="i in rows" 
        :key="i"
        class="flex items-center gap-3 p-4 rounded-xl"
        :class="darkMode ? 'bg-white/10' : 'bg-white/30'"
      >
        <div 
          class="skeleton-pulse rounded-lg"
          :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
          :style="{ width: checkboxSize, height: checkboxSize }"
        ></div>
        <div class="flex-1 space-y-2">
          <div 
            class="skeleton-pulse rounded h-4"
            :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
          ></div>
          <div 
            class="skeleton-pulse rounded h-3"
            :class="darkMode ? 'bg-white/15' : 'bg-white/30'"
            :style="{ width: '60%' }"
          ></div>
        </div>
        <div 
          class="skeleton-pulse rounded-full px-3 py-1"
          :class="darkMode ? 'bg-white/15' : 'bg-white/50'"
          :style="{ width: tagWidth, height: tagHeight }"
        ></div>
      </div>
    </div>

    <!-- 网格骨架 -->
    <div v-if="type === 'grid'" class="grid gap-6" :class="gridCols">
      <div 
        v-for="i in rows" 
        :key="i"
        class="rounded-2xl p-6"
        :class="darkMode ? 'bg-white/10' : 'bg-white/30'"
      >
        <div class="flex items-start justify-between mb-4">
          <div 
            class="skeleton-pulse rounded-xl"
            :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
            :style="{ width: iconSize, height: iconSize }"
          ></div>
          <div 
            class="skeleton-pulse rounded-full px-3 py-1"
            :class="darkMode ? 'bg-white/15' : 'bg-white/50'"
            :style="{ width: pointsWidth, height: pointsHeight }"
          ></div>
        </div>
        <div 
          class="skeleton-pulse rounded h-5 mb-2"
          :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
          :style="{ width: '80%' }"
        ></div>
        <div 
          class="skeleton-pulse rounded h-3 mb-4"
          :class="darkMode ? 'bg-white/15' : 'bg-white/30'"
          :style="{ width: '100%' }"
        ></div>
        <div 
          class="skeleton-pulse rounded-xl py-3"
          :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
        ></div>
      </div>
    </div>

    <!-- 完整页面骨架 -->
    <div v-if="type === 'full'" class="space-y-6">
      <div class="grid md:grid-cols-2 gap-6">
        <!-- 倒计时卡片 -->
        <div class="glass-card p-8 flex flex-col items-center justify-center text-center">
          <div 
            class="skeleton-pulse rounded-full mb-4"
            :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
            :style="{ width: bigIconSize, height: bigIconSize }"
          ></div>
          <div 
            class="skeleton-pulse rounded h-8 mb-2"
            :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
            :style="{ width: '40%' }"
          ></div>
          <div 
            class="skeleton-pulse rounded h-16 mb-2"
            :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
            :style="{ width: '60%' }"
          ></div>
          <div 
            class="skeleton-pulse rounded h-4 mt-4 w-full"
            :class="darkMode ? 'bg-white/15' : 'bg-white/30'"
          ></div>
        </div>

        <!-- 鼓励语卡片 -->
        <div class="glass-card p-8">
          <div 
            class="skeleton-pulse rounded-full mb-4"
            :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
            :style="{ width: bigIconSize, height: bigIconSize }"
          ></div>
          <div class="space-y-3">
            <div 
              class="skeleton-pulse rounded h-6"
              :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
            ></div>
            <div 
              class="skeleton-pulse rounded h-6"
              :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
              :style="{ width: '90%' }"
            ></div>
            <div 
              class="skeleton-pulse rounded h-6"
              :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
              :style="{ width: '75%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-3 gap-4">
        <div 
          v-for="i in 3" 
          :key="i"
          class="glass-card p-4 text-center"
          :class="darkMode ? 'bg-white/10' : 'bg-white/30'"
        >
          <div 
            class="skeleton-pulse rounded h-8 mb-1"
            :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
          ></div>
          <div 
            class="skeleton-pulse rounded h-3"
            :class="darkMode ? 'bg-white/15' : 'bg-white/30'"
          ></div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="glass-card p-8">
        <div 
          class="skeleton-pulse rounded h-6 mb-4 w-1/4"
          :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
        ></div>
        <div class="grid grid-cols-2 gap-3">
          <div 
            v-for="i in 4" 
            :key="i"
            class="skeleton-pulse rounded-xl p-4"
            :class="darkMode ? 'bg-white/15' : 'bg-white/30'"
          ></div>
        </div>
      </div>
    </div>

    <!-- 自定义骨架 -->
    <div v-if="type === 'custom'" class="space-y-3">
      <div 
        v-for="i in rows" 
        :key="i"
        :class="darkMode ? 'bg-white/10' : 'bg-white/30'"
        class="rounded-xl p-4"
      >
        <div class="flex items-center gap-3">
          <div 
            class="skeleton-pulse rounded"
            :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
            :style="{ width: avatarSize, height: avatarSize }"
          ></div>
          <div class="flex-1 space-y-2">
            <div 
              class="skeleton-pulse rounded h-4"
              :class="darkMode ? 'bg-white/20' : 'bg-white/40'"
              :style="{ width: i % 2 === 0 ? '70%' : '85%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  // 骨架类型: card, stats, list, grid, full, custom
  type: {
    type: String,
    default: 'card'
  },
  // 行数
  rows: {
    type: Number,
    default: 3
  },
  // 是否为深色模式
  darkMode: {
    type: Boolean,
    default: false
  },
  // 网格列数
  gridCols: {
    type: String,
    default: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  },
  // 尺寸配置
  avatarSize: {
    type: String,
    default: '3rem'
  },
  iconSize: {
    type: String,
    default: '2.5rem'
  },
  bigIconSize: {
    type: String,
    default: '4rem'
  },
  checkboxSize: {
    type: String,
    default: '1.5rem'
  },
  // 宽度配置
  titleWidth: {
    type: String,
    default: '60%'
  },
  subtitleWidth: {
    type: String,
    default: '40%'
  },
  statWidth: {
    type: String,
    default: '3rem'
  },
  labelWidth: {
    type: String,
    default: '4rem'
  },
  tagWidth: {
    type: String,
    default: 'auto'
  },
  tagHeight: {
    type: String,
    default: '1.5rem'
  },
  pointsWidth: {
    type: String,
    default: '4rem'
  },
  pointsHeight: {
    type: String,
    default: '1.5rem'
  }
})
</script>

<style scoped>
.skeleton-pulse {
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
