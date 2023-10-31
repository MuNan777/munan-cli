import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import _ from 'lodash'
import { IImportModule } from '../types/respType'
import axios from 'axios'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'


// 同步导入 route 配置 
const routes = _.values(import.meta.glob('../view/*/route.ts', { eager: true })).map(item => {
  const module = item as IImportModule<RouteRecordRaw>
  return module.default
})

const router = createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes, // `routes: routes` 的缩写
})

// 路由守卫
router.beforeEach(async (to) => {
  // 获取登录状态
  const userStore = useUserStore()
  const { token, isLogin } = userStore
  // 获取路由参数
  const { redirectAlreadyLogin, requireLogin, title } = to.meta
  // 设置 title
  if (title) {
    document.title = title as string
  }
  // 判断是否需要登录
  if (!isLogin) {
    // 如果 token 存在
    if (token) {
      // 设置 token
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
      try {
        // 获取一下用户信息
        await userStore.fetchCurrentUser()
        // 判断是否需要重定向到首页
        if (redirectAlreadyLogin) {
          return '/home'
        }
      } catch (e) {
        // 登录过期
        ElMessage.error('登录错误/已过期，请重新登录')
        // 清除登录信息
        userStore.logout()
        // 重定向到登录页
        return '/login'
      }
    } else {
      // 重定向到登录页
      if (requireLogin) {
        return '/login'
      }
    }
  } else {
    // 如果已登录，需要重定向到首页
    if (redirectAlreadyLogin) {
      return '/home'
    }
  }
})

export default router