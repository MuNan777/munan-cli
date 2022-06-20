const fs = require('fs')
const path = require('path')

const semver = require('semver')
const colors = require('colors/safe')
const rootCheck = require('root-check')
const userHome = require('user-home')
const minimist = require('minimist')
const dotenv = require('dotenv')
const program = require('commander')

const { log, npm, Package, exec } = require('@munan-cli/utils')

const packageConfig = require('../package.json')
const {
  LOWEST_NODE_VERSION,
  DEFAULT_CLI_HOME,
  NPM_NAME,
  DEPENDENCIES_PATH,
  USE_ORIGIN_NPM,
} = require('./config')

let args
let config

function checkNodeVersion() {
  if (!semver.gte(process.version, LOWEST_NODE_VERSION)) {
    throw new Error(
      colors.red(
        `munan-cli 需要安装 v${LOWEST_NODE_VERSION} 以上版本的 Node.js`
      )
    )
  }
}

function checkRoot() {
  rootCheck(colors.red('请避免使用 root 账户启动本应用'))
}

function checkUserHome() {
  if (!userHome || !fs.existsSync(userHome)) {
    throw new Error(colors.red('当前登录用户不存在主目录'))
  }
}

function checkArgs() {
  if (args.debug || args.d) {
    process.env.LOG_LEVEL = 'verbose'
  } else {
    process.env.LOG_LEVEL = 'info'
  }
  log.level = process.env.LOG_LEVEL
}

function checkInputArgs() {
  log.verbose('检查用户输入参数')
  args = minimist(process.argv.slice(2))
  checkArgs(args)
}

function createCliConfig() {
  const cliConfig = {
    home: userHome,
  }
  if (process.env.CLI_HOME) {
    cliConfig.cliHome = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig.cliHome = path.join(userHome, DEFAULT_CLI_HOME)
  }
  cliConfig.useOriginNpm = process.env.USE_ORIGIN_NPM
    ? process.env.USE_ORIGIN_NPM !== 'false'
    : USE_ORIGIN_NPM
  return cliConfig
}

function checkEnv() {
  log.verbose('开始检查环境变量')
  dotenv.config({
    path: path.resolve(userHome, '.env'),
  })
  config = createCliConfig()
  log.verbose('环境变量', config)
}

async function checkGlobalUpdate() {
  log.verbose('检查工具是否需要更新')
  const currentVersion = packageConfig.version
  const lastVersion = await npm.getNpmLatestSemverVersion(
    NPM_NAME,
    currentVersion
  )
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      colors.yellow(`请手动更新 ${NPM_NAME}，当前版本：${packageConfig.version}，最新版本：${lastVersion}
                更新命令： npm install -g ${NPM_NAME}`)
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
  if (args.debug) {
    log.error('Error', e.stack)
  } else {
    log.error('Error', e.message)
  }
  process.exit(1)
}

// 执行命令
async function execCommand(
  { packagePath, packageName, packageVersion },
  extendOptions
) {
  let rootFile
  const { useOriginNpm } = config
  try {
    if (packagePath) {
      const execPackage = new Package({
        targetPath: packagePath,
        storePath: packagePath,
        name: packageName,
        version: packageVersion,
        useOriginNpm,
      })
      // 包的根文件路径
      rootFile = execPackage.getRootFilePath(true)
    } else {
      const { cliHome } = config
      const packageDir = `${DEPENDENCIES_PATH}`
      const targetPath = path.resolve(cliHome, packageDir)
      const storePath = path.resolve(targetPath, 'node_modules')
      const initPackage = new Package({
        targetPath,
        storePath,
        name: packageName,
        version: packageVersion,
        useOriginNpm,
      })
      // 判断是否已经安装
      if (await initPackage.exists()) {
        // 如果已经安装，则尝试更新包
        await initPackage.update()
      } else {
        // 如果未安装，则安装包
        await initPackage.install()
      }
      // 包的根文件路径
      rootFile = initPackage.getRootFilePath()
    }
    const _config = { ...config, ...extendOptions, debug: args.debug }
    if (fs.existsSync(rootFile)) {
      const code = `require('${rootFile}')(${_config})`
      const pack = exec('node', ['-e', code], { stdio: 'inherit' })
      pack.on('error', (e) => {
        log.verbose('命令执行失败', e)
        handleError(e)
      })

      pack.on('exit', (c) => {
        log.verbose('命令执行完成', c)
        process.exit(c)
      })
    } else {
      throw new Error('入口文件不存在，请重试！')
    }
  } catch (err) {
    log.error(err.message)
  }
}

function registerCommand() {
  program.version(packageConfig.version).usage('<command> [options]')

  program
    .command('init [type]')
    .description('初始化项目')
    .option('--package-path <packagePath>', '指定包的路径')
    .option('--force', '强制覆盖已存在的文件')
    .action(async (type, { packagePath, force }) => {
      const packageName = '@munan-cli/init'
      const packageVersion = '1.0.0'
      await execCommand(
        { packageName, packageVersion, packagePath },
        { type, force }
      )
    })

  // 获取输入参数
  program.option('-d --debug', '打开调试模式').parse(process.argv)

  if (args._.length < 1) {
    program.outputHelp() // 输出帮助信息
    console.log() // 换行
  }
}

async function cli() {
  try {
    await prepare() // 准备环境
    registerCommand()
  } catch (err) {
    console.error(err.message)
  }
}

module.exports = cli
