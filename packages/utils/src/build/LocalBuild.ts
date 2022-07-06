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

  deploy = async () => {
    log.notice('info', '开始发布')
    if (this._deployCmd) {
      const deployRes = await execCommand(this._deployCmd)
      if (!deployRes)
        log.error('error', '发布失败')
      else
        log.success('发布成功')
    }
    else { log.error('error', '构建命令不存在') }
  }
}

export default LocalBuild
