import fs from 'fs'
import path from 'path'

import { Package, getVersions, log, prompt } from '@munan-cli/utils'
import type { TemplateConfig } from './get-template'
import { gitPullTemplate } from './gitPullTemplate'

function createTemplateChoice(list: TemplateConfig[]) {
  return list.map(item => ({
    value: item.moduleName,
    name: item.templateName,
  }))
}

export async function downloadTemplate(
  templateList: TemplateConfig[],
  options: {
    debug?: boolean
    projectPath: string
    projectName: string
    cliHome?: any
    selectTemplateVersion?: boolean
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
  let templateVersion = '1.0.0'
  if (options.selectTemplateVersion) {
    templateVersion = await prompt<string>({
      type: 'list',
      choices: versions.map((item: string) => ({
        value: item,
        name: item,
      })),
      message: '请选择模板版本',
    })
  }

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
        useCurrentPackageVersion: !!options.selectTemplateVersion,
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
