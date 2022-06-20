import { createConfig } from '../../rollup.config.base'
import pkg from './package.json'

const entries = {
  index: 'src/index.ts',
  config: 'src/config.ts',
}

export default createConfig(entries, pkg)
