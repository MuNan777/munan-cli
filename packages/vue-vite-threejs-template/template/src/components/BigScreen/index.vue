<template>
  <div id="bigScreen"></div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    return {}
  },
})
</script>


<style scoped>
#bigScreen {
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 999;
  left: 0;
  top: 0;
  pointer-events: none; /* 使用 pointer-events 让鼠标穿透大屏面板 */
  display: flex;
  flex-direction: column;
}
</style>