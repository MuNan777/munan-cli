<template>
  <div class="scene" ref="refScene"></div>
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted, PropType, reactive, ref } from 'vue'
import { init, remove } from './three/init'
import BaseMesh from './three/mesh/baseMesh'

export default defineComponent({
  props: {
    getMeshes: {
      type: Function as PropType<(meshes: BaseMesh[]) => void>
    }
  },
  setup(props) {
    const refScene = ref<null | HTMLElement>(null)

    let meshes = reactive<BaseMesh[]>([])
    onMounted(() => {
      meshes = init(refScene) // 注意需要在组件挂载完成后再进行初始化
      if (props.getMeshes) {
        props.getMeshes(meshes)
      }
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
