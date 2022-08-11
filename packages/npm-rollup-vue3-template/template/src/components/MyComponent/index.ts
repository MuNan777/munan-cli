import { App } from 'vue'
import MyComponent from './MyComponent.vue'

MyComponent.install = (app: App) => { // 组件本身添加一个 install 方法, 方便独立导出
  app.component(MyComponent.name, MyComponent)
}

export default MyComponent
