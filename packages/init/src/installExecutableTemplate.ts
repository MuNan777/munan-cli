import fs from 'fs'
import path from 'path'

import fse from 'fs-extra'
import { log } from '@munan-cli/utils'
import { execExecutableTemplate } from './execExecutableTemplate'
import type { ProjectProps, TemplateProps } from './types'

// 安装可执行模板
export async function installExecutableTemplate(
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
