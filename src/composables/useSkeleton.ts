import { ref, computed, onMounted } from 'vue'

/**
 * useSkeleton - 骨架屏加载状态管理组合式函数
 *
 * 提供统一的骨架屏显示控制，支持：
 * - 初始数据加载骨架屏
 * - 刷新操作骨架屏
 * - 加载状态切换
 */
export function useSkeleton(options: {
  /** 初始加载延迟 (ms) */
  initialDelay?: number
  /** 最小骨架屏显示时间 (ms) */
  minSkeletonDuration?: number
} = {}) {
  const {
    initialDelay = 100,
    minSkeletonDuration = 500
  } = options

  // 骨架屏显示状态
  const showSkeleton = ref(true)
  const isLoading = ref(false)
  const isInitialLoad = ref(true)

  // 加载完成状态
  let loadComplete = false
  let loadStartTime = 0

  /**
   * 开始加载
   */
  const startLoading = () => {
    isLoading.value = true
    loadStartTime = Date.now()
    
    // 延迟显示骨架屏，避免闪烁
    setTimeout(() => {
      if (!loadComplete) {
        showSkeleton.value = true
      }
    }, initialDelay)
  }

  /**
   * 完成加载
   */
  const finishLoading = () => {
    loadComplete = true
    const elapsed = Date.now() - loadStartTime
    const remaining = minSkeletonDuration - elapsed
    
    if (remaining > 0) {
      // 确保骨架屏至少显示一段时间
      setTimeout(() => {
        showSkeleton.value = false
        isLoading.value = false
        isInitialLoad.value = false
      }, remaining)
    } else {
      showSkeleton.value = false
      isLoading.value = false
      isInitialLoad.value = false
    }
  }

  /**
   * 重置状态
   */
  const reset = () => {
    showSkeleton.value = true
    isLoading.value = false
    isInitialLoad.value = true
    loadComplete = false
  }

  /**
   * 刷新数据
   */
  const refresh = async <T>(loader: () => Promise<T>): Promise<T | null> => {
    startLoading()
    try {
      const result = await loader()
      finishLoading()
      return result
    } catch (error) {
      console.error('Load failed:', error)
      showSkeleton.value = false
      isLoading.value = false
      return null
    }
  }

  return {
    showSkeleton: computed(() => showSkeleton.value),
    isLoading: computed(() => isLoading.value),
    isInitialLoad: computed(() => isInitialLoad.value),
    startLoading,
    finishLoading,
    reset,
    refresh
  }
}

/**
 * useDataLoader - 通用数据加载器
 *
 * 包装异步数据加载，自动处理骨架屏显示
 */
export function useDataLoader<T>() {
  const { showSkeleton, startLoading, finishLoading, refresh } = useSkeleton()
  
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)

  /**
   * 加载数据
   */
  const load = async (loader: () => Promise<T>): Promise<T | null> => {
    startLoading()
    error.value = null
    
    try {
      const result = await loader()
      data.value = result
      finishLoading()
      return result
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      finishLoading()
      return null
    }
  }

  /**
   * 重新加载
   */
  const reload = async (loader: () => Promise<T>): Promise<T | null> => {
    return await load(loader)
  }

  return {
    data,
    error,
    showSkeleton,
    load,
    reload
  }
}
