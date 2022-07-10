import path from 'path'
import fs from 'fs'
import validate from 'validate-npm-package-name'
import fse from 'fs-extra'
import { getDirName, log, prompt, renderFiles } from '@munan-cli/utils'

import Config from './config'
const { TEMPLATE_TYPE_LIST, TEMPLATE_TAG_LIST, CREATE_TYPE_LIST } = Config

async function build(options: optionsProps, modulePath: string, templatePath: string) {
  // eslint-disable-next-line no-console
  console.log(modulePath, templatePath)
  try {
    fs.mkdirSync(modulePath)
    fse.copySync(templatePath, modulePath)
    await renderFiles(modulePath, options)
  }
  catch (err) {
    if (fse.existsSync(modulePath))
      fse.removeSync(modulePath)
    err.message = '渲染文件夹失败'
    throw err
  }
  return true
}

interface optionsProps {
  targetPath: string
  moduleName: string
  templateName?: string
  templateType?: string
  templateTag?: string
  startCommand?: string
  buildPath?: string
  examplePath?: string
  ejsIgnoreFiles?: string[]
  gitRepository?: string
  moduleDescription?: string
}

async function prepareTemplate(options: optionsProps) {
  const templateName = await prompt<string>({
    type: 'input',
    message: '输入模板名称',
    defaultValue: `${options.moduleName} 模板`,
  })
  options.templateName = templateName
  const templateType = await prompt<string>({
    type: 'list',
    message: '选择模板类型',
    choices: TEMPLATE_TYPE_LIST,
  })
  options.templateType = templateType
  const templateTag = await prompt<string>({
    type: 'list',
    message: '选择模板分类',
    choices: TEMPLATE_TAG_LIST,
  })
  options.templateTag = templateTag
  const startCommand = await prompt<string>({
    type: 'input',
    message: '启动命令',
    defaultValue: 'npm run start',
  })
  options.startCommand = startCommand
  const buildPath = await prompt<string>({
    type: 'input',
    message: '构建路径',
    defaultValue: 'dist',
  })
  options.buildPath = buildPath
  options.examplePath = ''
  if (options.templateType === 'component') {
    const examplePath = await prompt<string>({
      type: 'input',
      message: '示例路径',
      defaultValue: 'example',
    })
    options.examplePath = examplePath
  }
  if (options.templateType === 'git') {
    const gitRepository = await prompt<string>({
      type: 'input',
      message: 'git 远程仓库',
      defaultValue: '',
    })
    options.gitRepository = gitRepository
  }
  const ejsIgnoreFiles = await prompt<string>({
    type: 'input',
    message: 'ejs忽略文件, 使用空格分隔',
    defaultValue: '**/node_modules/**',
  })
  options.ejsIgnoreFiles = (ejsIgnoreFiles as string).split(' ')
  return options
}

async function prepareModule(options: optionsProps) {
  const moduleDescription = await prompt<string>({
    type: 'input',
    message: '输入模块描述信息',
    defaultValue: `${options.moduleName} 模块`,
  })
  options.moduleDescription = moduleDescription
  return options
}

async function template() {
  try {
    const targetPath = path.resolve(getDirName(import.meta.url), '../../')
    const argv = process.argv
    let isCreateModule = false
    let moduleName = ''
    if (argv[2]) {
      isCreateModule = !!argv[2].match(/^-.*$/)
      moduleName = isCreateModule ? argv[3] : argv[2]
    }
    let createType = 'template'
    if (isCreateModule)
      createType = argv[2]

    const createName = (CREATE_TYPE_LIST.find(type => type.value === createType) || CREATE_TYPE_LIST[0]).name
    while (!moduleName) {
      moduleName = await prompt<string>({
        type: 'input',
        message: `输入${createName}包名称`,
        defaultValue: '',
      })
      const valid = validate(moduleName)
      if (!valid.validForNewPackages) {
        log.error('Error:', `${createName}名称不合法`)
        moduleName = ''
      }
      const templatePath = `${moduleName}-template`
      if (fse.existsSync(templatePath)) {
        log.error('Error:', `${createName} ${templatePath} 已存在`)
        moduleName = ''
      }
    }
    const templatePath = isCreateModule ? `${moduleName}` : `${moduleName}-template`
    if (fse.existsSync(path.resolve(targetPath, templatePath))) {
      log.error('Error:', `${createName} ${templatePath} 已存在`)
      process.exit(0)
    }
    const options = { moduleName, targetPath }
    log.notice('template', JSON.stringify(options))
    // 完成项目初始化的准备和校验工作
    let result: null | boolean = null
    let cd = ''
    if (!isCreateModule) {
      const configs = await prepareTemplate(options)
      log.notice('info', '开始构建模板')
      const modulePath = path.resolve(options.targetPath, `${options.moduleName}-template`)
      const templatePath = path.resolve(options.targetPath, 'template/templates', `${configs.templateType}Template`)
      result = await build(configs, modulePath, templatePath)
      cd = `cd packages/${configs.moduleName}-template`
    }
    else {
      const configs = await prepareModule(options)
      log.notice('info', '开始构建模块')
      const modulePath = path.resolve(options.targetPath, `${options.moduleName}`)
      const templatePath = path.resolve(options.targetPath, 'template/templates/module/base')
      result = await build(configs, modulePath, templatePath)
      cd = `cd packages/${configs.moduleName}`
    }
    if (result) {
      log.info('info', `创建${createName}成功`)
      log.info('info', cd)
    }
  }
  catch (e) {
    log.error('Error:', e.stack)
  }
  finally {
    process.exit(0)
  }
}

template()
