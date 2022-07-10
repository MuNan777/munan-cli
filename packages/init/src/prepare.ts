import fs from 'fs'
import fse from 'fs-extra'

import { formatPackageName, log, prompt } from '@munan-cli/utils'
import { getTemplates } from './get-template'
import baseConfig from './config'
const {
  DEFAULT_TYPE,
  INIT_TYPE,
  TYPE_PROJECT,
  TYPE_COMPONENT,
} = baseConfig

export async function prepare(opt: { name?: string; debug?: boolean; targetPath: string; force?: any }) {
  // 获取初始化类型
  const initType = await getInitType()
  log.verbose('initType', JSON.stringify(initType))
  // 获取项目名称
  let projectName = opt.name || ''
  while (!projectName)
    projectName = await getProjectName(initType)
  // 初始化项目包名
  const packageName = formatPackageName(projectName)
  // log
  log.verbose('projectName', projectName)
  log.verbose('packageName', packageName)
  // 项目路径
  const projectPath = `${opt.targetPath}/${projectName}`
  if (fse.pathExistsSync(projectPath)) {
    let files = fs.readdirSync(projectPath)
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
      const targetDir = projectPath
      const isEmptyDir = await prompt({
        type: 'confirm',
        message: `是否清空 ${targetDir.replaceAll('\\', '/')} 目录？`,
        defaultValue: false,
      })
      if (isEmptyDir)
        fse.emptyDirSync(targetDir)
    }
  }
  else {
    fs.mkdirSync(projectPath)
  }

  // 获取模板列表
  let templateList = await getTemplates()
  if (!templateList || templateList.length === 0)
    throw new Error('项目模板列表获取失败')

  if (initType === TYPE_PROJECT) {
    templateList = templateList.filter(item => item.templateTag === 'project')
    return {
      templateList,
      project: {
        projectPath,
        projectName,
        packageName,
      },
    }
  }
  if (initType === TYPE_COMPONENT) {
    templateList = templateList.filter(item => item.templateTag === 'component')
    let description = ''
    while (!description) {
      description = await getComponentDescription()
      log.verbose('description', description)
    }
    return {
      templateList,
      project: {
        projectPath,
        projectName,
        packageName,
        description,
      },
    }
  }
}

function getInitType() {
  return prompt<string>({
    type: 'list',
    choices: INIT_TYPE,
    message: '请选择初始化类型',
    defaultValue: DEFAULT_TYPE.value,
  })
}

function getProjectName(initType: string) {
  const items = INIT_TYPE.filter(type => type.value === initType)
  return prompt<string>({
    type: 'input',
    message: `请输入${items[0].name}名称`,
    defaultValue: '',
  })
}

function getComponentDescription() {
  return prompt<string>({
    type: 'input',
    message: '请输入组件的描述信息',
    defaultValue: '',
  })
}
