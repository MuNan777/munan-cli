import fs from 'fs'

import path from 'path'
import downgradeRoot from 'downgrade-root'
import userHome from 'user-home'
import minimist from 'minimist'
import dotenv from 'dotenv'
import { Command } from 'commander'
import semver from 'semver'
import colors from 'colors/safe'
import validate from 'validate-npm-package-name'
import fse from 'fs-extra'

import { Package, exec, getNpmLatestSemverVersion, getNpmRegistry, log, spinner } from '@munan-cli/utils'

import packageConfig from '../package.json'
import baseConfig from './config'
const { DEFAULT_CLI_HOME, DEPENDENCIES_PATH, LOWEST_NODE_VERSION, NPM_NAME, USE_ORIGIN_NPM } = baseConfig

let args: minimist.ParsedArgs
let config: {
  home: string
  cliHome: string
  useOriginNpm: boolean
}

const program = new Command()

function checkNodeVersion(): void {
  if (!semver.gte(process.version, LOWEST_NODE_VERSION)) {
    throw new Error(
      colors.red(
        `munan-cli 需要安装 v${LOWEST_NODE_VERSION} 以上版本的 Node.js`,
      ),
    )
  }
}

function checkRoot() {
  try {
    downgradeRoot() // root 降级
  }
  catch (e) {
    colors.red('请避免使用 root 账户启动本应用')
  }
}

function checkUserHome() {
  if (!userHome || !fs.existsSync(userHome))
    throw new Error(colors.red('当前登录用户不存在主目录'))
}

function checkArgs() {
  if (args.debug || args.d)
    process.env.LOG_LEVEL = 'verbose'
  else
    process.env.LOG_LEVEL = 'info'

  log.level = process.env.LOG_LEVEL
}

function checkInputArgs() {
  log.verbose('info', '检查用户输入参数')
  args = minimist(process.argv.slice(2))
  if (args.d)
    args.debug = true

  checkArgs()
}

function createCliConfig() {
  const cliConfig = {
    home: userHome,
    cliHome: '',
    useOriginNpm: true,
  }
  if (process.env.CLI_HOME)
    cliConfig.cliHome = path.join(userHome, process.env.CLI_HOME)

  else
    cliConfig.cliHome = path.join(userHome, DEFAULT_CLI_HOME)

  cliConfig.useOriginNpm = process.env.USE_ORIGIN_NPM
    ? process.env.USE_ORIGIN_NPM !== 'false'
    : USE_ORIGIN_NPM
  return cliConfig
}

function checkEnv() {
  log.verbose('info', '开始检查环境变量')
  dotenv.config({
    path: path.resolve(userHome, '.env'),
  })
  config = createCliConfig()
  log.verbose('环境变量', JSON.stringify(config))
}

async function checkGlobalUpdate() {
  log.verbose('info', '检查工具是否需要更新')
  const currentVersion = packageConfig.version
  const lastVersion = await getNpmLatestSemverVersion(
    NPM_NAME,
    currentVersion,
    getNpmRegistry(config.useOriginNpm),
  )
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      'warn',
      colors.yellow(`请手动更新 ${NPM_NAME}，当前版本：${packageConfig.version}，最新版本：${lastVersion}
                更新命令： npm install -g ${NPM_NAME}`),
    )
  }
}

// 准备环境
async function prepare() {
  checkNodeVersion() // 检查 node 版本
  checkRoot() // 检查是否为 root 启动
  checkUserHome() // 检查用户主目录
  checkInputArgs() // 检查用户输入参数
  checkEnv() // 检查环境变量
  await checkGlobalUpdate() // 检查工具是否需要更新
}

function handleError(e) {
  if (args.debug)
    log.error('Error', e.stack)
  else
    log.error('Error', e.message)

  process.exit(1)
}

// 执行命令
async function execCommand(
  { packagePath, packageName, packageVersion }: { packageName: string; packageVersion: string; packagePath: any },
  extendOptions: { name?: string; force: boolean; moduleName?: string },
) {
  let rootFile: string
  try {
    if (packagePath) {
      const execPackage = new Package({
        targetPath: packagePath,
        storePath: packagePath,
        name: packageName,
        packageVersion,
      })
      // 包的根文件路径
      rootFile = await execPackage.getRootFilePath(true) || ''
    }
    else {
      const { cliHome } = config
      const packageDir = `${DEPENDENCIES_PATH}`
      const targetPath = path.resolve(cliHome, packageDir)
      const storePath = path.resolve(targetPath, 'node_modules')
      const initPackage = new Package({
        targetPath,
        storePath,
        name: packageName,
        packageVersion,
      })
      // 判断是否已经安装
      if (await initPackage.exists()) {
        // 如果已经安装，则尝试更新包
        await initPackage.update()
      }
      else {
        // 如果未安装，则安装包
        await initPackage.install()
      }
      // 包的根文件路径
      rootFile = await initPackage.getRootFilePath() || ''
    }
    const _config = { ...config, ...extendOptions, debug: args.debug }
    if (fs.existsSync(rootFile)) {
      const code = `import('file://${rootFile}').then(callback => callback.default(${JSON.stringify(_config)}))`
      const pack = exec('node', ['--experimental-modules', '-e', code], { stdio: 'inherit' })
      pack.on('error', (e) => {
        log.verbose('命令执行失败', `${e}`)
        handleError(e)
      })

      pack.on('exit', (c) => {
        log.verbose('命令执行完成', `${c}`)
        process.exit(c || 0)
      })
    }
    else {
      throw new Error('入口文件不存在，请重试！')
    }
  }
  catch (err) {
    log.error('error', err.message)
  }
}

function registerCommand() {
  program
    .version(packageConfig.version, undefined, '查看脚手架版本')
    .helpOption('-h, --help', '查看帮助信息')
    .addHelpCommand('help [command]', '查看命令帮助信息')
    .usage('<command> [options]')

  program
    .command('init [name]')
    .description('初始化项目')
    .option('-P --package-path <packagePath>', '指定包的路径')
    .option('-f --force', '强制覆盖已存在的文件')
    .action(async (name, { packagePath, force, f }) => {
      const packageName = '@munan-cli/init'
      const packageVersion = '1.0.0'
      if (f)
        force = true
      await execCommand(
        { packageName, packageVersion, packagePath },
        { name, force },
      )
    })

  program
    .command('template [moduleName]')
    .description('创建模板')
    .option('-P --package-path <packagePath>', '指定包的路径')
    .option('--force', '强制覆盖已存在的文件')
    .action(async (moduleName, { packagePath, force }) => {
      const packageName = '@munan-cli/template'
      const packageVersion = '1.0.0'
      if (!moduleName) {
        log.error('Error:', '请指定模板包名')
        process.exit(0)
      }
      const result = validate(moduleName)
      if (!result.validForNewPackages) {
        log.error('Error:', '模板名称不合法')
        process.exit(0)
      }
      const templatePath = `${process.cwd().replaceAll('\\', '/')}/packages/${moduleName}-template`
      if (fse.existsSync(templatePath)) {
        log.error('Error:', `模板 ${templatePath} 已存在`)
        process.exit(0)
      }
      await execCommand(
        { packageName, packageVersion, packagePath },
        { moduleName, force },
      )
    })

  // 获取输入参数
  program.option('-d --debug', '打开调试模式').parse(process.argv)

  if (args._.length < 1) {
    program.outputHelp() // 输出帮助信息
    // eslint-disable-next-line no-console
    console.log() // 换行
  }
}

async function cli() {
  try {
    const spinnerStart = spinner('初始化脚手架')
    await prepare() // 准备环境
    spinnerStart.stop(true)
    registerCommand()
  }
  catch (err) {
    console.error(err.message)
  }
}

export default cli
