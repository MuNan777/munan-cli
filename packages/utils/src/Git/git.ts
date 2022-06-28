import path from 'path'
import fs from 'fs'
import childProcess from 'child_process'

import userHome from 'user-home'
import circularJson from 'circular-json'

import type { SimpleGit } from 'simple-git'
import SimpleGitFactory from 'simple-git'
import fse from 'fs-extra'
import type { ReleaseType } from 'semver'
import semver from 'semver'

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
  GIT_IGNORE_FILE,
  COMPONENT_FILE,
  COMPONENT_GITIGNORE,
  PROJECT_GITIGNORE,
  VERSION_RELEASE,
  VERSION_DEVELOP,
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
  remote: string | void
  branch: string

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
      this.checkGitIgnore()
      this.checkComponent()
      await this.init()
    }
    else {
      throw new Error('获取托管的Git平台失败')
    }
  }

  init = async () => {
    if (this.getRemote())
      return true
    await this.initAndAddRemote()
    await this.initCommit()
  }

  // 检查 git 是否初始化
  getRemote = () => {
    const gitPath = path.resolve(this.dir, GIT_ROOT_DIR)
    if (this.gitServerInfo!.type === 'github')
      this.remote = this.gitServerInfo!.getRemote(this.name, this.login!, this.token)
    else
      this.remote = this.gitServerInfo!.getRemote(this.name, this.login!)

    if (fs.existsSync(gitPath)) {
      log.success('git 已完成初始化')
      return true
    }
  }

  // 初始化 git
  initAndAddRemote = async () => {
    log.notice('info', '执行 git 初始化')
    await this.git.init()
    log.notice('info', '添加 git remote')
    const remotes = await this.git.getRemotes()
    log.verbose('git remotes', JSON.stringify(remotes))
    if (!remotes.find(item => item.name === 'origin'))
      await this.git.addRemote('origin', this.remote!)
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

  // 初始化 commit
  initCommit = async () => {
    await this.checkConflicted()
    await this.checkNotCommitted()
    if (await this.checkRemoteMaster()) {
      log.notice('info', '远程存在 master 分支，强制合并')
      // --allow-unrelated-histories 强行合并
      await this.pullRemoteRepo('master', { '--allow-unrelated-histories': null })
    }
    else {
      await this.pushRemoteRepo('master')
    }
  }

  // 检查 master 目录
  checkRemoteMaster = async () => {
    let hanMaster = false
    // git ls-remote --refs
    const refs = await this.git.listRemote(['--refs'])
    if (refs.includes('refs/heads/master'))
      hanMaster = true
    return hanMaster
  }

  // 检查代码冲突
  checkConflicted = async () => {
    log.notice('init', '代码冲突检查')
    const status = await this.git.status()
    if (status.conflicted.length > 0)
      throw new Error('当前代码存在冲突，请手动处理合并后再试！')
    log.success('代码检查通过')
  }

  // 检查未提交
  checkNotCommitted = async () => {
    const status = await this.git.status()
    if (status.not_added.length > 0
      || status.created.length > 0
      || status.deleted.length > 0
      || status.modified.length > 0
      || status.renamed.length > 0) {
      log.verbose('status', JSON.stringify(status))
      await this.git.add(status.not_added)
      await this.git.add(status.created)
      await this.git.add(status.deleted)
      await this.git.add(status.modified)
      status.renamed.forEach(async (rename) => {
        await this.git.mv(rename.from, rename.to)
      })
      let message = ''
      while (!message) {
        message = await prompt({
          type: 'input',
          message: '请输入 commit 信息：',
          defaultValue: '',
        })
      }
      await this.git.commit(message)
      log.success('本地 commit 提交成功')
    }
  }

  getNotPermissionMessage = () => {
    let message = ''
    if (this.gitServerInfo!.type === 'github')
      message += '请重新输入一个具有 repo 权限的 token (munan-cli publish --refreshToken)\n'
    message += `或者获取本地 ssh publickey 并配置到：${this.gitServerInfo!.getSSHKeysUrl()}，配置方法：${this.gitServerInfo!.getSSHKeysHelpUrl()}`
    return message
  }

  // 同步代码
  pullRemoteRepo = async (branchName: string, options = {}) => {
    log.notice('info', `同步远程 ${branchName} 分支代码`)
    await this.git.pull('origin', branchName, options).catch((error) => {
      if (error.message.includes('403'))
        throw new Error(this.getNotPermissionMessage())
      else
        log.error('error', error.message)
      log.error('!!!', '请重新执行 munan-cli publish，如仍然报错请尝试删除 .git 目录后重试')
      process.exit(0)
    })
  }

  // 推送代码
  pushRemoteRepo = async (branchName: string) => {
    log.notice('info', `推送代码至远程 ${branchName} 分支`)
    await this.git.push('origin', branchName).catch((error) => {
      if (error.message.includes('403'))
        throw new Error(this.getNotPermissionMessage())
      else
        log.error('error', error.message)
    })
    log.success('推送代码成功')
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
    if (login !== this.user.login && !(this.orgs && this.orgs.find(org => org.login === login)))
      login = null

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

  // 检查远程仓库
  checkRepo = async () => {
    let repo = await this.gitServerInfo!.getRepo(this.name, this.login!)
    if (!repo) {
      const spinnerStart = spinner('开始创建远程仓库...')
      try {
        if (this.owner === REPO_OWNER_USER)
          repo = await this.gitServerInfo!.createRepo(this.name)
        else
          repo = await this.gitServerInfo!.createOrgRepo(this.name, this.login!)
      }
      finally {
        spinnerStart.stop()
      }
      log.verbose('repo', circularJson.stringify(repo))
      if (repo)
        log.success('远程仓库创建成功')
      else
        throw new Error('远程仓库创建失败')
    }
    log.success('远程仓库信息获取成功')
    this.repo = repo
  }

  // 检查 .gitignore
  checkGitIgnore = () => {
    const gitIgnore = path.resolve(this.dir, GIT_IGNORE_FILE)
    if (!fs.existsSync(gitIgnore)) {
      if (this.isComponent()) {
        writeFile(gitIgnore, COMPONENT_GITIGNORE)
        log.success('自动写入 .gitignore 文件')
      }
      else {
        writeFile(gitIgnore, PROJECT_GITIGNORE)
        log.success('自动写入 .gitignore 文件')
      }
    }
  }

  // 判断是否为组件
  isComponent = () => {
    const componentFilePath = path.resolve(this.dir, COMPONENT_FILE)
    return fs.existsSync(componentFilePath) && fse.readJsonSync(componentFilePath)
  }

  // 检查 component
  checkComponent = () => {
    const componentFile = this.isComponent()
    // 只有 component 才启动该逻辑
    if (componentFile) {
      log.notice('info', '开始检查 build 结果')
      childProcess.execSync('npm run build', {
        cwd: this.dir,
        stdio: 'inherit',
      })
      const buildPath = path.resolve(this.dir, componentFile.buildPath)
      if (!fs.existsSync(buildPath))
        throw new Error(`构建结果：${buildPath} 不存在！`)

      const pkg = this.getPackageJson()
      if (!pkg.files || !pkg.files.includes(componentFile.buildPath))
        throw new Error(`package.json 中 files 属性未添加构建结果目录：[${componentFile.buildPath}]，请在 package.json 中手动添加！`)

      log.notice('info', 'build 结果检查通过')
    }
  }

  // 合并分支
  pullRemoteMasterAndBranch = async () => {
    log.notice('info', `合并 [master] -> [${this.branch}]`)
    await this.pullRemoteRepo('master')
    log.success('合并远程 [master] 分支内容成功')
    await this.checkConflicted()
    log.notice('info', '检查远程分支')
    const remoteBranchList = await this.getRemoteBranchList()
    if (remoteBranchList.includes(this.version)) {
      log.notice('info', `合并 [${this.branch}] -> [${this.branch}]`)
      await this.pullRemoteRepo(this.branch)
      log.success(`合并远程 [${this.branch}] 分支内容成功`)
      await this.checkConflicted()
    }
    else {
      log.success(`不存在远程分支 [${this.branch}]`)
    }
  }

  commit = async () => {
    await this.getCorrectVersion()
    await this.checkStash()
    await this.checkConflicted()
    await this.checkNotCommitted()
    await this.checkoutBranch(this.branch)
    await this.pullRemoteMasterAndBranch()
    await this.pushRemoteRepo(this.branch)
  }

  // 切换分支
  checkoutBranch = async (branch: string) => {
    const localBranchList = await this.git.branchLocal()
    if (localBranchList.all.includes(branch))
      await this.git.checkout(branch)
    else
      await this.git.checkoutLocalBranch(branch)
    log.success(`分支切换到${branch}`)
  }

  // 检查 stash 记录
  checkStash = async () => {
    log.notice('info', '检查 stash 记录')
    const stash = await this.git.stashList()
    if (stash.all.length > 0) {
      await this.git.stash(['pop'])
      log.success('stash pop 成功')
    }
  }

  // 获取线上发布版本
  getRemoteBranchList = async (type?: string) => {
    // git ls-remote --refs
    const remoteList = await this.git.listRemote(['--refs'])
    let reg: RegExp
    if (type === VERSION_RELEASE)
      reg = /.+?refs\/tags\/release\/(\d+\.\d+\.\d+)/g
    else
      reg = /.+?refs\/heads\/dev\/(\d+\.\d+\.\d+)/g
    return remoteList.split('\n').map((re) => {
      const match = reg.exec(re.trim())
      reg.lastIndex = 0
      if (match && semver.valid(match[1]))
        return match[1]
      else
        return null
    }).filter(_ => _).sort((a, b) => {
      if (semver.lte(b!, a!)) {
        if (a === b)
          return 0
        return -1
      }
      return 1
    })
  }

  // 获取版本号
  getCorrectVersion = async () => {
    log.notice('info', '获取代码分支')
    const remoteBranchList = await this.getRemoteBranchList(VERSION_RELEASE)
    let releaseVersion: string | null = null
    if (remoteBranchList && remoteBranchList.length > 0) {
      // 获取最近的线上版本
      releaseVersion = remoteBranchList[0]
    }
    const devVersion = this.version
    if (!releaseVersion) { this.branch = `${VERSION_DEVELOP}/${devVersion}` }
    else if (semver.gt(this.version, releaseVersion)) {
      log.info('当前版本大于线上最新版本', `${devVersion} >= ${releaseVersion}`)
      this.branch = `${VERSION_DEVELOP}/${devVersion}`
    }
    else {
      log.notice('当前线上版本大于或等于本地版本', `${releaseVersion} >= ${devVersion}`)
      const incType = await prompt<ReleaseType>({
        type: 'list',
        choices: [{
          name: `小版本（${releaseVersion} -> ${semver.inc(releaseVersion, 'patch')}）`,
          value: 'patch',
        }, {
          name: `中版本（${releaseVersion} -> ${semver.inc(releaseVersion, 'minor')}）`,
          value: 'minor',
        }, {
          name: `大版本（${releaseVersion} -> ${semver.inc(releaseVersion, 'major')}）`,
          value: 'major',
        }],
        defaultValue: 'patch',
        message: '自动升级版本，请选择升级版本类型',
      })
      const incVersion = semver.inc(releaseVersion, incType)
      this.branch = `${VERSION_DEVELOP}/${incVersion}`
      this.version = incVersion!
      this.syncVersionToPackageJson()
    }
    log.success(`代码分支获取成功 ${this.branch}`)
  }

  syncVersionToPackageJson = () => {
    const pkg = fse.readJSONSync(`${this.dir}/package.json`)
    if (pkg && pkg.version !== this.version) {
      pkg.version = this.version
      fse.writeJsonSync(`${this.dir}/package.json`, pkg, { spaces: 2 })
    }
  }

  // 获取项目package.json文件
  getPackageJson = () => {
    const pkgPath = path.resolve(this.dir, 'package.json')
    if (!fs.existsSync(pkgPath))
      throw new Error('package.json 不存在！')

    return fse.readJsonSync(pkgPath)
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
