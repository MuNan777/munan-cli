import { name } from '../package.json'
import typescript from 'rollup-plugin-typescript2'
import vuePlugin from 'rollup-plugin-vue'
import css from 'rollup-plugin-css-only'
// 如果依赖模块中存在 es 模块，需要使用 @rollup/plugin-node-resolve 插件进行转换
import nodeResolve from '@rollup/plugin-node-resolve'
import path from 'path'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const file = (type) => `dist/components-lib.${type}`

export { // 这里将 file 方法 和 name 导出
  file,
  name
}

const overrides = {
  compilerOptions: { declaration: true }, // 是否创建 typescript 声明文件
  exclude: [ // 排除项
    'node_modules',
    'src/App.vue',
    'src/main.ts'
  ]
}

export default {
  input: path.resolve(__dirname, '..', 'src', 'index.ts'),
  output: {
    name,
    file: file('esm'),
    format: 'es' // 编译模式
  },
  plugins: [nodeResolve(), typescript({ tsconfigOverride: overrides }), vuePlugin(), css({ output: 'bundle.css' })],
  external: ['vue'] // 依赖模块
}
