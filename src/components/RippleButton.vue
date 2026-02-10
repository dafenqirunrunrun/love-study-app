<template>
  <component
    :is="tag"
    class="ripple-button"
    :class="[colorClass, sizeClass, { 'is-loading': loading, 'is-disabled': disabled }]"
    :disabled="disabled || loading"
    @click="handleClick"
    @mousedown="createRipple"
    v-bind="$attrs"
  >
    <!-- Ripple effects container -->
    <span class="ripple-container">
      <span
        v-for="ripple in ripples"
        :key="ripple.id"
        class="ripple"
        :style="{
          left: ripple.x + 'px',
          top: ripple.y + 'px',
          width: ripple.size + 'px',
          height: ripple.size + 'px',
          '--ripple-color': rippleColor
        }"
      ></span>
    </span>

    <!-- Button content -->
    <span class="button-content">
      <!-- Loading spinner -->
      <svg v-if="loading" class="loading-spinner" viewBox="0 0 24 24">
        <circle
          class="spinner-path"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
        ></circle>
      </svg>

      <!-- Icon slot -->
      <slot name="icon"></slot>

      <!-- Default text slot -->
      <slot>{{ text }}</slot>
    </span>
  </component>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'

interface Props {
  text?: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'filled' | 'outline' | 'ghost'
  disabled?: boolean
  loading?: boolean
  tag?: string
  rippleColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  color: 'primary',
  size: 'md',
  variant: 'filled',
  disabled: false,
  loading: false,
  tag: 'button',
  rippleColor: 'rgba(255, 255, 255, 0.5)'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// Ripple effects state
interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

const ripples = ref<Ripple[]>([])
let rippleId = 0

// Color classes mapping
const colorClass = computed(() => {
  const colors = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    warning: 'btn-warning',
    error: 'btn-error',
    info: 'btn-info'
  }
  return colors[props.color]
})

// Size classes mapping
const sizeClass = computed(() => {
  const sizes = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  }
  return sizes[props.size]
})

// Create ripple effect on click
const createRipple = (event: MouseEvent) => {
  if (props.disabled || props.loading) return

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  
  // Calculate ripple size (use the larger dimension)
  const size = Math.max(rect.width, rect.height)
  
  // Calculate ripple position
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2

  // Add new ripple
  const id = ++rippleId
  ripples.value.push({ id, x, y, size })

  // Remove ripple after animation completes
  setTimeout(() => {
    ripples.value = ripples.value.filter(r => r.id !== id)
  }, 600)

  // Haptic feedback (if supported)
  if (navigator.vibrate) {
    navigator.vibrate(10)
  }
}

// Handle click event
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

// Cleanup ripples on unmount
onUnmounted(() => {
  ripples.value = []
})
</script>

<style scoped>
.ripple-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  overflow: hidden;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.ripple-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.4);
}

.ripple-button:active:not(:disabled) {
  transform: scale(0.98);
}

/* Size variants */
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-md {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Color variants */
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(249, 115, 22, 0.5);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.6);
  color: var(--color-primary);
  border: 2px solid rgba(249, 115, 22, 0.3);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(249, 115, 22, 0.1);
  border-color: var(--color-primary);
}

.btn-success {
  background: linear-gradient(135deg, #22c55e, #10b981);
  color: white;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.btn-error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.btn-info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

/* Outline variant */
.ripple-button[data-variant="outline"] {
  background: transparent;
  border: 2px solid currentColor;
}

.ripple-button[data-variant="outline"]:hover:not(:disabled) {
  background: rgba(249, 115, 22, 0.1);
}

/* Ghost variant */
.ripple-button[data-variant="ghost"] {
  background: transparent;
  color: var(--color-primary);
}

.ripple-button[data-variant="ghost"]:hover:not(:disabled) {
  background: rgba(249, 115, 22, 0.1);
}

/* Disabled state */
.ripple-button:disabled,
.ripple-button.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Ripple container */
.ripple-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

/* Individual ripple */
.ripple {
  position: absolute;
  border-radius: 50%;
  background: var(--ripple-color, rgba(255, 255, 255, 0.5));
  transform: scale(0);
  animation: rippleAnimation 0.6s ease-out forwards;
  pointer-events: none;
}

@keyframes rippleAnimation {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

/* Button content */
.button-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Loading spinner */
.loading-spinner {
  width: 1.25em;
  height: 1.25em;
  animation: spin 1s linear infinite;
}

.spinner-path {
  stroke-dasharray: 60;
  stroke-dashoffset: 45;
  stroke-linecap: round;
  opacity: 0.7;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Dark mode */
.dark .ripple-button.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(249, 115, 22, 0.4);
}

.dark .ripple-button.btn-secondary:hover:not(:disabled) {
  background: rgba(249, 115, 22, 0.15);
}
</style>
