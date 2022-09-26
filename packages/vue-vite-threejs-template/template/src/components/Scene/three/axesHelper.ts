import { AxesHelper } from "three"
import scene from "./scene"

export function addAxesHelper() {
  // 添加坐标辅助器
  const axesHelper = new AxesHelper(5)
  scene.add(axesHelper)
}
