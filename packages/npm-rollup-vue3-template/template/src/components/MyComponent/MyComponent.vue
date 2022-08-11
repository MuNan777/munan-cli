<template>
  <div class="my-component-test">My Component Test</div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'my-component',
  setup () {
    return {}
  }
})
</script>
<style scoped>
.my-component-test {
  color: red;
}
</style>
