import fse from 'fs-extra'
import { createConfig } from '../../rollup.config.base'
import pkg from './package.json'
const { createEntries } = require('../../utils')
const files = fse.readdirSync('src')

const entries = {}

files.forEach((file) => {
  createEntries(file, __dirname, 'src', entries)
})

export default createConfig(entries, pkg)
