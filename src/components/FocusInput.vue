<template>
  <div class="focus-input-wrapper" :class="{ 'has-error': error, 'is-focused': isFocused, 'has-icon': $slots.prefix }">
    <!-- Prefix icon slot -->
    <slot name="prefix">
      <span v-if="prefixIcon" class="input-prefix">{{ prefixIcon }}</span>
    </slot>

    <!-- Input element -->
    <div class="input-container">
      <input
        ref="inputRef"
        v-model="localValue"
        :type="inputType"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :minlength="minlength"
        :pattern="pattern"
        :required="required"
        class="focus-input"
        :class="[sizeClass]"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @change="handleChange"
        @keyup="handleKeyup"
        v-bind="$attrs"
      />

      <!-- Floating label -->
      <label
        v-if="label"
        class="floating-label"
        :class="{ 'is-active': isFocused || localValue }"
      >
        {{ label }}
      </label>

      <!-- Focus underline animation -->
      <span class="focus-underline">
        <span class="underline-progress" :style="{ width: isFocused ? '100%' : '0%' }"></span>
      </span>
    </div>

    <!-- Suffix icon slot -->
    <slot name="suffix">
      <!-- Show clear button when there's value -->
      <button
        v-if="clearable && localValue && !disabled"
        type="button"
        class="input-clear-btn"
        @click="clearValue"
      >
        ×
      </button>

      <!-- Show error/success icon -->
      <span v-else-if="showStatusIcon" class="input-status-icon" :class="statusClass">
        <svg v-if="error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <svg v-else-if="isDirty && !error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="16 10 11 15 8 12" />
        </svg>
      </span>
    </slot>

    <!-- Character counter -->
    <span v-if="showCharCounter && maxlength" class="char-counter" :class="{ 'near-limit': charCountNearLimit }">
      {{ charCount }}/{{ maxlength }}
    </span>
  </div>

  <!-- Error message -->
  <Transition name="slide-up">
    <span v-if="error && errorMessage" class="error-message">{{ errorMessage }}</span>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface Props {
  modelValue?: string | number
  type?: string
  placeholder?: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  required?: boolean
  maxlength?: number
  minlength?: number
  pattern?: string
  error?: boolean
  errorMessage?: string
  prefixIcon?: string
  showStatusIcon?: boolean
  showCharCounter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  label: '',
  size: 'md',
  disabled: false,
  readonly: false,
  clearable: false,
  required: false,
  maxlength: undefined,
  minlength: undefined,
  pattern: '',
  error: false,
  errorMessage: '',
  prefixIcon: '',
  showStatusIcon: true,
  showCharCounter: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  input: [value: string]
  change: [value: string | number]
  keyup: [event: KeyboardEvent]
}>()

// Local value state
const localValue = ref(props.modelValue)
const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const isDirty = ref(false)

// Input type (handle password toggle internally)
const inputType = ref(props.type)

// Size class mapping
const sizeClass = computed(() => {
  return {
    sm: 'input-sm',
    md: 'input-md',
    lg: 'input-lg'
  }[props.size]
})

// Character count
const charCount = computed(() => String(localValue.value).length)
const charCountNearLimit = computed(() => {
  if (!props.maxlength) return false
  return charCount.value >= props.maxlength * 0.9
})

// Status icon class
const statusClass = computed(() => {
  if (props.error) return 'status-error'
  if (isDirty.value && !props.error) return 'status-success'
  return ''
})

// Watch for external model changes
watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal
})

// Handle focus
const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  isDirty.value = true

  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(5)
  }

  emit('focus', event)
}

// Handle blur
const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

// Handle input
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  localValue.value = target.value
  emit('update:modelValue', localValue.value)
  emit('input', String(localValue.value))
}

// Handle change
const handleChange = () => {
  emit('change', localValue.value)
}

// Handle keyup
const handleKeyup = (event: KeyboardEvent) => {
  emit('keyup', event)
}

// Clear value
const clearValue = () => {
  localValue.value = ''
  emit('update:modelValue', '')
  emit('input', '')
  inputRef.value?.focus()
}

// Focus method (for external use)
const focus = () => {
  inputRef.value?.focus()
}

// Blur method (for external use)
const blur = () => {
  inputRef.value?.blur()
}

// Expose methods
defineExpose({
  focus,
  blur,
  inputRef
})

onMounted(() => {
  // Initialize dirty state if value exists
  if (localValue.value) {
    isDirty.value = true
  }
})
</script>

<style scoped>
.focus-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Input container */
.input-container {
  position: relative;
  flex: 1;
}

/* Input element */
.focus-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.focus-input::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.focus-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.3);
}

.focus-input:read-only {
  cursor: default;
}

/* Size variants */
.input-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.75rem;
}

.input-md {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border-radius: 1rem;
}

.input-lg {
  padding: 1rem 1.25rem;
  font-size: 1.125rem;
  border-radius: 1.25rem;
}

/* Focus state */
.focus-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.7);
  box-shadow:
    0 0 0 4px rgba(249, 115, 22, 0.1),
    0 4px 15px rgba(249, 115, 22, 0.2);
  transform: translateY(-1px);
}

/* Floating label */
.floating-label {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 1rem;
  pointer-events: none;
  transition: all var(--transition-fast);
  background: transparent;
  padding: 0 0.25rem;
}

.floating-label.is-active {
  top: 0;
  left: 0.75rem;
  font-size: 0.75rem;
  color: var(--color-primary);
  transform: translateY(-50%);
  background: linear-gradient(var(--glass-bg), var(--glass-bg)) padding-box;
  background-size: 100% 100%;
}

/* Focus underline animation */
.focus-underline {
  position: absolute;
  bottom: 0.5rem;
  left: 1rem;
  right: 1rem;
  height: 2px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1px;
  overflow: hidden;
}

.underline-progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-pink));
  transition: width 0.3s ease;
}

/* Prefix/Suffix icons */
.input-prefix,
.input-suffix {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 1.25rem;
}

.input-prefix {
  margin-right: 0.25rem;
}

.input-suffix {
  margin-left: 0.25rem;
}

/* Clear button */
.input-clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: var(--text-muted);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.input-clear-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: var(--color-error);
  transform: scale(1.1);
}

/* Status icon */
.input-status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
}

.input-status-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.status-error {
  color: var(--color-error);
}

.status-success {
  color: var(--color-success);
}

/* Character counter */
.char-counter {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.char-counter.near-limit {
  color: var(--color-warning);
}

/* Error state */
.has-error .focus-input {
  border-color: var(--color-error);
  background: rgba(239, 68, 68, 0.05);
}

.has-error .focus-input:focus {
  border-color: var(--color-error);
  box-shadow:
    0 0 0 4px rgba(239, 68, 68, 0.1),
    0 4px 15px rgba(239, 68, 68, 0.2);
}

.has-error .floating-label.is-active {
  color: var(--color-error);
}

.has-error .underline-progress {
  background: linear-gradient(90deg, var(--color-error), #f87171);
}

/* Error message */
.error-message {
  display: block;
  font-size: 0.75rem;
  color: var(--color-error);
  margin-top: 0.25rem;
  margin-left: 0.5rem;
}

/* Error message slide animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Dark mode */
.dark .focus-input {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
}

.dark .focus-input:focus {
  background: rgba(255, 255, 255, 0.12);
}

.dark .focus-input::placeholder {
  color: var(--text-muted);
}

.dark .input-clear-btn {
  background: rgba(255, 255, 255, 0.15);
}

.dark .input-clear-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.dark .focus-underline {
  background: rgba(255, 255, 255, 0.1);
}

.dark .has-error .focus-input {
  background: rgba(239, 68, 68, 0.1);
}
</style>
