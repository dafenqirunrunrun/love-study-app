// useSwipe.js - 触摸手势管理
import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Create a swipe gesture handler for an element
 * @param {Object} options - Configuration options
 * @param {number} [options.threshold=50] - Minimum distance for swipe detection
 * @param {number} [options.maxTime=500] - Maximum time for swipe (ms)
 * @param {Function} [options.onSwipeLeft] - Swipe left callback
 * @param {Function} [options.onSwipeRight] - Swipe right callback
 * @param {Function} [options.onSwipeUp] - Swipe up callback
 * @param {Function} [options.onSwipeDown] - Swipe down callback
 * @param {Function} [options.onTap] - Tap callback
 * @returns {Object} - Ref to element and control functions
 */
export function useSwipe(options = {}) {
  const element = ref(null)
  const isSwiping = ref(false)
  const swipeDirection = ref(null)
  const swipeProgress = ref(0)
  const touchStartX = ref(0)
  const touchStartY = ref(0)
  const touchStartTime = ref(0)
  
  const config = {
    threshold: options.threshold || 50,
    maxTime: options.maxTime || 500,
    ...options
  }

  const handleTouchStart = (e) => {
    if (!element.value) return
    
    // Ignore multi-touch
    if (e.touches.length > 1) return

    const touch = e.touches[0]
    touchStartX.value = touch.clientX
    touchStartY.value = touch.clientY
    touchStartTime.value = Date.now()
    isSwiping.value = false
    swipeDirection.value = null
    swipeProgress.value = 0
  }

  const handleTouchMove = (e) => {
    if (!element.value || !touchStartX.value) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartX.value
    const deltaY = touch.clientY - touchStartY.value
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    
    // Determine direction if threshold exceeded
    if (absX > config.threshold || absY > config.threshold) {
      isSwiping.value = true
      
      if (absX > absY) {
        // Horizontal swipe
        swipeDirection.value = deltaX > 0 ? 'right' : 'left'
        swipeProgress.value = Math.min(1, absX / 200) // Max 200px for full animation
      } else {
        // Vertical swipe
        swipeDirection.value = deltaY > 0 ? 'down' : 'up'
        swipeProgress.value = Math.min(1, absY / 200)
      }
    }
  }

  const handleTouchEnd = (e) => {
    if (!element.value) return
    
    const touchDuration = Date.now() - touchStartTime.value
    
    // Check if it was a tap (short duration, small movement)
    const deltaX = touchStartX.value - (e.changedTouches[0]?.clientX || touchStartX.value)
    const deltaY = touchStartY.value - (e.changedTouches[0]?.clientY || touchStartY.value)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    if (distance < 10 && touchDuration < 300) {
      // It's a tap
      if (config.onTap) {
        config.onTap()
      }
    } else if (isSwiping.value && touchDuration < config.maxTime) {
      // It's a swipe
      switch (swipeDirection.value) {
        case 'left':
          if (config.onSwipeLeft) config.onSwipeLeft()
          break
        case 'right':
          if (config.onSwipeRight) config.onSwipeRight()
          break
        case 'up':
          if (config.onSwipeUp) config.onSwipeUp()
          break
        case 'down':
          if (config.onSwipeDown) config.onSwipeDown()
          break
      }
    }
    
    // Reset state
    setTimeout(() => {
      isSwiping.value = false
      swipeDirection.value = null
      swipeProgress.value = 0
    }, 100)
  }

  const bind = (el) => {
    element.value = el
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
  }

  const unbind = () => {
    if (element.value) {
      element.value.removeEventListener('touchstart', handleTouchStart)
      element.value.removeEventListener('touchmove', handleTouchMove)
      element.value.removeEventListener('touchend', handleTouchEnd)
    }
  }

  onMounted(() => {
    // Will be bound manually via bind() function
  })

  onUnmounted(() => {
    unbind()
  })

  return {
    element,
    isSwiping,
    swipeDirection,
    swipeProgress,
    bind,
    unbind
  }
}

/**
 * Composable for swipe actions on tasks
 * @param {Object} options - Task options
 * @param {Function} [options.onComplete] - Mark task complete callback
 * @param {Function} [options.onDelete] - Delete task callback
 * @returns {Object} - Composable result
 */
export function useTaskSwipe(options = {}) {
  const { onComplete, onDelete } = options
  
  const swipeConfig = {
    threshold: 60,
    maxTime: 400,
    onSwipeLeft: () => {
      if (onDelete) onDelete()
    },
    onSwipeRight: () => {
      if (onComplete) onComplete()
    },
    onTap: () => {
      // Default tap behavior - toggle
    }
  }

  const {
    isSwiping,
    swipeDirection,
    swipeProgress,
    bind
  } = useSwipe(swipeConfig)

  // Dynamic classes based on swipe
  const swipeClasses = (item) => {
    if (!isSwiping.value) return ''
    
    if (swipeDirection.value === 'left') {
      const translate = swipeProgress.value * 80
      return `transform transition-transform duration-200`
    }
    if (swipeDirection.value === 'right') {
      return `transform transition-transform duration-200`
    }
    return ''
  }

  // Get background color based on swipe direction
  const swipeBackground = () => {
    if (!isSwiping.value) return ''
    
    if (swipeDirection.value === 'left') {
      return 'bg-red-500'
    }
    if (swipeDirection.value === 'right') {
      return 'bg-green-500'
    }
    return ''
  }

  return {
    isSwiping,
    swipeDirection,
    swipeProgress,
    swipeClasses,
    swipeBackground,
    bindSwipe: bind
  }
}

/**
 * Composable for habit card swipe
 * @param {Object} options - Options
 * @param {Function} [options.onToggle] - Toggle habit callback
 * @returns {Object} - Composable result
 */
export function useHabitSwipe(options = {}) {
  const { onToggle } = options

  const {
    isSwiping,
    swipeDirection,
    swipeProgress,
    bind
  } = useSwipe({
    threshold: 80,
    maxTime: 500,
    onSwipeRight: () => {
      if (onToggle) onToggle()
    }
  })

  return {
    isSwiping,
    swipeDirection,
    swipeProgress,
    bindSwipe: bind
  }
}

/**
 * Detect if device supports touch
 */
export function useTouchSupport() {
  const isTouchDevice = ref(false)

  onMounted(() => {
    isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })

  return {
    isTouchDevice
  }
}

export default {
  useSwipe,
  useTaskSwipe,
  useHabitSwipe,
  useTouchSupport
}
