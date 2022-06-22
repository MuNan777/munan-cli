import path from 'path'
import fs from 'fs'

import fse from 'fs-extra'

import { log, prompt, renderFiles } from '@munan-cli/utils'
import Config from './config'
const { TEMPLATE_TYPE_LIST, TEMPLATE_TAG_LIST } = Config

async function build(options: optionsProps) {
  const modulePath = path.resolve(process.cwd(), 'packages', `${options.moduleName}-template`)
  const templatePath = path.resolve(process.cwd(), 'packages/template/src/template', `${options.templateType}Template`)
  try {
    fs.mkdirSync(modulePath)
  }
  catch (err) {
    if (options.debug)
      log.error('Error:', err.stack)
    else
      log.error('error', '创建模板文件夹失败')
  }
  try {
    fse.copySync(templatePath, modulePath)
    await renderFiles(modulePath, options)
  }
  catch (err) {
    if (options.debug)
      log.error('Error:', err.stack)
    else
      log.error('error', '渲染文件夹失败')
  }
  log.info('info', '创建模板成功')
  log.info('info', `cd packages/${options.moduleName}-template`)
}

interface optionsProps {
  targetPath: string
  moduleName?: string
  templateName?: string
  templateType?: string
  templateTag?: string
  startCommand?: string
  buildPath?: string
  examplePath?: string
  ejsIgnoreFiles?: string[]
  debug?: string
}

async function prepare(options: optionsProps) {
  let pkg = { name: '' }
  try {
    pkg = fse.readJSONSync(`${process.cwd()}/package.json`)
  }
  catch (err) {
    if (options.debug)
      log.error('Error:', err.stack)
    else
      log.error('Error:', '请在 munan-cli 工作空间下使用')
    return null
  }
  if (pkg.name !== 'munan-cli') {
    log.error('Error:', '请在 munan-cli 工作空间下使用')
    return null
  }
  try {
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
    if (templateTag === 'component') {
      const examplePath = await prompt<string>({
        type: 'input',
        message: '示例路径',
        defaultValue: 'example',
      })
      options.examplePath = examplePath
    }
    const ejsIgnoreFiles = await prompt<string>({
      type: 'input',
      message: 'ejs忽略文件, 使用空格分隔',
      defaultValue: '**/node_modules/**',
    })
    options.ejsIgnoreFiles = (ejsIgnoreFiles as string).split(' ')
    log.notice('info', '开始构建模板')
    await build(options)
  }
  catch (err) {
    log.error('Error:', err.message)
  }
}

async function template(options: optionsProps) {
  try {
    // 设置 targetPath
    const targetPath = process.cwd()
    if (!options.targetPath)
      options.targetPath = targetPath

    log.verbose('template', JSON.stringify(options))
    // 完成项目初始化的准备和校验工作
    await prepare(options)
    log.verbose('result', '12345')
  }
  catch (e) {
    if (options.debug)
      log.error('Error:', e.stack)

    else
      log.error('Error:', e.message)
  }
  finally {
    process.exit(0)
  }
}

export default template
