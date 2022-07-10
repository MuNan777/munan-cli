import path from 'path'
import fs from 'fs'

import { Package, exec, log } from '@munan-cli/utils'
import type minimist from 'minimist'
import type { ExtendOptions, coreOptions } from './types'
import baseConfig from './config'

const {
  DEPENDENCIES_PATH,
} = baseConfig

// 执行命令
export function execCommandWrapper(opt: coreOptions) {
  const { config, args } = opt
  return async function execCommand(
    { packagePath, packageName, packageVersion }: { packageName: string; packageVersion: string; packagePath: any },
    extendOptions: ExtendOptions,
  ) {
    let rootFile: string
    try {
      if (packagePath) {
        const execPackage = new Package({
          targetPath: packagePath,
          storePath: packagePath,
          name: packageName,
          packageVersion,
        })
        // 包的根文件路径
        rootFile = await execPackage.getRootFilePath(true) || ''
      }
      else {
        const { cliHome } = config
        const packageDir = `${DEPENDENCIES_PATH}`
        const targetPath = path.resolve(cliHome, packageDir)
        const storePath = path.resolve(targetPath, 'node_modules')
        const initPackage = new Package({
          targetPath,
          storePath,
          name: packageName,
          packageVersion,
        })
        // 判断是否已经安装
        if (await initPackage.exists()) {
          // 如果已经安装，则尝试更新包
          await initPackage.update()
        }
        else {
          // 如果未安装，则安装包
          await initPackage.install()
        }
        // 包的根文件路径
        rootFile = await initPackage.getRootFilePath() || ''
      }
      const _config = { ...config, ...extendOptions, debug: args.debug }
      if (fs.existsSync(rootFile)) {
        const code = `import('file://${rootFile}').then(callback => callback.default(${JSON.stringify(_config)}))`
        const pack = exec('node', ['--experimental-modules', '-e', code], { stdio: 'inherit' })
        pack.on('error', (e) => {
          log.verbose('命令执行失败', `${e}`)
          handleError(e, args)
        })

        pack.on('exit', (c) => {
          log.verbose('命令执行完成', `${c}`)
          process.exit(c || 0)
        })
      }
      else {
        throw new Error('入口文件不存在，请重试！')
      }
    }
    catch (err) {
      log.error('error', err.message)
    }
  }
}

function handleError(e: Error, args: minimist.ParsedArgs) {
  if (args.debug)
    log.error('Error', JSON.stringify(e.stack))
  else
    log.error('Error', e.message)

  process.exit(1)
}
