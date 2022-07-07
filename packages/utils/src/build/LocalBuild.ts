import log from '../log'
import type Git from '../Git/git'
import { execCommand } from '../exec'

interface LocalBuildOptions {
  prod: boolean
  deployCmd: string
}

class LocalBuild {
  _git: Git
  _prod?: boolean
  _deployCmd?: string

  constructor(git: Git, options: Partial<LocalBuildOptions>) {
    log.verbose('CloudBuild options', JSON.stringify(options))
    this._git = git
    this._prod = options.prod
    this._deployCmd = options.deployCmd
  }

  deploy = async (pkg: { scripts: {} }) => {
    try {
      log.notice('info', '开始发布')
      if (!pkg.scripts || Object.keys(pkg.scripts).filter(name => name.startsWith('deploy')).length === 0)
        throw new Error('deploy命令不存在！ 可通过 munan-cli publish --createDeployCmd 创建相关配置')
      if (this._deployCmd) {
        const deployRes = await execCommand(this._deployCmd)
        return deployRes
      }
      else {
        log.error('error', '发布命令不存在')
        log.notice('info', '可通过 munan-cli publish --createDeployCmd 创建相关配置')
        return false
      }
    }
    catch (e) {
      log.verbose('error', '发布失败', e.stash)
      return false
    }
  }
}

export default LocalBuild
