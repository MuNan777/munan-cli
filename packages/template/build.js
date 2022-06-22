const path = require('path')
const fse = require('fs-extra')

const build = () => {
  try {
    const files = fse.readdirSync(path.resolve(__dirname, '../'))
    if (files) {
      const templateConfigs = []
      files.forEach((file) => {
        if (/.*-template/.test(file)) {
          const pkgs = []
          if (/.*-template/.test(file)) {
            const pkg = fse.readJSONSync(path.resolve(__dirname, `../${file}`, 'package.json'))
            pkgs.push(pkg)
          }
          if (pkgs) {
            pkgs.forEach((pkg) => {
              const config = pkg.templateConfig
              if (config)
                templateConfigs.push(config)
            })
          }
        }
      })
      const pkgPath = path.resolve(__dirname, 'package.json')
      const pkg = fse.readJSONSync(pkgPath)
      pkg.templateConfigs = templateConfigs
      fse.writeJSONSync(pkgPath, pkg)
    }
  }
  catch (err) {
    console.error('构建 templateConfigs 失败', err.stack)
  }
}

build()
