import path from 'path'
import fs from 'fs'
import fse from 'fs-extra'
import { Git, getDirName, log, prompt } from '@munan-cli/utils'
import colors from 'colors'
import Config from './config'
const { WORKPLACE_GIT_CONFIG_PATH } = Config

async function prepare(options: { buildCmd: string; deployCmd: string }) {
  const { buildCmd } = options
  if (!buildCmd) { options.buildCmd = 'npm run build' }
  else {
    if (!buildCmd.startsWith('npm run build'))
      throw new Error('buildCmd参数不符合规范，正确格式：npm run build:xxx')
  }
  const { deployCmd } = options
  if (!deployCmd) { options.deployCmd = 'npm run deploy' }
  else {
    if (!deployCmd.startsWith('npm run deploy'))
      throw new Error('deployCmd参数不符合规范，正确格式：npm run deploy:xxx')
  }
}

function checkProjectInfo() {
  const projectPath = process.cwd()
  const pkgPath = path.resolve(projectPath, 'package.json')
  log.verbose('package.json', pkgPath)
  if (!fs.existsSync(pkgPath))
    throw new Error('package.json不存在')
  const pkg = fse.readJSONSync(pkgPath)
  const { name, version } = pkg
  log.verbose('project', name, version)
  return { name, version, dir: projectPath }
}

async function publish(
  opt: {
    debug: boolean
    buildCmd: string
    cloudBuild: boolean
    deployCmd: string
    createDeployCmd: boolean
    createWorkPackConfig: boolean
  }) {
  try {
    if (opt.createDeployCmd) {
      const pkgPath = path.resolve(process.cwd(), 'package.json')
      if (!fs.existsSync(pkgPath)) { throw new Error('package.json 不存在！') }
      else {
        const templateDir = path.resolve(getDirName(import.meta.url), '..', 'deployCmdTemplate')
        const dirs = fs.readdirSync(templateDir)
        const type = await prompt<string>({
          type: 'list',
          message: '请选择发布类型',
          choices: dirs.map(dir => ({ name: dir, value: dir })),
        })
        const createFn = await import(`file://${path.resolve(templateDir, type, 'index.mjs')}`)
        createFn.default()
      }
    }
    else if (opt.createWorkPackConfig) {
      if (!fse.existsSync(`./${WORKPLACE_GIT_CONFIG_PATH}.json`)) {
        const gitignoreConfig = `
# munan-cli-config.json
${WORKPLACE_GIT_CONFIG_PATH}.json`
        fse.ensureFileSync(`${WORKPLACE_GIT_CONFIG_PATH}.json`)
        fse.writeFileSync(`${WORKPLACE_GIT_CONFIG_PATH}.json`, '{}')
        log.success(`创建配置文件夹 ./${WORKPLACE_GIT_CONFIG_PATH}.json 成功`)
        if (fse.existsSync('./.gitignore'))
          fse.writeFileSync('./.gitignore', gitignoreConfig, { flag: 'a+' })
      }
    }
    else {
      const startTime = new Date().getTime()
      // 完成项目初始化的准备和校验工作
      await prepare(opt)
      // 本地初始化
      // 检查项目的基本信息
      const projectInfo = checkProjectInfo()
      const git = new Git(projectInfo, opt)
      log.info(colors.green('==='), colors.blue('git配置检查'), colors.green('==='))
      await git.prepare()
      log.info(colors.green('==='), colors.blue('git自动提交'), colors.green('==='))
      await git.commit()
      if (opt.cloudBuild) {
        log.info(colors.green('==='), colors.blue('云构建+云发布'), colors.green('==='))
        await git.cloudPublish()
      }
      else {
        log.info(colors.green('==='), colors.blue('本地构建+本地发布'), colors.green('==='))
        await git.localPublish()
      }
      const endTime = new Date().getTime()
      log.verbose('elapsed time', `${new Date(startTime)}, ${new Date(endTime)}`)
      log.info('本次发布耗时：', `${Math.floor((endTime - startTime) / 1000)}秒`)
    }
  }
  catch (e) {
    if (opt.debug)
      log.error('Error:', e.stack)
    else
      log.error('Error:', e.message)
  }
}

export default publish
