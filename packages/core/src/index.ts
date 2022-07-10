import { Command } from 'commander'

import { log } from '@munan-cli/utils'
import packageConfig from '../package.json'
import type { coreOptions } from './types'

import { checkNodeVersion } from './checkNodeVersion'
import { checkRoot } from './checkRoot'
import { checkUserHome } from './checkUserHome'
import { checkInputArgs } from './checkInputArgs'
import { checkEnv } from './checkEnv'
import { checkGlobalUpdate } from './checkGlobalUpdate'
import { execCommandWrapper } from './execCommand'
import { createWorkPackConfigHandle } from './createWorkPackConfigHandle'

const options: coreOptions = {
  args: {
    _: [],
  },
  config: {
    home: '',
    cliHome: '',
    useOriginNpm: true,
  },
}

const program = new Command('munan-cli')

// 准备环境
async function prepare() {
  checkNodeVersion() // 检查 node 版本
  checkRoot() // 检查是否为 root 启动
  checkUserHome() // 检查用户主目录
  checkInputArgs(options) // 检查用户输入参数
  checkEnv(options) // 检查环境变量
  await checkGlobalUpdate(options) // 检查工具是否需要更新
}

// 注册命令
function registerCommand() {
  program
    .version(packageConfig.version, undefined, '查看脚手架版本')
    .helpOption('-h, --help', '查看帮助信息')
    .addHelpCommand('help [command]', '查看命令帮助信息')
    .option('--cwc --createWorkPackConfig', '创建工作空间脚手架配置, 以后默认使用工作空间配置')
    .action(async (data) => {
      const {
        cwc,
        createWorkPackConfig,
      } = data
      if (cwc || createWorkPackConfig)
        createWorkPackConfigHandle()
    })
    .usage('<command> [options]')

  program
    .command('init [name]')
    .description('初始化项目')
    .option('-P --package-path <packagePath>', '指定包的路径')
    .option('-f --force', '强制覆盖已存在的文件')
    .option('--selectTemplateVersion', '选择特定版本的模板')
    .action(async (name, { packagePath, force, f, selectTemplateVersion }) => {
      const packageName = '@munan-cli/init'
      const packageVersion = '1.0.0'
      if (f)
        force = true

      // 获取执行函数
      const execCommand = execCommandWrapper(options)
      await execCommand(
        { packageName, packageVersion, packagePath },
        { name, force, selectTemplateVersion },
      )
    })

  program
    .command('publish')
    .description('项目发布')
    .option('-P --packagePath <packagePath>', '手动指定publish包路径')
    .option('--refreshToken', '强制更新git token信息')
    .option('--refreshOwner', '强制更新git owner信息')
    .option('--refreshServer', '强制更新git server信息')
    .option('--buildCmd <buildCmd>', '手动指定 build 命令')
    .option('--deployCmd <deployCmd>', '手动指定 deploy 命令')
    .option('--cnpm', '使用cnpm')
    .option('--pnpm', '使用pnpm')
    .option('-f --force', '强制更新所有缓存信息')
    .option('--cBuild --cloudBuild', '使用云发布')
    .option('--prod', '正式发布')
    .option('--cdc --createDeployCmd', '创建发布命令配置')
    .option('--pkg --packageDeploy', '发布 npm 包, (正式发布 prod = true)')
    .action(async ({
      packagePath,
      force,
      f,
      refreshToken,
      refreshOwner,
      refreshServer,
      buildCmd,
      deployCmd,
      cnpm,
      pnpm,
      prod,
      keepCache,
      cBuild,
      cloudBuild,
      cdc,
      createDeployCmd,
      pkg,
      packageDeploy,
    }) => {
      const packageName = '@munan-cli/publish'
      const packageVersion = '1.0.0'
      if (f || force) {
        refreshToken = true
        refreshOwner = true
        refreshServer = true
      }
      const { config } = options
      const cliHome = config.cliHome
      log.verbose('cliHome', cliHome)

      // 获取执行函数
      const execCommand = execCommandWrapper(options)
      await execCommand({ packagePath, packageName, packageVersion }, {
        refreshToken,
        refreshOwner,
        refreshServer,
        buildCmd,
        deployCmd,
        useCNpm: cnpm,
        usePNpm: pnpm,
        prod: prod || pkg || packageDeploy,
        keepCache,
        cliHome,
        cloudBuild: cBuild || cloudBuild,
        createDeployCmd: cdc || createDeployCmd,
        packageDeploy: pkg || packageDeploy,
      })
    })

  // 获取输入参数
  program.option('-d --debug', '打开调试模式').parse(process.argv)
  const { args } = options
  if (args._.length < 1 && !(args.cwc || args.createWorkPackConfig)) {
    program.outputHelp() // 输出帮助信息
    // eslint-disable-next-line no-console
    console.log() // 换行
  }
}

async function cli() {
  try {
    await prepare() // 准备环境
    registerCommand()
  }
  catch (err) {
    console.error(err.message)
  }
}

export default cli
