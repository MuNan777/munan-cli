import { log } from '@munan-cli/utils'
import baseConfig from './config'
import { prepare } from './prepare'
import { installGitTemplate } from './installGitTemplate'
import { installTemplate } from './installTemplate'
import { installExecutableTemplate } from './installExecutableTemplate'
import { downloadTemplate } from './downloadTemplate'

const {
  TEMPLATE_TYPE_GENERAL,
  TEMPLATE_TYPE_EXECUTABLE,
  TEMPLATE_TYPE_GIT,
} = baseConfig

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
