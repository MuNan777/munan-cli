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
    return list
  }
  catch (err) {
    log.error('error', err)
    return []
  }
}
