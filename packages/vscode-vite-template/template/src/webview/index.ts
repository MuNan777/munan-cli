import { createApp, h } from "vue";
import WebView from './WebView.vue';

createApp({
  setup () {
    return {};
  },
  render () {
    return h(WebView);
  }
}).mount('#app');