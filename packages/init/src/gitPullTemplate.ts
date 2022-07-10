import fs from 'fs'

import fse from 'fs-extra'
import { exec, prompt } from '@munan-cli/utils'
import type { TemplateConfig } from './get-template'

// 拉取模板代码
export async function gitPullTemplate(opt: { selectedTemplate: TemplateConfig; projectName: string; projectPath: string }) {
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
