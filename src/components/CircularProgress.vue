<template>
  <div class="circular-progress" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :viewBox="`0 0 ${size} ${size}`">
      <!-- 背景圆 -->
      <circle
        class="progress-bg"
        :stroke-width="strokeWidth"
        fill="transparent"
        :r="radius"
        :cx="size / 2"
        :cy="size / 2"
      />
      <!-- 进度圆 -->
      <circle
        class="progress-bar"
        :stroke-width="strokeWidth"
        fill="transparent"
        :r="radius"
        :cx="size / 2"
        :cy="size / 2"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        :class="{ animate: animate }"
      />
    </svg>
    
    <!-- 中心内容 -->
    <div class="progress-content">
      <slot>
        <span class="progress-value">{{ displayValue }}</span>
        <span v-if="showLabel" class="progress-label">{{ label }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  animate?: boolean
  showLabel?: boolean
  label?: string
  max?: number
  current?: number
}>()

const size = computed(() => props.size || 100)
const strokeWidth = computed(() => props.strokeWidth || 8)
const radius = computed(() => (size.value - strokeWidth.value) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => {
  const progress = Math.min(100, Math.max(0, props.percentage))
  return circumference.value - (progress / 100) * circumference.value
})

const displayValue = computed(() => {
  if (props.current !== undefined && props.max !== undefined) {
    return `${props.current}/${props.max}`
  }
  return `${Math.round(props.percentage)}%`
})
</script>

<style scoped>
.circular-progress {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

svg {
  transform: rotate(-90deg);
}

.progress-bg {
  stroke: rgba(255, 255, 255, 0.2);
}

.progress-bar {
  stroke: url(#gradient) v-bind(color) || #f97316;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.progress-bar.animate {
  animation: progressAnimation 1s ease-out;
}

@keyframes progressAnimation {
  from {
    stroke-dashoffset: v-bind(circumference);
  }
}

.progress-content {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.progress-value {
  font-size: 1.2em;
  font-weight: bold;
  background: linear-gradient(135deg, #f97316, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.progress-label {
  font-size: 0.7em;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
}
</style>
