import fs from 'fs'
import path from 'path'
import fse from 'fs-extra'
import { Package, exec, formatPackageName, getNpmRegistry, getVersions, log, prompt, spinner } from '@munan-cli/utils'
import baseConfig from './config'
import type { TemplateConfig } from './get-template'
import { getTemplates } from './get-template'

const {
  DEFAULT_TYPE,
  INIT_TYPE,
  TYPE_PROJECT,
  TYPE_COMPONENT,
  TEMPLATE_TYPE_GENERAL,
  TEMPLATE_TYPE_EXECUTABLE,
  TEMPLATE_TYPE_GIT,
} = baseConfig

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

function createTemplateChoice(list: TemplateConfig[]) {
  return list.map(item => ({
    value: item.moduleName,
    name: item.templateName,
  }))
}

// 拉取模板代码
async function gitPullTemplate(opt: { selectedTemplate: TemplateConfig; projectName: string; projectPath: string }) {
  const { selectedTemplate, projectName, projectPath } = opt
  const files = fs.readdirSync(projectPath)
  if (files && files.length > 0) {
    const targetDir = projectPath
    const isEmptyDir = await prompt({
      type: 'confirm',
      message: `是否清空 ${targetDir.replaceAll('\\', '/')} 目录？`,
      defaultValue: false,
    })
    if (isEmptyDir)
      fse.emptyDirSync(targetDir)
    else
      throw new Error('目标文件夹不为空，无法进行代码拉取')
  }
  // 拉取代码
  await new Promise((resolve, reject) => {
    const event = exec('git', ['clone', `${selectedTemplate.gitRepository}`, `${projectName}`], { stdio: 'inherit' })
    event.on('close', () => {
      const files = fs.readdirSync(projectPath)
      if (files && files.length === 0)
        reject(new Error('模板拉取失败'))
      else
        resolve(null)
    })
  })
}

async function downloadTemplate(
  templateList: TemplateConfig[],
  options: {
    debug?: boolean
    projectPath: string
    projectName: string
    cliHome?: any
  },
) {
  const templateName = await prompt<string>({
    type: 'list',
    choices: createTemplateChoice(templateList),
    message: '请选择项目模板',
  })
  log.verbose('template', templateName)
  let versions: string[] = []
  try {
    versions = await getVersions(templateName, getNpmRegistry())
  }
  catch (err) {
    err.message = '获取模板版本失败，请检查网络'
    throw err
  }
  const templateVersion = await prompt<string>({
    type: 'list',
    choices: versions.map((item: string) => ({
      value: item,
      name: item,
    })),
    message: '请选择模板版本',
  })
  const { cliHome, projectPath, projectName } = options
  const targetPath = path.resolve(cliHome, 'template')
  const selectedTemplate = templateList.find(item => item.moduleName === templateName)
  if (selectedTemplate) {
    let isGitTemplate = false
    let templateSourcePath = ''
    let templatePath = ''
    // 判断是否存在远程仓库
    if (selectedTemplate.gitRepository) {
      await gitPullTemplate({ selectedTemplate, projectPath, projectName })
      isGitTemplate = true
    }
    else {
      // 基于模板生成 Package 对象
      const templatePkg = new Package({
        targetPath,
        storePath: targetPath,
        name: templateName,
        packageVersion: templateVersion,
      })
      // 如果模板不存在，进行下载
      if (!await templatePkg.exists()) {
        const spinnerStart = spinner('正在下载模板...')
        await templatePkg.install()
        spinnerStart.stop(true)
        log.success('下载模板成功')
      }
      else {
        log.notice('模板已存在', `${selectedTemplate.moduleName}@${templateVersion}`)
        log.notice('模板路径', `${targetPath}`)
      }
      // 生成模板路径
      templateSourcePath = templatePkg.npmFilePath
      templatePath = path.resolve(templateSourcePath, 'template')
      log.verbose('template path', templatePath)
      if (!fs.existsSync(templatePath))
        throw new Error(`[${templateName}]项目模板不存在！`)
      // eslint-disable-next-line no-console
      console.log(templatePkg, options)
    }
    const template = {
      ...selectedTemplate,
      isGitTemplate,
      path: templatePath,
      sourcePath: templateSourcePath,
    }
    return template
  }
  else {
    throw new Error('选中模板获取失败')
  }
}

interface TemplateProps {
  isGitTemplate: boolean
  path: string
  sourcePath: string
  moduleName: string
  templateName: string
  templateType: string
  templateTag: string
  startCommand: string
  buildPath: string
  ejsIgnoreFiles: string[]
  examplePath?: string
  gitRepository?: string
}

interface ProjectProps {
  projectPath: string
  projectName: string
  packageName: string
  description?: string
}

async function installExecutableTemplate(
  template: TemplateProps,
  ejsData: ProjectProps,
) {
  const pkgPath = path.resolve(template.sourcePath, 'package.json')
  const pkg = fse.readJsonSync(pkgPath)
  const rootFile = path.resolve(template.sourcePath, pkg.main)
  if (!fs.existsSync(rootFile))
    throw new Error('入口文件不存在！')
  log.notice('info', '开始执行自定义模板')
  const targetPath = ejsData.projectPath
  await execExecutableTemplate(rootFile, {
    targetPath,
    ...ejsData,
    template,
  })
  log.success('自定义模板执行成功')
}

function execExecutableTemplate(rootFile: string, options: {
  targetPath: string
  template: TemplateProps
} & ProjectProps) {
  const code = `require('${rootFile.replaceAll('\\', '/')}')(${JSON.stringify(options)})`
  return new Promise((resolve, reject) => {
    const event = exec('node', ['-e', code], { stdio: 'inherit' })
    event.on('close', (data) => {
      if (data && data > 0)
        reject(new Error('执行失败'))
      resolve(data)
    })
  })
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
    const template = await downloadTemplate(templateList, { ...options, ...project })
    log.verbose('template', JSON.stringify(template))
    if (template.templateType === TEMPLATE_TYPE_GENERAL) {
      // 安装项目模板
      // await installTemplate(template, project, options)
      // eslint-disable-next-line no-console
      console.log(TEMPLATE_TYPE_GENERAL, '>>>>>>>>>>>>>>>>>>>')
    }
    else if (template.templateType === TEMPLATE_TYPE_EXECUTABLE) {
      await installExecutableTemplate(template, project)
    }
    else if (template.templateType === TEMPLATE_TYPE_GIT) {
      // await installGitTemplate(template, project, options)
      // eslint-disable-next-line no-console
      console.log(TEMPLATE_TYPE_GIT, '>>>>>>>>>>>>>>>>>>>')
    }
    else {
      throw new Error('未知的模板类型！')
    }
  }
  catch (e) {
    if (opt.debug)
      log.error('Error:', e.stack)
    else
      log.error('Error:', e.message)
  }
}

export default init
