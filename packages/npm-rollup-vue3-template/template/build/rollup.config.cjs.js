import baseConfig, { file } from './rollup.config'

export default {
  ...baseConfig,
  output: {
    name: 'MyComponents', // 组件库全局对象
    format: 'cjs', // cjs 模式
    file: file('cjs'),
    exports: 'auto'
  }
}
