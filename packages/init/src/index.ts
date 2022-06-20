import fs from 'fs'
import fse from 'fs-extra'
import { log, prompt } from '@munan-cli/utils'
import baseConfig from './config'

const { DEFAULT_TYPE, INIT_TYPE } = baseConfig

function getInitType() {
  return prompt({
    type: 'list',
    choices: INIT_TYPE,
    message: '请选择初始化类型',
    defaultValue: DEFAULT_TYPE.value,
  })
}

async function prepare(opt: { debug?: boolean; targetPath: string; force?: any }) {
  let files = fs.readdirSync(process.cwd())
  // node_modules 模块文件夹 .git 版本控制文件 .DS_Store 文件夹描述文件（macOS）
  files = files.filter(
    file => !['node_modules', '.git', '.DS_Store'].includes(file),
  )
  log.verbose('files', JSON.stringify(files))
  let isContinueWhenDirNotEmpty = true
  if (files && files.length > 0) {
    isContinueWhenDirNotEmpty = await prompt({
      type: 'confirm',
      message: '当前文件夹不为空，是否继续创建项目？',
      defaultValue: false,
    })
  }
  if (!isContinueWhenDirNotEmpty)
    return null

  if (opt.force) {
    const targetDir = opt.targetPath
    const isEmptyDir = await prompt({
      type: 'confirm',
      message: `是否清空 ${targetDir} 目录？`,
      defaultValue: false,
    })
    if (isEmptyDir)
      fse.emptyDirSync(targetDir)
  }
  const initType = await getInitType()
  log.verbose('initType', initType)
}

async function init(opt: { debug: boolean; targetPath: string }) {
  try {
    // 设置 targetPath
    const targetPath = process.cwd()
    const options = opt
    if (!options.targetPath)
      options.targetPath = targetPath
    log.verbose('init', JSON.stringify(options))
    // 完成项目初始化的准备和校验工作
    const result = await prepare(options)
    if (!result) {
      log.info('info', '创建项目终止')
      return
    }
  }
  catch (e) {
    if (opt.debug)
      log.error('Error:', e.stack)

    else
      log.error('Error:', e.message)
  }
}

module.exports = init
