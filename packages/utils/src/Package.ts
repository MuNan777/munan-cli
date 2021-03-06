import path from 'path'
import fs from 'fs'

import fse from 'fs-extra'
import npminstall from 'npminstall'

import log from './log'
import formatPath from './formatPath'
import { getNpmLatestSemverVersion, getNpmRegistry } from './npm'

interface PackageProps {
  targetPath: string
  storePath: string
  packageVersion: string
  name: string
  useCurrentPackageVersion?: boolean
}

class Package {
  targetPath: string
  storePath: string
  packageName: string
  packageVersion: string
  npmFilePathPrefix: string
  useCurrentPackageVersion: boolean

  constructor(options: PackageProps) {
    log.verbose('options', JSON.stringify(options))
    this.targetPath = options.targetPath // 目标路径
    this.storePath = options.storePath // 存储路径
    this.packageName = options.name // 包名
    this.packageVersion = options.packageVersion // 包版本
    this.npmFilePathPrefix = this.packageName.replace('/', '_') // npm文件名前缀
    this.useCurrentPackageVersion = options.useCurrentPackageVersion || false
  }

  // 包默认下载文件路径
  get npmFilePath() {
    return path.resolve(
      this.storePath,
      `_${this.npmFilePathPrefix}@${this.packageVersion}@${this.packageName}`,
    )
  }

  /**
   * 初始化
   */
  async prepare() {
    if (!fs.existsSync(this.targetPath))
      fse.mkdirpSync(this.targetPath)

    if (!fs.existsSync(this.storePath))
      fse.mkdirpSync(this.storePath)

    log.verbose('targetPath', this.targetPath)
    log.verbose('storePath', this.storePath)

    if (!this.useCurrentPackageVersion) {
      // 获取最新版本
      const latestVersion = await getNpmLatestSemverVersion(
        this.packageName,
        this.packageVersion,
      )
      log.verbose('latestVersion', this.packageName, latestVersion)
      if (latestVersion)
        this.packageVersion = latestVersion
    }
  }

  /**
   * 下载包
   * @returns
   */
  async install() {
    await this.prepare()
    return npminstall({
      root: this.targetPath,
      storeDir: this.storePath,
      registry: getNpmRegistry(),
      pkgs: [
        {
          name: this.packageName,
          version: this.packageVersion,
        },
      ],
    })
  }

  /**
   * 检查包是否存在
   * @returns boolean
   */
  async exists() {
    await this.prepare()
    return fs.existsSync(this.npmFilePath)
  }

  /**
   * 获取 package.json
   * @param {*} useCustomPackage boolean
   * @returns {*} package.json
   */
  async getPackage(useCustomPackage = false) {
    if (!useCustomPackage) {
      // 原始 npm 下载本地保存地址
      return fse.readJSONSync(path.resolve(this.npmFilePath, 'package.json'))
    }
    // 自定义提供的包存储路径
    return fse.readJSONSync(path.resolve(this.storePath, 'package.json'))
  }

  /**
   * 获取入口文件
   * @param {*} useCustomPackage boolean
   * @returns 入口文件
   */
  async getRootFilePath(useCustomPackage = false) {
    const pkg = await this.getPackage(useCustomPackage)
    if (pkg) {
      if (!useCustomPackage)
        return formatPath(path.resolve(this.npmFilePath, pkg.main))

      return formatPath(path.resolve(this.storePath, pkg.main))
    }
    return null
  }

  /**
   * 获取当前版本
   * @returns {string}
   */
  async getVersion() {
    await this.prepare()
    return (await this.exists()) ? (await this.getPackage()).version : null
  }

  /**
   * 获取最新版本
   * @returns {string}
   */
  async getLatestVersion() {
    const version = await this.getVersion()
    if (version) {
      const latestVersion = await getNpmLatestSemverVersion(
        this.packageName,
        version,
      )
      return latestVersion
    }
    return null
  }

  /**
   * 更新包
   * @returns {string}
   */
  async update() {
    const latestVersion = await this.getLatestVersion()
    return npminstall({
      root: this.targetPath,
      storeDir: this.storePath,
      registry: getNpmRegistry(),
      pkgs: [
        {
          name: this.packageName,
          version: latestVersion,
        },
      ],
    })
  }
}

export default Package
