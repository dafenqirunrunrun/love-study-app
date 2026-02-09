<template>
  <div class="progress-ring-container" :class="{ 'animate-spin-slow': animated }">
    <svg
      :width="size"
      :height="size"
      class="progress-ring"
      :class="{ 'animate-pulse-glow': pulse }"
    >
      <!-- Background circle -->
      <circle
        class="progress-ring-bg"
        :stroke-width="strokeWidth"
        fill="transparent"
        :r="normalizedRadius"
        :cx="radius"
        :cy="radius"
      />
      <!-- Progress circle -->
      <circle
        class="progress-ring-progress"
        :stroke-width="strokeWidth"
        fill="transparent"
        :r="normalizedRadius"
        :cx="radius"
        :cy="radius"
        :style="{ strokeDashoffset, strokeDasharray: `${normalizedRadius * 2 * Math.PI} ${normalizedRadius * 2 * Math.PI}` }"
      />
    </svg>
    <!-- Center content -->
    <div class="progress-ring-content" :style="{ fontSize: `${size * 0.25}px` }">
      <slot>
        <span class="text-2xl font-bold" :class="textColorClass">{{ percentage }}%</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  percentage: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0 && v <= 100
  },
  size: {
    type: Number,
    default: 120
  },
  strokeWidth: {
    type: Number,
    default: 8
  },
  color: {
    type: String,
    default: 'orange'
  },
  animated: {
    type: Boolean,
    default: false
  },
  pulse: {
    type: Boolean,
    default: false
  }
})

const radius = computed(() => props.size / 2)
const normalizedRadius = computed(() => radius.value - props.strokeWidth * 2)
const circumference = computed(() => normalizedRadius.value * 2 * Math.PI)
const strokeDashoffset = computed(() => {
  const progress = props.percentage / 100
  return circumference.value - progress * circumference.value
})

const textColorClass = computed(() => {
  const colors = {
    orange: 'text-orange-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    pink: 'text-pink-600',
    purple: 'text-purple-600'
  }
  return colors[props.color] || colors.orange
})
</script>

<style scoped>
.progress-ring-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-bg {
  stroke: currentColor;
  opacity: 0.2;
}

.progress-ring-progress {
  stroke: url(#progressGradient);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.progress-ring-content {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 20s linear infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
</style>
