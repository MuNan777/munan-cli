import baseConfig, { file } from './rollup.config'

export default {
  ...baseConfig,
  output: {
    name: 'MyComponents', // 组件库全局对象
    format: 'umd', // cjs 模式
    file: file('js'),
    globals: {
      vue: 'Vue' // vue 全局对象名称，若有 lodash 则应为 _
    },
    exports: 'named'
  }
}
