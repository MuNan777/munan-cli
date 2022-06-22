import { getLatestVersion, getNpmInfo, getNpmRegistry, log } from '@munan-cli/utils'

export interface TemplateConfig {
  moduleName: string
  templateName: string
  templateType: string
  templateTag: string
  startCommand: string
  buildPath: string
  ejsIgnoreFiles: string[]
}

export async function getTemplates(): Promise<TemplateConfig[]> {
  try {
    const result = await getNpmInfo('@munan-cli/template', getNpmRegistry())
    const latestVersion = await getLatestVersion('@munan-cli/template', getNpmRegistry())
    return result.versions[latestVersion].templateConfigs
  }
  catch (err) {
    log.error('error', err)
    return []
  }
}
