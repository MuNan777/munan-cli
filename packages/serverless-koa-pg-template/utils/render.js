const path = require('path')
const glob = require('glob')
const ejs = require('ejs')
const fse = require('fs-extra')
const get = require('lodash/get')

module.exports = async function (dir, options, extraOptions) {
  const ignore = get(extraOptions, 'ignore')
  // eslint-disable-next-line no-console
  console.log('ignore', ignore)
  return new Promise((resolve, reject) => {
    glob('**', {
      cwd: dir,
      nodir: true,
      ignore: ignore || ['**/node_modules/**', '**/node-v16.14.2-linux-x64/**'],
    }, (err, files) => {
      if (err)
        return reject(err)

      // eslint-disable-next-line no-console
      console.log('render files:', files)

      Promise.all(files.map((file) => {
        const filepath = path.join(dir, file)
        return renderFile(filepath, options)
      })).then(() => {
        resolve()
      }).catch((err) => {
        reject(err)
      })
    })
  })
}

function renderFile(filepath, options) {
  let filename = path.basename(filepath)

  if (filename.includes('.png') || filename.includes('.jpg')) {
    // console.log('renderFile:', filename);
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    ejs.renderFile(filepath, options, (err, result) => {
      if (err)
        return reject(err)

      if (/\.ejs$/.test(filepath)) {
        filename = filename.replace(/\.ejs$/, '')
        fse.removeSync(filepath)
      }

      const newFilepath = path.join(filepath, '../', filename)
      fse.writeFileSync(newFilepath, result)
      resolve(newFilepath)
    })
  })
}
