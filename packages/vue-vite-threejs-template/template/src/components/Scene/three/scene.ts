import * as THREE from "three"

// 创建一个场景
const scene = new THREE.Scene()

// 添加背景
// const textureCubeLoader = new THREE.CubeTextureLoader().setPath("./textures/")
// const textureCube = textureCubeLoader.load()
// scene.background = textureCube
// scene.environment = textureCube

// 添加网格地面
// const gridHelper = new THREE.GridHelper(5, 5);
// const material = gridHelper.material as THREE.MeshBasicMaterial
// material.opacity = 0.2
// material.transparent = true
// scene.add(gridHelper)

// 环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

// 添加环绕灯光
// const lightPositions = [[0, 0, 10], [0, 0, -10], [10, 0, 0], [-10, 0, 0], [0, 10, 0]]
// for (let position of lightPositions) {
//   const light1 = new THREE.DirectionalLight(0xffffff, 1)
//   light1.position.set(position[0], position[1], position[2])
// }
// const lightSecondaryPositions = [[5, 10, 0], [0, 10, 5], [0, 10, -5], [-5, 10, 0]]
// for (let position of lightSecondaryPositions) {
//   const light1 = new THREE.DirectionalLight(0xffffff, 0.3)
//   light1.position.set(position[0], position[1], position[2])
// }

export default scene