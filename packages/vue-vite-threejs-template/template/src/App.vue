<script lang="ts">
import { defineComponent, ref } from "vue"
import Scene from './components/Scene/index.vue'
import BaseMesh from "./components/Scene/three/mesh/baseMesh"
export default defineComponent({
  components: {
    Scene
  },
  setup() {
    const meshRef = ref<null | BaseMesh>(null)
    const getMeshes = (meshes: BaseMesh[]) => {
      meshRef.value = meshes[0]
      console.log(meshRef.value)
    }
    return {
      getMeshes
    }
  }
})
</script>

<template>
  <Scene :getMeshes="getMeshes"></Scene>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
}
</style>
