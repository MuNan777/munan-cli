<script lang="ts">
import { defineComponent, ref } from 'vue';
import useMain from './hooks/useMain'
import { debounce } from '../common';
export default defineComponent({
  name: 'WebView',
  setup () {
    // 使用 sessionStorage 保存状态
    // 这里暂时先用着，是需要考虑文件切换的
    const data = sessionStorage.getItem('input');
    const input = ref(data || '');
    const show = ref(true)

    const { send } = useMain();

    window.addEventListener('message', event => {
      const message = event.data;
      switch (message.type) {
        case 'update':
          input.value = message.value;
          sessionStorage.setItem('input', message.value);
          break;
        case 'show-text':
          show.value = message.value;
          break;
        case 'hidden-text':
          show.value = message.value;
          break;
      }
    });

    const handleChange = debounce(() => {
      send({
        type: 'update-from-page',
        value: input.value,
      });
    }, 500)

    return {
      input,
      show,
      handleChange
    };
  },
});
</script>
<template>
  <textarea v-model="input" class="textarea" @change="handleChange" />
  <h2 v-if="show">Show Text</h2>
</template>
<style lang="scss">
body {
  padding: 0 !important;
}

.textarea {
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  height: 50vh;
  margin: 10px;
}
</style>