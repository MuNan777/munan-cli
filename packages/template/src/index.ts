import path from 'path'
import fs from 'fs'
import validate from 'validate-npm-package-name'
import fse from 'fs-extra'
import { getDirName, log, prompt, renderFiles } from '@munan-cli/utils'

import Config from './config'
const { TEMPLATE_TYPE_LIST, TEMPLATE_TAG_LIST } = Config

async function build(options: optionsProps) {
  const modulePath = path.resolve(options.targetPath, `${options.moduleName}-template`)
  const templatePath = path.resolve(options.targetPath, 'template/src/template', `${options.templateType}Template`)
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
}

async function prepare(options: optionsProps) {
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

async function template() {
  try {
    const targetPath = path.resolve(getDirName(import.meta.url), '../../')
    const argv = process.argv
    let moduleName = argv[2]
    while (!moduleName) {
      moduleName = await prompt<string>({
        type: 'input',
        message: '输入模板名称',
        defaultValue: '',
      })
      const valid = validate(moduleName)
      if (!valid.validForNewPackages) {
        log.error('Error:', '模板名称不合法')
        moduleName = ''
      }
      const templatePath = `${moduleName}-template`
      if (fse.existsSync(templatePath)) {
        log.error('Error:', `模板 ${templatePath} 已存在`)
        moduleName = ''
      }
    }
    const templatePath = `${moduleName}-template`
    if (fse.existsSync(path.resolve(targetPath, templatePath))) {
      log.error('Error:', `模板 ${templatePath} 已存在`)
      process.exit(0)
    }
    const options = { moduleName, targetPath }
    log.notice('template', JSON.stringify(options))
    // 完成项目初始化的准备和校验工作
    const configs = await prepare(options)
    log.notice('info', '开始构建模板')
    const result = await build(configs)
    if (result) {
      log.info('info', '创建模板成功')
      log.info('info', `cd packages/${configs.moduleName}-template`)
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
