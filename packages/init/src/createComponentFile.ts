import path from 'path'
import fs from 'fs'

import baseConfig from './config'
import type { ProjectProps, TemplateProps } from './types'
const {
  TYPE_COMPONENT,
  COMPONENT_FILE,
} = baseConfig

// 如果是组件项目，则创建组件相关文件
export async function createComponentFile(template: TemplateProps, project: ProjectProps, dir: string) {
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
