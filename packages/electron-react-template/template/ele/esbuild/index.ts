import { resolve, join } from 'path'
import { BuildOptions, build } from 'esbuild'

const ROOT = resolve(__dirname, '../..')
const ELECTRON_ROOT = resolve(__dirname, '..')

const createOptions = (): BuildOptions => ({
  bundle: true,
  entryPoints: {
    main: join(ELECTRON_ROOT, 'main.ts'),
    preload: join(ELECTRON_ROOT, 'preload.ts')
  },
  treeShaking: true,
  minify: true,
  external: ['electron', 'electron-edge-js'],
  format: 'cjs',
  loader: { '.ts': 'ts' },
  outdir: ROOT,
  platform: 'node',
  target: 'chrome89',
  tsconfig: join(ELECTRON_ROOT, 'tsconfig.json')
})

build(createOptions())
  .then(() => {
    console.log('Electron build complete')
  })
  .catch((error) => {
    console.error('Electron build error')
    console.log(error)
  })