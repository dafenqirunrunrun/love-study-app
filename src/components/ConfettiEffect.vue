<template>
  <Teleport to="body">
    <div v-if="isActive" class="confetti-container">
      <div
        v-for="(particle, index) in particles"
        :key="index"
        class="confetti-particle"
        :style="getParticleStyle(particle)"
      >
        {{ particle.emoji }}
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  duration: {
    type: Number,
    default: 3000
  },
  particleCount: {
    type: Number,
    default: 100
  },
  emojis: {
    type: Array,
    default: () => ['🎉', '✨', '🌟', '💫', '⭐', '🎊', '🥳', '🎈', '🎁', '💯']
  }
})

const emit = defineEmits(['complete'])

const isActive = ref(false)
const particles = ref([])
let animationId = null

const createParticles = () => {
  particles.value = []
  for (let i = 0; i < props.particleCount; i++) {
    const side = Math.random() > 0.5 ? 1 : -1
    particles.value.push({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      rotation: Math.random() * 720 - 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      scale: 0.5 + Math.random() * 1,
      duration: 1500 + Math.random() * 2000,
      delay: Math.random() * 500,
      emoji: props.emojis[Math.floor(Math.random() * props.emojis.length)],
      vx: (Math.random() - 0.5) * 2 * side,
      vy: 2 + Math.random() * 3
    })
  }
}

const getParticleStyle = (particle) => {
  return {
    left: `${particle.x}%`,
    top: `${particle.y}%`,
    transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
    fontSize: `${1 + Math.random() * 1.5}rem`,
    opacity: 1
  }
}

const animate = () => {
  if (!isActive.value) return

  const startTime = Date.now()
  
  const update = () => {
    const elapsed = Date.now() - startTime
    const progress = elapsed / props.duration

    if (progress >= 1) {
      isActive.value = false
      particles.value = []
      emit('complete')
      return
    }

    particles.value = particles.value.map(p => {
      const particleProgress = (elapsed - p.delay) / p.duration
      if (particleProgress < 0) return p

      const eased = 1 - Math.pow(1 - Math.min(particleProgress, 1), 2)
      const x = p.x + p.vx * eased * 50
      const y = p.y + p.vy * eased * 100 * particleProgress
      const rotation = p.rotation + p.rotationSpeed * particleProgress * 10
      const opacity = 1 - particleProgress

      return {
        ...p,
        x,
        y,
        rotation,
        opacity
      }
    })

    animationId = requestAnimationFrame(update)
  }

  update()
}

const trigger = () => {
  if (isActive.value) return
  isActive.value = true
  createParticles()
  setTimeout(animate, 50)
}

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})

defineExpose({ trigger })
</script>

<style scoped>
.confetti-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.confetti-particle {
  position: absolute;
  will-change: transform, opacity;
}
</style>
