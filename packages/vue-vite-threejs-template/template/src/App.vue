<script lang="ts">
import { defineComponent } from "vue"
import Scene from './components/Scene/index.vue'
export default defineComponent({
  components: {
    Scene
  },
  setup() {
    return {}
  }
})
</script>

<template>
  <Scene></Scene>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
}
</style>
