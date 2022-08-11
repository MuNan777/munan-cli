import { App } from 'vue'
import MyComponent from './components/MyComponent'

const components = [MyComponent]
// 定义 install 函数类型
declare type PluginInstallFunction = (app: App, ...options: unknown[]) => unknown

const install: PluginInstallFunction = (app: App) => { // 循环导入组件
  components.forEach(component => {
    app.component(component.name, component)
  })
}

// 导出
export default {
  MyComponent,
  install
}
