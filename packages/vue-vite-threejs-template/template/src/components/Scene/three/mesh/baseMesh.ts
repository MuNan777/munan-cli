import * as THREE from 'three'

export default class BaseMesh<
  G extends THREE.BufferGeometry = THREE.BufferGeometry,
  M extends THREE.Material = THREE.Material
> {
  index: number | undefined
  mesh: THREE.Mesh | undefined
  material: M | undefined
  geometry: G | undefined

  remove() {
    throw new Error('需要给物体添加移除方法！！！')
  }
}