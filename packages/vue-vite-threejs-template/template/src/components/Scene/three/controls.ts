import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import camera from './camera'
import renderer from './renderer'

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)

// 设置阻尼
controls.enableDamping = true

export default controls