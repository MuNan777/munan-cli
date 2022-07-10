import { log, renderFiles, spinner } from '@munan-cli/utils'
import fse from 'fs-extra'
import { createComponentFile } from './createComponentFile'
import { execStartCommand } from './execStartCommand'
import { npmInstall } from './npmInstall'
import type { ProjectProps, TemplateProps } from './types'

// 安装模板
export async function installTemplate(
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
