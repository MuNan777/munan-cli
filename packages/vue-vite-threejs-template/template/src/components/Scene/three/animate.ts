import { Clock } from "three"
import camera from "./camera"
import controls from './controls'
import renderer from "./renderer"
import scene from "./scene"

export interface AnimateFnOption {
  elapsedTime: number
  delta: number
  index: number
  arrFn: animateFn[]
}

export type animateFn = (options: AnimateFnOption) => void

const clock = new Clock()

export const arrFn: animateFn[] = []

function animate() {
  // 时间
  const delta = clock.getDelta()
  const elapsedTime = clock.getElapsedTime()
  // 执行回调
  arrFn.forEach((fn, index) => {
    fn({
      elapsedTime,
      index,
      delta,
      arrFn
    })
  })
  // 帧回调函数
  requestAnimationFrame(animate)
  // 控制器更新
  controls.update()
  // 重新渲染
  renderer.render(scene, camera)
}

export default animate
