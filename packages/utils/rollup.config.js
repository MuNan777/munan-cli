import { createConfig } from '../../rollup.config.base'
import pkg from './package.json'

const entries = {
  index: 'src/index.ts',
  exec: 'src/exec.ts',
  formatPath: 'src/formatPath.ts',
  inquirer: 'src/inquirer.ts',
  log: 'src/log.ts',
  npm: 'src/npm.ts',
  Package: 'src/Package.ts',
}

export default createConfig(entries, pkg)
