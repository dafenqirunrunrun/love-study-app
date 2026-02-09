<template>
  <span 
    :class="[computedClass, 'animated-counter']"
    :aria-label="displayValue.toString()"
  >
    {{ displayValue }}{{ suffix }}{{ prefix }}
  </span>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface Props {
  value: number
  duration?: number
  easing?: 'linear' | 'easeOut' | 'easeInOut'
  decimals?: number
  prefix?: string
  suffix?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  bold?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  duration: 1000,
  easing: 'easeOut',
  decimals: 0,
  prefix: '',
  suffix: '',
  size: 'md',
  color: 'primary',
  bold: true
})

const displayValue = ref(0)
const targetValue = ref(props.value)

// Easing functions
const easings: Record<string, (t: number) => number> = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const easing = easings[props.easing]

// Animation
const animate = () => {
  const startTime = performance.now()
  const startValue = displayValue.value
  const endValue = targetValue.value
  
  const tick = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / props.duration, 1)
    const easedProgress = easing(progress)
    
    const current = startValue + (endValue - startValue) * easedProgress
    
    if (props.decimals > 0) {
      displayValue.value = parseFloat(current.toFixed(props.decimals))
    } else {
      displayValue.value = Math.round(current)
    }
    
    if (progress < 1) {
      requestAnimationFrame(tick)
    }
  }
  
  requestAnimationFrame(tick)
}

// Watch for value changes
watch(() => props.value, (newValue) => {
  targetValue.value = newValue
  animate()
})

// Size classes
const sizeClasses: Record<string, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-2xl'
}

// Color classes
const colorClasses: Record<string, string> = {
  primary: 'text-orange-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
  info: 'text-blue-600'
}

const computedClass = computed(() => {
  const classes = [sizeClasses[props.size]]
  if (props.color) classes.push(colorClasses[props.color])
  if (props.bold) classes.push('font-bold')
  return classes.join(' ')
})

onMounted(() => {
  displayValue.value = props.value
})
</script>

<style scoped>
.animated-counter {
  display: inline-block;
  will-change: transform, opacity;
}
</style>
