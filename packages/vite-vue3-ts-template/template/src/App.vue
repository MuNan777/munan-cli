
<script lang="ts">
import { defineComponent } from 'vue'
import showError from './hook/useShowError'

export default defineComponent({
  setup () {
    showError()
  },
})
</script>

<template>
  <!-- <router-link to="/view/camera">Go to camera</router-link>
  <router-link to="/view/table">Go to table</router-link>-->
  <!-- 路由出口 -->
  <!-- 路由匹配到的组件将渲染在这里 -->
  <router-view></router-view>
</template>

