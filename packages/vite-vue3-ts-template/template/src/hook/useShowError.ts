import { computed, watch } from 'vue'
import { useRequestStore } from '../store/request'
import { ElMessage } from 'element-plus'
/**
 * 全局错误拦截监听
 * @description: useShowError
 * @param {type} {}
 * @returns {type} {}
 */
const useShowError = (): void => {
  // 获取全局状态
  const store = useRequestStore()
  // 获取错误状态
  const error = computed(() => store.$state.error)
  // 监听错误状态
  watch(() => error.value, (errorValue) => {
    // 显示错误
    if (errorValue.status) {
      ElMessage({
        showClose: true,
        message: error.value.message || '未知错误',
        type: 'error',
        duration: 5000,
      })
    }
  })
}

export default useShowError