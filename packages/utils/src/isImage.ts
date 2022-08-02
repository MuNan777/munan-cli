import path from 'path'

import { lookup } from 'es-mime-types'

export function isImage(filename: string) {
  const result = lookup(path.extname(filename))
  return /image\/.*/.test(`${result}`)
}
