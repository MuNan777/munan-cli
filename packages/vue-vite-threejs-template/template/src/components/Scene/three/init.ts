
import { Ref } from 'vue'
import animate from './animate'
import cameraModule from './camera'
import renderer from './renderer'
import { addAxesHelper } from './axesHelper'
import { createMesh } from './createMesh'
import BaseMesh from './mesh/baseMesh'

function eventFn(this: { body: Ref<HTMLElement | null> }) {
  if (this.body.value) {
    const { clientWidth, clientHeight } = this.body.value
    // 更新摄像头
    cameraModule.activeCamera.aspect = clientWidth / clientHeight
    // 更新渲染器
    renderer.setSize(clientWidth, clientHeight)
  }
  // 更新摄像机投影矩阵
  cameraModule.activeCamera.updateProjectionMatrix()
  // 设置渲染器的像素比
  renderer.setPixelRatio(window.devicePixelRatio)
}

const meshes: BaseMesh[] = []

export function init(body: Ref<HTMLElement | null>) {
  if (body.value) {
    // 将 webgl 的内容添加到 body
    body.value.appendChild(renderer.domElement)

    // 执行动画
    animate()

    // 添加坐标辅助器
    addAxesHelper()

    // 添加物体
    meshes.push(...createMesh())

    // 设置渲染尺寸大小
    renderer.setSize(body.value.clientWidth, body.value.clientHeight)

    // 更新摄像头
    cameraModule.activeCamera.aspect = body.value.clientWidth / body.value.clientHeight;

    window.addEventListener('resize', eventFn.bind({ body }))
  }
  return meshes
}

export function remove() {
  meshes.forEach(mesh => {
    mesh.remove()
  })
  window.removeEventListener('resize', eventFn)
}