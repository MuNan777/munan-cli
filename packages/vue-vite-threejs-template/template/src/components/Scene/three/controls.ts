import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls'
import eventHub from '../../../utils/eventHub'
import cameraModule from './camera'
import renderer from './renderer'

export type ControlsName = 'Orbit' | 'Fly' | 'FirstPerson'

class ControlsModule {
  controls: OrbitControls | FlyControls | FirstPersonControls

  constructor() {
    this.controls = this.setOrbitControls()
    eventHub.on("toggleControls", (name) => {
      const fn = name as ControlsName
      this[`set${fn}Controls`]()
    })
  }
  // 轨道控制器
  setOrbitControls() {
    this.controls = new OrbitControls(cameraModule.activeCamera, renderer.domElement)
    // 设置阻尼
    this.controls.enableDamping = true
    // 设置自动旋转
    // controls.autoRotate = true;
    // 最大角度
    this.controls.maxPolarAngle = Math.PI / 2;
    // 最小角度
    this.controls.minPolarAngle = 0
    return this.controls
  }
  // 自由视角
  setFlyControls() {
    this.controls = new FlyControls(cameraModule.activeCamera, renderer.domElement)
    // 移动速率
    this.controls.movementSpeed = 100
    // 旋转角度
    this.controls.rollSpeed = Math.PI / 60
  }
  // 第一人称视角
  setFirstPersonControls() {
    this.controls = new FirstPersonControls(cameraModule.activeCamera, renderer.domElement)
    // 移动速率
    this.controls.movementSpeed = 100
    // 环视速度
    this.controls.lookSpeed = 1
  }
}

export default new ControlsModule()