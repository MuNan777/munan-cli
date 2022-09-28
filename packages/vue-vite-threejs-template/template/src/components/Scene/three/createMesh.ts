import BaseMesh from './mesh/baseMesh'
import ExampleMesh from './mesh/exampleMesh'
import scene from './scene'

export function createMesh() {
  const meshes: BaseMesh[] = []
  meshes.push(new ExampleMesh(scene))
  return meshes
}