<template>
  <Teleport to="body">
    <Transition name="float">
      <div 
        v-if="visible" 
        class="floating-points"
        :style="floatingStyle"
        @click="handleClick"
      >
        <div class="points-content" :class="animationClass">
          <span class="points-icon">{{ icon }}</span>
          <span class="points-value">+{{ points }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface Props {
  points: number
  icon?: string
  fromX?: number
  fromY?: number
  toX?: number
  toY?: number
  duration?: number
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  icon: '💰',
  fromX: 50,
  fromY: 50,
  toX: 50,
  toY: 20,
  duration: 1500,
  size: 'md'
})

const emit = defineEmits<{
  (e: 'complete'): void
}>()

const visible = ref(false)
const currentX = ref(props.fromX)
const currentY = ref(props.fromY)

const sizeClasses: Record<string, string> = {
  sm: 'text-sm px-2 py-1',
  md: 'text-base px-3 py-2',
  lg: 'text-lg px-4 py-3'
}

const animationClass = computed(() => sizeClasses[props.size])

const floatingStyle = computed(() => ({
  left: currentX.value + '%',
  top: currentY.value + '%'
}))

let animationId: number | null = null
let startTime: number | null = null

const animate = (timestamp: number) => {
  if (!startTime) startTime = timestamp
  const elapsed = timestamp - startTime
  const progress = Math.min(elapsed / props.duration, 1)
  
  // Easing function (easeOutCubic)
  const eased = 1 - Math.pow(1 - progress, 3)
  
  // Interpolate position
  currentX.value = props.fromX + (props.toX - props.fromX) * eased
  currentY.value = props.fromY + (props.toY - props.fromY) * eased
  
  // Fade out near end
  const opacity = progress > 0.7 ? (1 - progress) / 0.3 : 1
  
  if (progress >= 1) {
    visible.value = false
    emit('complete')
    return
  }
  
  animationId = requestAnimationFrame(animate)
}

const handleClick = () => {
  visible.value = false
  emit('complete')
}

// Show and animate
watch(() => true, () => {
  visible.value = true
  currentX.value = props.fromX
  currentY.value = props.fromY
  startTime = null
  animationId = requestAnimationFrame(animate)
  
  // Auto complete after duration
  setTimeout(() => {
    if (visible.value) {
      visible.value = false
      emit('complete')
    }
  }, props.duration)
}, { once: true })

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.floating-points {
  position: fixed;
  pointer-events: none;
  z-index: 10000;
  transform: translate(-50%, -50%);
}

.points-content {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  font-weight: 700;
  border-radius: 9999px;
  box-shadow: 
    0 4px 15px rgba(251, 191, 36, 0.4),
    0 0 0 2px rgba(255, 255, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  animation: float-bounce 0.6s ease-out;
}

.points-icon {
  font-size: 1.2em;
}

.points-value {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

@keyframes float-bounce {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(10px);
  }
  50% {
    transform: scale(1.1) translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Transition styles */
.float-enter-active {
  animation: float-bounce 0.6s ease-out;
}

.float-leave-active {
  transition: opacity 0.3s ease-out;
}

.float-leave-to {
  opacity: 0;
}
</style>
