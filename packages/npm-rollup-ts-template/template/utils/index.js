const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')

function createEntries(file, dirName, dir, entries) {
  const p = path.resolve(dirName, dir, file)
  const stat = fs.statSync(p)
  if (stat.isFile()) {
    const ext = file.split('.').pop()
    if (ext === 'ts' || ext === 'js' || ext === 'ejs')
      entries[file.split('.')[0]] = `./${dir}/${file}`
  }
  if (stat.isDirectory()) {
    const files = fse.readdirSync(p)
    files.forEach((f) => {
      createEntries(f, dirName, `${dir}/${file}`, entries)
    })
  }
}

module.exports = {
  createEntries,
}
