import { log } from '@munan-cli/utils'
import { createComponentFile } from './createComponentFile'
import { execStartCommand } from './execStartCommand'
import { npmInstall } from './npmInstall'
import type { ProjectProps, TemplateProps } from './types'

export async function installGitTemplate(
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
