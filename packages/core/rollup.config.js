import esbuild from 'rollup-plugin-esbuild'// 将 ts 转换成 js
import dts from 'rollup-plugin-dts' // 生成 dts
import resolve from '@rollup/plugin-node-resolve' // 让rollup支持nodejs的模块解析机制
import commonjs from '@rollup/plugin-commonjs' // 将CommonJs模块转换为es6
import { defineConfig } from 'rollup'
import json from '@rollup/plugin-json'
import fse from 'fs-extra'
import { createEntries } from '../../rollup.config.base'
import pkg from './package.json'

const files = fse.readdirSync('src')

const entries = {}

files.forEach((file) => {
  createEntries(file, __dirname, 'src', entries)
})

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

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
]

const rollupConfigs = []

Object.keys(entries).forEach((label) => {
  rollupConfigs.push(...[{
    input: entries[label],
    output: {
      dir: 'lib',
      format: 'esm',
      entryFileNames: '[name].mjs',
      chunkFileNames: 'chunk-[name].mjs',
      banner: label === 'cli' ? '#!/usr/bin/env node' : null,
    },
    external,
    plugins,
    onwarn,
  },
  {
    input: entries[label],
    output: {
      dir: 'lib',
      format: 'cjs',
      entryFileNames: '[name].cjs',
      chunkFileNames: 'chunk-[name].cjs',
      banner: label === 'cli' ? '#!/usr/bin/env node' : null,
    },
    external,
    plugins,
    onwarn,
  },
  {
    input: entries[label],
    output: {
      dir: 'lib',
      entryFileNames: '[name].d.ts',
      format: 'esm',
      banner: label === 'cli' ? '#!/usr/bin/env node' : null,
    },
    external,
    plugins: [
      dts({ respectExternal: true }),
    ],
    onwarn,
  }])
})

export default defineConfig(rollupConfigs)
