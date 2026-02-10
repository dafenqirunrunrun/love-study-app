import { ref, computed, watch } from 'vue'

/**
 * useLoadingState - 通用加载状态管理组合式函数
 *
 * 提供统一的加载状态管理，支持：
 * - 异步操作加载状态
 * - 骨架屏显示控制
 * - 防抖/节流控制
 * - 错误状态管理
 */
export function useLoadingState<T = unknown>(
  options: {
    /** 初始加载状态 */
    initialLoading?: boolean
    /** 初始错误消息 */
    initialError?: string
    /** 自动加载 */
    autoLoad?: boolean
    /** 防抖延迟 (ms) */
    debounce?: number
    /** 节流延迟 (ms) */
    throttle?: number
  } = {}
) {
  const {
    initialLoading = false,
    initialError = '',
    autoLoad = false,
    debounce = 0,
    throttle = 0
  } = options

  // 状态
  const isLoading = ref(initialLoading)
  const error = ref<string | null>(initialError)
  const data = ref<T | null>(null)
  const isInitialLoad = ref(true)

  // 骨架屏显示状态
  const showSkeleton = ref(initialLoading)

  // 防抖/节流定时器
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let throttleTimer: ReturnType<typeof setTimeout> | null = null

  // 计算属性
  const hasError = computed(() => error.value !== null && error.value !== '')
  const isEmpty = computed(() => !isLoading.value && !hasError.value && data.value === null)
  const isSuccess = computed(() => !isLoading.value && !hasError.value && data.value !== null)

  // 内部加载执行器
  let loadExecutor: (() => Promise<T>) | null = null

  /**
   * 设置加载函数
   * @param executor 异步加载函数
   */
  const setLoader = (executor: () => Promise<T>) => {
    loadExecutor = executor
  }

  /**
   * 核心加载函数
   */
  const load = async (force = false): Promise<T | null> => {
    if (!loadExecutor) {
      console.warn('useLoadingState: No loader function set')
      return null
    }

    // 如果正在加载且不是强制刷新，则跳过
    if (isLoading.value && !force) {
      return null
    }

    // 清除之前的防抖/节流定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    if (throttleTimer) {
      clearTimeout(throttleTimer)
      throttleTimer = null
    }

    // 应用防抖
    if (debounce > 0 && !force) {
      return new Promise((resolve) => {
        debounceTimer = setTimeout(async () => {
          const result = await executeLoad()
          resolve(result)
        }, debounce)
      }) as Promise<T | null>
    }

    // 应用节流 (跳过首次加载)
    if (throttle > 0 && !force && !isInitialLoad.value) {
      return new Promise((resolve) => {
        throttleTimer = setTimeout(async () => {
          const result = await executeLoad()
          resolve(result)
        }, throttle)
      }) as Promise<T | null>
    }

    return await executeLoad()
  }

  /**
   * 执行实际加载
   */
  const executeLoad = async (): Promise<T | null> => {
    isLoading.value = true
    error.value = null
    showSkeleton.value = isInitialLoad.value

    try {
      const result = await loadExecutor()
      data.value = result
      isInitialLoad.value = false
      showSkeleton.value = false
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      showSkeleton.value = false
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 手动触发加载 (带防抖)
   */
  const trigger = (delay = 0) => {
    if (delay > 0) {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => load(true), delay)
    } else {
      load(true)
    }
  }

  /**
   * 重置状态
   */
  const reset = () => {
    isLoading.value = initialLoading
    error.value = initialError
    data.value = null
    isInitialLoad.value = true
    showSkeleton.value = initialLoading

    if (debounceTimer) clearTimeout(debounceTimer)
    if (throttleTimer) clearTimeout(throttleTimer)
  }

  /**
   * 清除错误
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 设置数据 (用于外部数据更新)
   */
  const setData = (newData: T) => {
    data.value = newData
    isInitialLoad.value = false
    showSkeleton.value = false
  }

  // 清理函数
  const cleanup = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    if (throttleTimer) clearTimeout(throttleTimer)
  }

  // 自动加载
  if (autoLoad) {
    load()
  }

  return {
    // 状态
    isLoading,
    error,
    data,
    isInitialLoad,
    showSkeleton,

    // 计算属性
    hasError,
    isEmpty,
    isSuccess,

    // 方法
    load,
    trigger,
    reset,
    clearError,
    setData,
    setLoader,

    // 清理
    cleanup
  }
}

/**
 * useAsync - 简化的异步操作钩子
 *
 * 用于包装单个异步操作，提供加载和错误状态
 */
export function useAsync<T, Args extends unknown[]>(
  asyncFn: (...args: Args) => Promise<T>
) {
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<T | null>(null)

  const execute = async (...args: Args): Promise<T | null> => {
    isLoading.value = true
    error.value = null

    try {
      const result = await asyncFn(...args)
      data.value = result
      return result
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      return null
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    isLoading.value = false
    error.value = null
    data.value = null
  }

  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    data: computed(() => data.value),
    hasError: computed(() => error.value !== null),
    execute,
    reset
  }
}

/**
 * useDebounce - 防抖操作钩子
 */
export function useDebounce<T>(value: Ref<T>, delay = 300) {
  const debouncedValue = ref(value.value) as Ref<T>

  if (typeof window !== 'undefined') {
    let timer: ReturnType<typeof setTimeout> | null = null

    watch(value, (newVal) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        debouncedValue.value = newVal
      }, delay)
    })
  }

  return debouncedValue
}

/**
 * useThrottle - 节流操作钩子
 */
export function useThrottle<T>(value: Ref<T>, delay = 300) {
  const throttledValue = ref(value.value) as Ref<T>
  let lastUpdated = 0

  if (typeof window !== 'undefined') {
    watch(value, (newVal) => {
      const now = Date.now()
      if (now - lastUpdated >= delay) {
        throttledValue.value = newVal
        lastUpdated = now
      }
    })
  }

  return throttledValue
}

// 类型导出
import type { Ref } from 'vue'
