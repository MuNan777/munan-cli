import path from 'path'
import fs from 'fs'

import userHome from 'user-home'

import type { SimpleGit } from 'simple-git'
import SimpleGitFactory from 'simple-git'
import fse from 'fs-extra'

import log from '../log'
import { readFile, writeFile } from '../file'
import { prompt } from '../inquirer'
import Config from './config'
import Github from './github'
import Gitee from './gitee'
const {
  REPO_OWNER_USER,
  DEFAULT_CLI_HOME,
  GIT_ROOT_DIR,
  GIT_SERVER_FILE,
  GIT_SERVER_TYPE,
  GITEE,
  GITHUB,
} = Config

interface GitConfig {
  dir: string // git 仓库本地目录
  name: string // git 仓库名称
  version: string // git 分支号
}

interface ActionConfig {
  cliHome: string // 缓存根目录
  refreshToken: boolean // 是否强制刷新 token
  refreshOwner: boolean // 是否强制刷新用户
  refreshServer: boolean // 是否强制刷新 git 远程仓库类型
  prod: boolean // 是否为正式发布
  useCNpm: string // 是否使用 cnpm
  keepCache: string // 是否保留服务端缓存（用于调试bug）
  buildCmd: string // 手动指定build命令
}

interface SSHConfig {
  sshUser: string // 远程服务器用户名
  sshIp: string // 远程服务器IP
  sshPath: string // 远程服务器路径
}

function createGitServer(gitServer) {
  if (gitServer === GITHUB)
    return new Github()
  else if (gitServer === GITEE)
    return new Gitee()
  return null
}

class Git {
  git: SimpleGit // git 实例
  name: string
  version: string
  dir: string
  owner: string
  login: string | null
  repo: string | null
  homePath: string | undefined
  refreshToken: boolean | undefined
  refreshOwner: boolean | undefined
  refreshServer: boolean | undefined
  sshUser: string | undefined
  sshIp: string | undefined
  sshPath: string | undefined
  gitServerInfo: Github | Gitee | null
  prod: boolean | undefined
  keepCache: string | undefined
  useCNpm: string | undefined
  buildCmd: string | undefined

  constructor(
    { dir, name, version }: GitConfig,
    {
      cliHome, refreshToken, refreshOwner, refreshServer,
      sshUser, sshIp, sshPath, prod, keepCache, useCNpm, buildCmd,
    }: Partial<ActionConfig & SSHConfig>,
  ) {
    this.git = SimpleGitFactory(dir)
    this.name = name
    this.version = version
    this.dir = dir
    this.owner = REPO_OWNER_USER
    this.login = null
    this.repo = null
    this.homePath = cliHome
    this.refreshToken = refreshToken
    this.refreshOwner = refreshOwner
    this.refreshServer = refreshServer
    this.sshUser = sshUser
    this.sshIp = sshIp
    this.sshPath = sshPath
    this.gitServerInfo = null
    this.prod = prod
    this.keepCache = keepCache
    this.useCNpm = useCNpm
    this.buildCmd = buildCmd
  }

  prepare = async () => {
    this.checkHomePath()
  }

  // 检查缓存主目录
  checkHomePath = () => {
    if (!this.homePath) {
      if (process.env.CLI_HOME)
        this.homePath = path.resolve(userHome, process.env.CLI_HOME)
      else
        this.homePath = path.resolve(userHome, DEFAULT_CLI_HOME)
    }
    log.verbose('home', this.homePath)
    fse.ensureDirSync(this.homePath)
    if (!fs.existsSync(this.homePath))
      throw new Error('用户主目录获取失败！')
  }

  // 创建缓存目录
  createPath = (file: string) => {
    const rootDir = path.resolve(this.homePath!, GIT_ROOT_DIR)
    const filePath = path.resolve(rootDir, file)
    fse.ensureDirSync(rootDir)
    return filePath
  }

  // 选择远程 git 平台
  checkGitServer = async () => {
    const gitServerPath = this.createPath(GIT_SERVER_FILE)
    let gitServerInfo = readFile(gitServerPath)
    if (!gitServerInfo || this.refreshServer) {
      gitServerInfo = await prompt<string>({
        type: 'list',
        choices: GIT_SERVER_TYPE,
        message: '请选择您想要托管的Git平台',
      })
      if (writeFile(gitServerPath, gitServerInfo))
        log.success('git server写入成功', `${gitServerInfo} -> ${gitServerPath}`)
      else
        log.verbose('git server写入失败', `${gitServerInfo} -> ${gitServerPath}`)
    }
    else {
      log.success('git server获取成功', gitServerInfo)
    }
    this.gitServerInfo = createGitServer(gitServerInfo)
  }
}

export default Git
