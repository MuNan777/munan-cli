import semver from 'semver'
import colors from 'colors/safe'

import { getNpmLatestSemverVersion, getNpmRegistry, log } from '@munan-cli/utils'
import packageConfig from '../package.json'
import baseConfig from './config'
import type { configProps } from './types'

const {
  NPM_NAME,
} = baseConfig

// 检查工具是否需要更新
export async function checkGlobalUpdate(opt: { config: configProps }) {
  log.verbose('info', '检查工具是否需要更新')
  const currentVersion = packageConfig.version
  const lastVersion = await getNpmLatestSemverVersion(
    NPM_NAME,
    currentVersion,
    getNpmRegistry(opt.config.useOriginNpm),
  )
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      'warn',
      colors.yellow(`请手动更新 ${NPM_NAME}，当前版本：${packageConfig.version}，最新版本：${lastVersion}
                更新命令： npm install -g ${NPM_NAME}`),
    )
  }
}
