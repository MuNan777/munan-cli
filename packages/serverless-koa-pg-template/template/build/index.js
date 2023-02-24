const fse = require('fs-extra')
const path = require('path')
const packageJson = require('../package.json')
const codePackageJson = require('../code/package.json')
codePackageJson.dependencies = packageJson.dependencies
fse.writeJSONSync(path.resolve(__dirname, '../code', 'package.json'), codePackageJson, { spaces: 2 })