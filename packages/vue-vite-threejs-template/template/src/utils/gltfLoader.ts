import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"

export const loader = new GLTFLoader()
export const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./draco/')
loader.setDRACOLoader(dracoLoader)