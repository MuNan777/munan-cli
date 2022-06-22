import fs from 'fs'
import path from 'path'
import fse from 'fs-extra'
import { Package, formatPackageName, getNpmRegistry, getVersions, log, prompt } from '@munan-cli/utils'
import baseConfig from './config'
import type { TemplateConfig } from './get-template'
import { getTemplates } from './get-template'

const { DEFAULT_TYPE, INIT_TYPE, TYPE_PROJECT, TYPE_COMPONENT } = baseConfig

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

async function prepare(opt: { name?: string; debug?: boolean; targetPath: string; force?: any }) {
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
  log.verbose('initType', JSON.stringify(initType))
  let templateList = await getTemplates()
  if (!templateList || templateList.length === 0)
    throw new Error('项目模板列表获取失败')
  let projectName = opt.name || ''
  while (!projectName)
    projectName = await getProjectName(initType)

  const packageName = formatPackageName(projectName)

  log.verbose('projectName', projectName)
  log.verbose('packageName', packageName)

  if (initType === TYPE_PROJECT) {
    templateList = templateList.filter(item => item.templateTag === 'project')
    return {
      templateList,
      project: {
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
        projectName,
        packageName,
        description,
      },
    }
  }
}

function createTemplateChoice(list: TemplateConfig[]) {
  return list.map(item => ({
    value: item.moduleName,
    name: item.templateName,
  }))
}

async function downloadTemplate(templateList, options) {
  const templateName = await prompt<string>({
    type: 'list',
    choices: createTemplateChoice(templateList),
    message: '请选择项目模板',
  })
  log.verbose('template', templateName)
  const versions = await getVersions(templateName, getNpmRegistry())
  const templateVersion = await prompt<string>({
    type: 'list',
    choices: versions.map((item: string) => ({
      value: item,
      name: item,
    })),
    message: '请选择模板版本',
  })
  const { cliHome } = options
  const targetPath = path.resolve(cliHome, 'template')
  // 基于模板生成 Package 对象
  const templatePkg = new Package({
    targetPath,
    storePath: targetPath,
    name: templateName,
    packageVersion: templateVersion,
  })
  // eslint-disable-next-line no-console
  console.log(templatePkg, options)
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
    // 获取项目模板列表
    const { templateList, project } = result
    // 缓存项目模板文件
    const template = await downloadTemplate(templateList, options)
    // eslint-disable-next-line no-console
    console.log(project, template)
  }
  catch (e) {
    if (opt.debug)
      log.error('Error:', e.stack)

    else
      log.error('Error:', e.message)
  }
}

export default init
