import { getLatestVersion, getNpmInfo, getNpmRegistry, log } from '@munan-cli/utils'

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
    const result = await getNpmInfo('@munan-cli/template', getNpmRegistry())
    const latestVersion = await getLatestVersion('@munan-cli/template', getNpmRegistry())
    const list = result.versions[latestVersion].templateConfigs
    // list.push({
    //   moduleName: '@munan-cli/git-test-template',
    //   templateName: 'git-test 模板',
    //   templateType: 'executable',
    //   templateTag: 'project',
    //   startCommand: 'npm run dev',
    //   buildPath: 'dist',
    //   ejsIgnoreFiles: ['**/node_modules/**'],
    //   gitRepository: 'https://gitee.com/dpush/d-push-admin-web.git',
    // })
    return list
  }
  catch (err) {
    log.error('error', err)
    return []
  }
}
