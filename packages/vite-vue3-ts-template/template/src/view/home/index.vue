<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'
import { ElMessage } from 'element-plus'
import ChangePassword from './component/change-password.vue'
import HelloWorld from '../../components/HelloWorld.vue'

export default defineComponent({
  name: 'Home',
  components: {
    ChangePassword,
    HelloWorld
  },
  setup () {
    const userStore = useUserStore()
    const username = computed(() => userStore.$state.userInfo.username)
    const router = useRouter()

    onMounted(async () => {
      await userStore.fetchCurrentUser()
    })

    const handleLogout = () => {
      userStore.logout()
      ElMessage.success('登出成功 2秒后跳转登录页')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }

    return {
      username,
      handleLogout
    }
  }
})
</script>

<template>
  <div class="content">
    <header>
      <div class="user-info">
        <div>{{ username }}</div>
        <div>
          <ChangePassword />
          <el-button type="primary" @click="handleLogout">登出</el-button>
        </div>
      </div>
    </header>
    <section>
      <img alt="Vue logo" src="../../assets/logo.png" />
      <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />
    </section>
  </div>
</template>

<style scoped>
.content {
  width: 100vw;
  display: flex;
  flex-direction: column;
}

.user-info {
  display: flex;
  justify-self: flex-end;
  align-items: center;
  padding: 10px;
  border-bottom: 1px #ccc solid;
}

.user-info div:first-child {
  flex: 1;
}

.user-info div:last-child {
  width: 100%;
  padding-left: 5px;
}

section {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
