import * as THREE from 'three'
import BassMesh from "./baseMesh"
import vertexShader from '../../../../shaders/shaderExample/vertex.glsl'
import fragmentShader from '../../../../shaders/shaderExample/fragment.glsl'
import gsap from 'gsap'
import { gui } from '../../../../utils/gui'

export default class ExampleMesh extends BassMesh<THREE.BoxGeometry, THREE.ShaderMaterial> {
  constructor(scene: THREE.Scene) {
    super()
    this.geometry = new THREE.BoxGeometry(5, 5, 5)
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uAlpha: {
          value: 0.0
        }
      },
      transparent: true,
    })
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    scene.add(this.mesh)
    // 动画 https://greensock.com/docs/
    gsap.to(this.material.uniforms.uAlpha, {
      value: 1.0,
      duration: 2,
      repeat: -1,
      yoyo: true
    })
    // gui https://github.com/dataarts/dat.gui/blob/HEAD/API.md
    gui.add(this.mesh.position, 'y').min(0).max(5).step(0.1).name('positionY')
    gui.add(this.mesh.rotation, 'z').min(0).max(Math.PI * 2).step(0.1).name('rotationZ')
    gui.add(this.mesh.scale, 'x').min(1).max(2).step(0.1).name('scaleX')
  }

  remove(): void {
    // 移除物体
    this.mesh?.remove()
    // 移除材质
    this.material?.dispose()
    // 移除几何体
    this.geometry?.dispose()
  }
}