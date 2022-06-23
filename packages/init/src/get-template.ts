import { getLatestVersion, getNpmInfo, log } from '@munan-cli/utils'

export interface TemplateConfig {
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

export async function getTemplates(): Promise<TemplateConfig[]> {
  try {
    const result = await getNpmInfo('@munan-cli/template')
    const latestVersion = await getLatestVersion('@munan-cli/template')
    const list = result.versions[latestVersion].templateConfigs
    list.push({
      moduleName: '@munan-cli/git-test-template',
      templateName: 'git-test 模板',
      templateType: 'git',
      templateTag: 'project',
      startCommand: 'npm run dev',
      buildPath: 'dist',
      ejsIgnoreFiles: ['**/node_modules/**'],
      gitRepository: 'https://gitee.com/dpush/d-push-admin-web.git',
    }, {
      moduleName: '@munan-cli/webpack-vue2-standard-template',
      templateName: 'webpack-vue2-standard 模板',
      templateType: 'general',
      templateTag: 'project',
      startCommand: 'npm run serve',
      buildPath: 'dist',
      ejsIgnoreFiles: ['**/node_modules/**'],
    })
    return list
  }
  catch (err) {
    log.error('error', err)
    return []
  }
}
