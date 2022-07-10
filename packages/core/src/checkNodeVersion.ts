import semver from 'semver'
import colors from 'colors/safe'
import baseConfig from './config'

const {
  LOWEST_NODE_VERSION,

} = baseConfig

// 检查 node 版本
export function checkNodeVersion(): void {
  if (!semver.gte(process.version, LOWEST_NODE_VERSION)) {
    throw new Error(
      colors.red(
        `munan-cli 需要安装 v${LOWEST_NODE_VERSION} 以上版本的 Node.js`,
      ),
    )
  }
}
