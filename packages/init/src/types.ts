export interface TemplateProps {
  path: string
  sourcePath: string
  moduleName: string
  templateName: string
  templateType: string
  templateTag: string
  templateVersion: string
  startCommand: string
  buildPath: string
  ejsIgnoreFiles: string[]
  examplePath?: string
  gitRepository?: string
}

export interface ProjectProps {
  projectPath: string
  projectName: string
  packageName: string
  description?: string
}
