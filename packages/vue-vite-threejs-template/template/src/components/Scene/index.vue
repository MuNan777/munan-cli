<template>
  <div class="scene" ref="refScene"></div>
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { init, remove } from './three/init'

export default defineComponent({
  setup () {
    const refScene = ref<null | HTMLElement>(null)
    onMounted(() => {
      init(refScene) // 注意需要在组件挂载完成后再进行初始化
    })

    onUnmounted(() => {
      remove()
    })

    return {
      refScene
    }
  },
})
</script>
<style>
.scene {
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 100;
  left: 0;
  top: 0;
}
</style>
