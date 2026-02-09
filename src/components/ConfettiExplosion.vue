<template>
  <Teleport to="body">
    <div 
      v-if="show" 
      class="confetti-explosion"
      :style="containerStyle"
      @click="handleClick"
    >
      <div 
        v-for="(particle, index) in particles" 
        :key="index"
        class="confetti-particle"
        :style="getParticleStyle(particle)"
      >
        <span v-if="particle.emoji" class="confetti-emoji">{{ particle.emoji }}</span>
      </div>
      
      <!-- Celebration text -->
      <div v-if="showText" class="celebration-text" :class="textClass">
        {{ text }}
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  scale: number
  color: string
  emoji?: string
  type: 'confetti' | 'stars' | 'sparkles' | 'trophy'
}

interface Props {
  show?: boolean
  x?: number
  y?: number
  type?: 'confetti' | 'stars' | 'sparkles' | 'trophy' | 'success'
  text?: string
  showText?: boolean
  particleCount?: number
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  x: 50,
  y: 50,
  type: 'confetti',
  text: '',
  showText: false,
  particleCount: 50,
  duration: 2000
})

const emit = defineEmits<{
  (e: 'complete'): void
}>()

const particles = ref<Particle[]>([])
const containerStyle = computed(() => ({
  left: props.x + '%',
  top: props.y + '%'
}))

// Color palettes
const colorPalettes: Record<string, string[]> = {
  confetti: ['#f97316', '#f472b6', '#3b82f6', '#22c55e', '#eab308', '#a855f7'],
  stars: ['#fbbf24', '#f59e0b', '#fcd34d', '#fb923c', '#fde047'],
  sparkles: ['#f97316', '#f472b6', '#fb7185', '#22d3ee', '#a78bfa'],
  trophy: ['#fbbf24', '#f59e0b', '#fde047', '#fb923c', '#ffd700']
}

const textClass = computed(() => {
  const classes: Record<string, string> = {
    confetti: 'text-orange-600',
    stars: 'text-yellow-600',
    sparkles: 'text-purple-600',
    trophy: 'text-yellow-600',
    success: 'text-green-600'
  }
  return classes[props.type]
})

// Emoji sets
const emojiSets: Record<string, string[]> = {
  confetti: ['🎉', '✨', '🌟', '💫', '⭐', '🎊', '🎈'],
  stars: ['⭐', '🌟', '✨', '💫', '🌠'],
  sparkles: ['✨', '💫', '🌟', '⭐', '💥'],
  trophy: ['🏆', '🥇', '🎖️', '⭐', '🌟'],
  success: ['✅', '🎉', '✨', '💪', '👍']
}

const colors = colorPalettes[props.type] || colorPalettes.confetti
const emojis = emojiSets[props.type] || emojiSets.confetti

// Create particles
const createParticles = () => {
  particles.value = []
  
  for (let i = 0; i < props.particleCount; i++) {
    const angle = (Math.PI * 2 * i) / props.particleCount
    const speed = 8 + Math.random() * 12
    const size = 8 + Math.random() * 12
    
    particles.value.push({
      id: i,
      x: 0,
      y: 0,
      vx: Math.cos(angle) * speed * (0.5 + Math.random() * 0.5),
      vy: Math.sin(angle) * speed * (0.5 + Math.random() * 0.5) - 5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 20,
      scale: 0.5 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      emoji: Math.random() > 0.7 ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
      type: props.type
    })
  }
}

// Physics animation
let animationId: number | null = null
let startTime: number | null = null

const animate = (timestamp: number) => {
  if (!startTime) startTime = timestamp
  const elapsed = timestamp - startTime
  const progress = elapsed / props.duration
  
  if (progress >= 1) {
    particles.value = []
    emit('complete')
    return
  }
  
  // Apply physics
  particles.value = particles.value.map(p => {
    // Gravity
    const gravity = 0.3
    // Air resistance
    const friction = 0.98
    
    let newX = p.x + p.vx
    let newY = p.y + p.vy + gravity
    let newVx = p.vx * friction
    let newVy = p.vy * friction
    
    // Bounce off edges (approximate)
    if (newX < -50 || newX > 50) {
      newVx *= -0.5
      newX = Math.max(-50, Math.min(50, newX))
    }
    
    return {
      ...p,
      x: newX,
      y: newY,
      vx: newVx,
      vy: newVy,
      rotation: p.rotation + p.rotationSpeed,
      scale: p.scale * (1 - progress * 0.3)
    }
  })
  
  animationId = requestAnimationFrame(animate)
}

const getParticleStyle = (particle: Particle) => {
  return {
    left: `calc(${particle.x}% + 8px)`,
    top: `calc(${particle.y}% + 8px)`,
    '--particle-color': particle.color,
    transform: `translate(-50%, -50%) rotate(${particle.rotation}deg) scale(${particle.scale})`,
    backgroundColor: particle.emoji ? 'transparent' : particle.color,
    width: particle.emoji ? 'auto' : '10px',
    height: particle.emoji ? 'auto' : '10px',
    fontSize: particle.emoji ? '20px' : undefined
  }
}

const handleClick = () => {
  particles.value = []
  emit('complete')
}

// Watch for show trigger
watch(() => props.show, (newValue) => {
  if (newValue) {
    createParticles()
    startTime = null
    animationId = requestAnimationFrame(animate)
    
    // Auto hide after duration
    setTimeout(() => {
      if (particles.value.length > 0) {
        particles.value = []
        emit('complete')
      }
    }, props.duration)
  }
}, { immediate: true })

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.confetti-explosion {
  position: fixed;
  width: 200px;
  height: 200px;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
}

.confetti-particle {
  position: absolute;
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.confetti-emoji {
  font-size: 1.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.celebration-text {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  animation: celebration-bounce 0.6s ease-out;
  white-space: nowrap;
}

@keyframes celebration-bounce {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(20px) scale(0.5);
  }
  50% {
    transform: translateX(-50%) translateY(-10px) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}
</style>
