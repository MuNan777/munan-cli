import path from 'path'
import fs from 'fs'
import fse from 'fs-extra'

import { log } from '@munan-cli/utils'

import baseConfig from './config'
const {
  WORKPLACE_GIT_CONFIG_PATH,
} = baseConfig

export function createWorkPackConfigHandle() {
  const projectPath = process.cwd()
  const pkgPath = path.resolve(projectPath, 'package.json')
  log.verbose('package.json', pkgPath)
  if (!fs.existsSync(pkgPath)) {
    log.error('error', 'package.json 不存在, 请在前端项目内使用此命令')
    return
  }
  if (!fse.existsSync(`./${WORKPLACE_GIT_CONFIG_PATH}.json`)) {
    const gitignoreConfig = `
  # munan-cli-config.json
  ${WORKPLACE_GIT_CONFIG_PATH}.json`
    fse.ensureFileSync(`${WORKPLACE_GIT_CONFIG_PATH}.json`)
    fse.writeFileSync(`${WORKPLACE_GIT_CONFIG_PATH}.json`, '{}')
    if (fse.existsSync('./.gitignore'))
      fse.writeFileSync('./.gitignore', gitignoreConfig, { flag: 'a+' })
    else
      fse.writeFileSync('./.gitignore', gitignoreConfig)
    log.success(`创建配置文件夹 ./${WORKPLACE_GIT_CONFIG_PATH}.json 成功`)
  }
  else {
    log.warn('warn', `./${WORKPLACE_GIT_CONFIG_PATH}.json 已存在`)
  }
}
