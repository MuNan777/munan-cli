import fs from 'fs'
import path from 'path'
import fse from 'fs-extra'
import { Package, exec, formatPackageName, getNpmRegistry, getVersions, log, prompt, renderFiles, spinner } from '@munan-cli/utils'
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
  COMPONENT_FILE,
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
    versions = await getVersions(templateName)
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
    let templateSourcePath = ''
    let templatePath = ''
    // 判断是否存在远程仓库
    if (selectedTemplate.gitRepository) {
      await gitPullTemplate({ selectedTemplate, projectPath, projectName })
    }
    else {
      // 基于模板生成 Package 对象
      const templatePkg = new Package({
        targetPath,
        storePath: targetPath,
        name: templateName,
        packageVersion: templateVersion,
        useCurrentPackageVersion: true
      })
      // 如果模板不存在，进行下载
      if (!await templatePkg.exists()) {
        log.notice('info', '正在下载模板...')
        await templatePkg.install()
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
    }
    const template = {
      ...selectedTemplate,
      path: templatePath,
      sourcePath: templateSourcePath,
      templateVersion,
    }
    return template
  }
  else {
    throw new Error('选中模板获取失败')
  }
}

interface TemplateProps {
  path: string
  sourcePath: string
  moduleName: string
  templateName: string
  templateType: string
  templateTag: string
  templateVersion: string
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

// 如果是组件项目，则创建组件相关文件
async function createComponentFile(template: TemplateProps, project: ProjectProps, dir: string) {
  if (template.templateTag === TYPE_COMPONENT) {
    const componentData = {
      buildPath: template.buildPath,
      examplePath: template.examplePath,
      npmName: project.packageName,
      npmVersion: template.templateVersion,
    }
    const componentFile = path.resolve(dir, COMPONENT_FILE)
    fs.writeFileSync(componentFile, JSON.stringify(componentData))
  }
}

async function npmInstall(targetPath: string) {
  return new Promise((resolve, reject) => {
    const event = exec('npm', ['install', `--registry=${getNpmRegistry()}`], { stdio: 'inherit', cwd: targetPath })
    event.on('close', (data) => {
      if (data && data > 0)
        reject(new Error('安装依赖失败'))
      else
        resolve(null)
    })
  })
}

async function execStartCommand(targetPath: string, startCommand: string[]) {
  return new Promise((resolve, reject) => {
    const event = exec(startCommand[0], startCommand.slice(1), { stdio: 'inherit', cwd: targetPath })
    event.on('close', (data) => {
      if (data && data > 0)
        reject(new Error('启动失败'))
      else
        resolve(null)
    })
  })
}

async function installTemplate(
  template: TemplateProps,
  projectData: ProjectProps,
) {
  // 安装模板
  const spinnerStart = spinner('正在安装模板...')
  const sourceDir = template.path
  const targetDir = projectData.projectPath
  fse.ensureDirSync(sourceDir)
  fse.ensureDirSync(targetDir)
  fse.copySync(sourceDir, targetDir)
  spinnerStart.stop()
  log.success('模板安装成功')
  // ejs 模板渲染
  const ejsIgnoreFiles = [
    '**/node_modules/**',
    '**/.git/**',
    '**/.vscode/**',
    '**/.DS_Store',
  ]
  if (template.ejsIgnoreFiles)
    ejsIgnoreFiles.push(...template.ejsIgnoreFiles)
  log.verbose('ejsIgnoreFiles', JSON.stringify(ejsIgnoreFiles))
  log.verbose('projectData', JSON.stringify(projectData))
  await renderFiles(targetDir, projectData, {
    ignore: ejsIgnoreFiles,
  })
  // 如果是组件，则进行特殊处理
  await createComponentFile(template, projectData, targetDir)
  // 安装依赖文件
  log.notice('info', '开始安装依赖')
  await npmInstall(targetDir)
  log.success('依赖安装成功')
  // 启动代码
  if (template.startCommand) {
    log.notice('init', '开始执行启动命令')
    const startCommand = template.startCommand.split(' ')
    await execStartCommand(targetDir, startCommand)
  }
}

async function installExecutableTemplate(
  template: TemplateProps,
  projectData: ProjectProps,
) {
  const pkgPath = path.resolve(template.sourcePath, 'package.json')
  const pkg = fse.readJsonSync(pkgPath)
  const rootFile = path.resolve(template.sourcePath, pkg.main)
  if (!fs.existsSync(rootFile))
    throw new Error('入口文件不存在！')
  log.notice('info', '开始执行自定义模板')
  const targetPath = projectData.projectPath
  await execExecutableTemplate(rootFile, {
    targetPath,
    ...projectData,
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

async function installGitTemplate(
  template: TemplateProps,
  projectData: ProjectProps,
) {
  const targetDir = projectData.projectPath
  // 如果是组件，则进行特殊处理
  await createComponentFile(template, projectData, targetDir)
  // 安装依赖文件
  log.notice('info', '开始安装依赖')
  await npmInstall(targetDir)
  log.success('依赖安装成功')
  // 启动代码
  if (template.startCommand) {
    log.notice('init', '开始执行启动命令')
    const startCommand = template.startCommand.split(' ')
    await execStartCommand(targetDir, startCommand)
  }
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
      await installTemplate(template, project)
    }
    else if (template.templateType === TEMPLATE_TYPE_EXECUTABLE) {
      await installExecutableTemplate(template, project)
    }
    else if (template.templateType === TEMPLATE_TYPE_GIT) {
      await installGitTemplate(template, project)
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
