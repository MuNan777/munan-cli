import esbuild from 'rollup-plugin-esbuild'// 将 ts 转换成 js
import dts from 'rollup-plugin-dts' // 生成 dts
import resolve from '@rollup/plugin-node-resolve' // 让rollup支持nodejs的模块解析机制
import commonjs from '@rollup/plugin-commonjs' // 将CommonJs模块转换为es6
import json from '@rollup/plugin-json' // 将json文件转换为es6
import { defineConfig } from 'rollup'

const plugins = [
  resolve({
    preferBuiltins: true,
  }),
  json(),
  commonjs(),
  esbuild({
    target: 'node14',
  }),
]

function onwarn(message) {
  if (message.code === 'EMPTY_BUNDLE')
    return
  console.error(message)
}

export function createConfig(entries, pkg) {
  const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    'child_process',
  ]
  return defineConfig([
    {
      input: entries,
      output: {
        dir: 'lib',
        format: 'esm',
        entryFileNames: '[name].mjs',
        chunkFileNames: 'chunk-[name].mjs',
      },
      external,
      plugins,
      onwarn,
    },
    {
      input: entries,
      output: {
        dir: 'lib',
        format: 'cjs',
        entryFileNames: '[name].cjs',
        chunkFileNames: 'chunk-[name].cjs',
      },
      external,
      plugins,
      onwarn,
    },
    {
      input: entries,
      output: {
        dir: 'lib',
        entryFileNames: '[name].d.ts',
        format: 'esm',
      },
      external,
      plugins: [
        dts({ respectExternal: true }),
      ],
      onwarn,
    },
  ])
}
