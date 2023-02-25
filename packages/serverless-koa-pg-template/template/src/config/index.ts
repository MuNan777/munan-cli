import { isProd } from '../utils/env'
import dev from './env/dev'
import prod from './env/prod.ts'

export * from './constant'

let config: typeof dev = dev
if (isProd)
  config = Object.assign(config, prod)

export default config
