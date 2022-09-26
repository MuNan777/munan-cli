import { PerspectiveCamera } from "three"
import eventHub from "../../../utils/eventHub"

// 创建相机
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)
// 设置相机位置 xyz
camera.position.set(500, 500, 1000)

class CameraModule {
  activeCamera: PerspectiveCamera
  collection: Map<String, PerspectiveCamera>

  constructor() {
    this.activeCamera = camera
    this.collection = new Map<String, PerspectiveCamera>()
    this.collection.set('default', camera)

    eventHub.on("toggleCamera", (name) => {
      this.setActive(name as string)
    })
  }

  add(name: string, camera: PerspectiveCamera) {
    this.collection.set(name, camera)
  }

  setActive(name: string) {
    this.activeCamera = this.collection.get(name) || camera
  }
}

export default new CameraModule()