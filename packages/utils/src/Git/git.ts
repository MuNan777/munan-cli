import path from 'path'
import fs from 'fs'

import userHome from 'user-home'

import type { SimpleGit } from 'simple-git'
import SimpleGitFactory from 'simple-git'
import fse from 'fs-extra'

import log from '../log'
import { readFile, writeFile } from '../file'
import { prompt } from '../inquirer'
import { terminalLink } from '../terminalLink'
import spinner from '../spinner'
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
  GIT_TOKEN_FILE,
  GIT_OWN_FILE,
  GIT_LOGIN_FILE,
  GIT_OWNER_TYPE,
  GIT_OWNER_TYPE_ONLY,
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

export interface GitUser { // git 用户信息
  login: string // 用户名
}

export interface GitOrganize { // git 组织信息
  login: string // 组织名
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
  repo: any | null
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
  token: string
  user: GitUser
  orgs: GitOrganize[]

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
    await this.checkGitServer()
    if (this.gitServerInfo) {
      await this.checkGitToken()
      await this.checkUserAndOrgs()
      await this.checkGitOwner()
      await this.checkRepo()
    }
    else {
      throw new Error('获取托管的Git平台失败')
    }
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

  // 检查 git API 必须的 token
  checkGitToken = async () => {
    const tokenPath = this.createPath(GIT_TOKEN_FILE)
    let token = readFile(tokenPath)
    if (!token || this.refreshToken) {
      log.notice(`${this.gitServerInfo!.type} token未生成`, `请先生成 ${this.gitServerInfo!.type} token，${terminalLink('链接', this.gitServerInfo!.getTokenHelpUrl())}`)
      token = await prompt<string>({
        type: 'password',
        message: '请将 token 复制到这里',
        defaultValue: '',
      })
      writeFile(tokenPath, token)
      log.success('token 写入成功', `${token} -> ${tokenPath}`)
    }
    else {
      log.verbose('token', token)
      log.success('token 获取成功', tokenPath)
    }
    this.token = token
    this.gitServerInfo!.setToken(token)
  }

  // 获取用户和组织信息
  checkUserAndOrgs = async () => {
    this.user = await this.gitServerInfo!.getUser() as unknown as GitUser
    this.orgs = await this.gitServerInfo!.getOrgs() as unknown as GitOrganize[]
    log.verbose('user', JSON.stringify(this.user))
    log.verbose('orgs', JSON.stringify(this.orgs))
    if (!this.user)
      throw new Error('用户或组织信息获取失败')
    log.success(`${this.gitServerInfo!.type} 用户和组织信息获取成功`)
  }

  // 检查 git owner 是否选择
  checkGitOwner = async () => {
    const ownerPath = this.createPath(GIT_OWN_FILE)
    const loginPath = this.createPath(GIT_LOGIN_FILE)
    let owner = readFile(ownerPath)
    let login = readFile(loginPath)
    if (!owner || !login || this.refreshOwner) {
      log.notice('info', `${this.gitServerInfo!.type} owner 未生成，先选择 owner`)
      owner = await prompt<string>({
        type: 'list',
        choices: this.orgs.length > 0 ? GIT_OWNER_TYPE : GIT_OWNER_TYPE_ONLY,
        message: '请选择远程仓库类型',
      })
      if (owner === REPO_OWNER_USER) { login = this.user.login }
      else {
        login = await prompt<string>({
          type: 'list',
          choices: this.orgs.map(item => ({
            name: item.login,
            value: item.login,
          })),
          message: '请选择',
        })
      }
      writeFile(ownerPath, owner)
      writeFile(loginPath, login)
      log.success('git owner写入成功', `${owner} -> ${ownerPath}`)
      log.success('git login写入成功', `${login} -> ${loginPath}`)
    }
    else {
      log.success('git owner 获取成功', owner)
      log.success('git login 获取成功', login)
    }
    this.owner = owner
    this.login = login
  }

  checkRepo = async () => {
    const repo = await this.gitServerInfo!.getRepo(this.login!, this.name)
    if (!repo) {
      const spinnerStart = spinner('开始创建远程仓库...')
      try {
        if (this.owner === REPO_OWNER_USER) {
          // repo = await this.gitServerInfo!.getRepo(this.name)
        }
        else {
          // repo = await this.gitServerInfo!.createOrgRepo(this.name, this.login!)
        }
      }
      finally {
        spinnerStart.stop(true)
      }
      if (repo)
        log.success('远程仓库创建成功')
      else
        throw new Error('远程仓库创建失败')
    }
    log.success('远程仓库信息获取成功')
    this.repo = repo
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
