import log from '../log'
import type Git from '../Git/git'
import exec from '../exec'

interface LocalBuildOptions {
  prod: boolean
  keepCache: boolean
  useCNpm: boolean
  usePNpm: boolean
  buildCmd: string
  deployCmd: string
}

class LocalBuild {
  _git: Git
  _prod?: boolean
  _keepCache?: boolean
  _useCNpm?: boolean
  _usePNpm?: boolean
  _buildCmd?: string
  _deployCmd?: string

  constructor(git: Git, options: Partial<LocalBuildOptions>) {
    log.verbose('CloudBuild options', JSON.stringify(options))
    this._git = git
    this._prod = options.prod
    this._keepCache = options.keepCache
    this._useCNpm = options.useCNpm
    this._usePNpm = options.usePNpm
    this._buildCmd = options.buildCmd
    this._deployCmd = options.deployCmd
  }

  install = async () => {
    log.notice('info', '开始安装依赖')
    let installRes = true
    if (this._useCNpm) { installRes = await this.execCommand('cnpm install') }
    else if (this._usePNpm) { installRes = await this.execCommand('pnpm install') }
    else {
      installRes = (installRes && await this.execCommand('pnpm install --only=prod'))
      installRes = (installRes && await this.execCommand('pnpm install --only=dev'))
    }
    if (!installRes)
      log.error('error', '安装依赖失败')
    else
      log.success('构建成功')
  }

  build = async () => {
    log.notice('info', '开始构建')
    if (this._buildCmd) {
      const buildRes = await this.execCommand(this._buildCmd)
      if (!buildRes)
        log.error('error', '发布失败')
      else
        log.success('构建成功')
    }
    else { log.error('error', '构建命令不存在') }
  }

  deploy = async () => {
    log.notice('info', '开始发布')
    if (this._buildCmd) {
      const deployRes = await this.execCommand(this._buildCmd)
      if (!deployRes)
        log.error('error', '发布失败')
      else
        log.success('发布成功')
    }
    else { log.error('error', '构建命令不存在') }
  }

  execCommand(commandStr: string): Promise<boolean> {
    const commands = commandStr.split(' ')
    if (commands.length === 0)
      return Promise.resolve(false)
    const command = commands[0]
    const argv = commands.slice(1) || []
    return new Promise((resolve, reject) => {
      const event = exec(command, argv, { stdio: 'inherit' })
      event.on('close', (data) => {
        if (data && data > 0)
          reject(new Error('执行失败'))
        else
          resolve(true)
      })
    })
  }
}

export default LocalBuild
