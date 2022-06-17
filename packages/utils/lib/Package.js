const path = require('path')
const fs = require('fs')

const fse = require('fs-extra')
const npminstall = require('npminstall')

const log = require('./log')
const npm = require('./npm')
const formatPath = require('./formatPath')

class Package {
  constructor(options) {
    log.verbose('options', options)
    this.targetPath = options.targetPath // 目标路径
    this.storePath = options.storePath // 存储路径
    this.packageName = options.packageName // 包名
    this.packageVersion = options.packageVersion // 包版本
    this.npmFilePathPrefix = options.packageName.replace('/', '_') // npm文件名前缀
    this.useOriginNpm = options.useOriginNpm // 默认使用 npm，如果为 false，则使用淘宝源
  }

  // 包默认下载文件路径
  get npmFilePath() {
    return path.resolve(
      this.storePath,
      `_${this.npmFilePathPrefix}@${this.packageVersion}@${this.packageName}`
    )
  }

  /**
   * 初始化
   */
  async prepare() {
    if (!fs.existsSync(this.targetPath)) {
      fse.mkdirSync(this.targetPath)
    }
    if (!fs.existsSync(this.storePath)) {
      fse.mkdirpSync(this.storePath)
    }
    log.verbose(this.targetPath)
    log.verbose(this.storePath)
    // 获取最新版本
    const latestVersion = await npm.getNpmLatestSemverVersion(
      this.packageName,
      this.packageVersion
    )
    log.verbose('latestVersion', this.packageName, latestVersion)
    if (latestVersion) {
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
      registry: npm.getNpmRegistry(this.useOriginNpm),
      pkgs: {
        name: this.packageName,
        version: this.packageVersion,
      },
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
   * @param {*} isOriginal boolean
   * @returns {*} package.json
   */
  async getPackage(isOriginal = false) {
    if (!isOriginal) {
      // 原始 npm 下载本地保存地址
      return fse.readJSONSync(path.resolve(this.npmFilePath, 'package.json'))
    }
    // 自定义提供的包存储路径
    return fse.readJSONSync(path.resolve(this.storePath, 'package.json'))
  }

  /**
   * 获取入口文件
   * @param {*} isOriginal boolean
   * @returns 入口文件
   */
  getRootFilePath(isOriginal = false) {
    const pkg = this.getPackage(isOriginal)
    if (pkg) {
      if (!isOriginal) {
        return fse.readJSONSync(path.resolve(this.npmFilePath, pkg.main))
      }
      return fse.readJSONSync(path.resolve(this.storePath, pkg.main))
    }
    return null
  }

  /**
   * 获取当前版本
   * @returns {string}
   */
  async getVersion() {
    await this.prepare()
    return (await this.exists()) ? this.getPackage().version : null
  }

  /**
   * 获取最新版本
   * @returns {string}
   */
  async getLatestVersion() {
    const version = await this.getVersion()
    if (version) {
      const latestVersion = await npm.getNpmLatestSemverVersion(
        this.packageName,
        version
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
      registry: npm.getNpmRegistry(this.useOriginNpm),
      pkgs: [
        {
          name: this.packageName,
          version: latestVersion,
        },
      ],
    })
  }
}

module.exports = Package
