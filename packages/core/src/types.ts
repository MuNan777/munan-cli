import type minimist from 'minimist'

export interface configProps {
  home: string
  cliHome: string
  useOriginNpm: boolean
}

export interface coreOptions {
  args: minimist.ParsedArgs
  config: configProps
}

export interface InitExtendOptions {
  name: string
  moduleName: string
  selectTemplateVersion: boolean
}

interface PublishExtendOptions {
  refreshToken: boolean
  refreshOwner: boolean
  refreshServer: boolean
  buildCmd: string
  deployCmd: string
  useCNpm: boolean
  usePNpm: boolean
  prod: boolean
  keepCache: boolean
  cliHome: string
  cloudBuild: boolean
  createDeployCmd: boolean
  packageDeploy: boolean
}
export type ExtendOptions = { force?: boolean } & Partial<InitExtendOptions> & Partial<PublishExtendOptions>

