import path from 'path'
import fs from 'fs'
import fse from 'fs-extra'
import { Git, log } from '@munan-cli/utils'
import colors from 'colors'

async function prepare(options: { buildCmd: string }) {
  if (options.buildCmd) {
    const { buildCmd } = options
    if (!buildCmd.startsWith('npm run build'))
      throw new Error('buildCmd参数不符合规范，正确格式：npm run build:xxx')
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

async function publish(opt: { debug: boolean; buildCmd: string }) {
  try {
    const startTime = new Date().getTime()
    // 完成项目初始化的准备和校验工作
    await prepare(opt)
    // 本地初始化
    // 检查项目的基本信息
    const projectInfo = checkProjectInfo()
    const git = new Git(projectInfo, opt)
    log.info(colors.red('==='), colors.gray('git配置检查'), colors.red('==='))
    await git.prepare()
    log.info(colors.red('==='), colors.gray('git自动提交'), colors.red('==='))
    await git.commit()
    const endTime = new Date().getTime()
    log.verbose('elapsed time', `${new Date(startTime)}, ${new Date(endTime)}`)
    log.info('本次发布耗时：', `${Math.floor((endTime - startTime) / 1000)}秒`)
  }
  catch (e) {
    if (opt.debug)
      log.error('Error:', e.stack)
    else
      log.error('Error:', e.message)
  }
}

export default publish
