import path from 'path'

import dotenv from 'dotenv'
import userHome from 'user-home'
import { log } from '@munan-cli/utils'
import baseConfig from './config'
import type { configProps } from './types'

const {
  DEFAULT_CLI_HOME,
  USE_ORIGIN_NPM,
} = baseConfig

// 检查环境变量
export function checkEnv(opt: { config: configProps }) {
  log.verbose('info', '开始检查环境变量')
  dotenv.config({
    path: path.resolve(userHome, '.env'),
  })
  opt.config = createCliConfig()
  log.verbose('环境变量', JSON.stringify(opt.config))
}

function createCliConfig() {
  const cliConfig = {
    home: userHome,
    cliHome: '',
    useOriginNpm: true,
  }
  if (process.env.CLI_HOME)
    cliConfig.cliHome = path.join(userHome, process.env.CLI_HOME)
  else
    cliConfig.cliHome = path.join(userHome, DEFAULT_CLI_HOME)

  cliConfig.useOriginNpm = process.env.USE_ORIGIN_NPM
    ? process.env.USE_ORIGIN_NPM !== 'false'
    : USE_ORIGIN_NPM
  return cliConfig
}
