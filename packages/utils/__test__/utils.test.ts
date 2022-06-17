import { describe, it, expect } from 'vitest'
import userHome from 'user-home'
import { Package } from '../lib'
import packageJson from '../package.json'

const path = require('path')
const { npm } = require('../lib')

const DEFAULT_CLI_HOME = '.munan-cli'
const DEPENDENCIES_PATH = 'dependencies'

describe('utils', () => {
  describe('npm', () => {
    it('getNpmInfo', async () => {
      const info = await npm.getNpmInfo(
        '@munan-cli/utils',
        npm.getNpmRegistry()
      )
      expect(info.name).toBe('@munan-cli/utils')
    })
    it('getLatestVersion', async () => {
      const version = await npm.getLatestVersion(
        '@munan-cli/utils',
        npm.getNpmRegistry()
      )
      expect(version).toBe(packageJson.version)
    })
    it('getNpmLatestSemverVersion', async () => {
      const version = await npm.getNpmLatestSemverVersion(
        '@munan-cli/utils',
        '1.0.0',
        npm.getNpmRegistry()
      )
      expect(version).toBe(packageJson.version)
    })
  })
  describe('Package', () => {
    const targetPath = path.resolve(
      userHome,
      DEFAULT_CLI_HOME,
      DEPENDENCIES_PATH
    )
    const storePath = path.resolve(targetPath, 'node_modules')
    const p = new Package({
      targetPath,
      storePath,
      name: '@munan-cli/utils',
      packageVersion: '1.0.0',
    })
    it('npmFilePath', () => {
      expect(p.npmFilePath).toBe(
        path.resolve(
          storePath,
          `_${p.npmFilePathPrefix}@1.0.0@@munan-cli/utils`
        )
      )
    })
    it('install', async () => {
      await p.install()
      expect(p.exists()).toBeTruthy()
    })
    it('getPackage', async () => {
      const pkg = await p.getPackage()
      expect(pkg.name).toBe('@munan-cli/utils')
    })
    it('update', async () => {
      await p.update()
      expect(p.exists()).toBeTruthy()
      expect(await p.getVersion()).toBe(await p.getLatestVersion())
    })
  })
})
