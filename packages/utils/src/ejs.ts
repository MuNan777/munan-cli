import path from 'path'

import glob from 'glob'
import ejs from 'ejs'
import fse from 'fs-extra'
import { get } from 'lodash-es'
import { lookup } from 'es-mime-types'

import log from './log'

type ExtraOptionsProps = { ignore: string[] } & { [key: string]: unknown }

export async function renderFiles(
  dir: string,
  options: ejs.Data = {},
  extraOptions: ExtraOptionsProps = { ignore: ['**/node_modules/**'] },
) {
  const ignore = get(extraOptions, 'ignore')
  log.verbose('ignore', JSON.stringify(ignore))
  return new Promise((resolve, reject) => {
    glob('**', {
      cwd: dir,
      nodir: true,
      ignore: ignore || '**/node_modules/**',
    }, (err, files) => {
      if (err)
        return reject(err)

      log.verbose('render files:', JSON.stringify(files))

      Promise.all(files.map((file) => {
        const filepath = path.join(dir, file)
        return renderFile(filepath, options)
      })).then(() => {
        resolve(null)
      }).catch((err) => {
        reject(err)
      })
    })
  })
}

function renderFile(filepath: string, options: ejs.Data) {
  let filename = path.basename(filepath)
  const result = lookup(path.extname(filename))
  if (/image\/.*/.test(`${result}`))
    return Promise.resolve()

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
