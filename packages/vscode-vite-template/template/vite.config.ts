import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  mode: 'development',
  build: {
    outDir: path.resolve(__dirname, 'out/webview'),
    rollupOptions: {
      input: {
        'index': './src/webview/index.ts'
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'index.css';
          return assetInfo.name!;
        },
      },
      external: ['vscode'],
    },
  }
});
