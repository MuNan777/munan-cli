import path from 'path'
import url from 'url'

import { lookup } from 'es-mime-types'

import Log from './log'
import FormatPath from './formatPath'
import p from './Package'
import Exec from './exec'

export * from './npm'
export * from './inquirer'
export * from './ejs'
export const Package = p
export const log = Log
export const formatPath = FormatPath
export const exec = Exec

export function getDirName(importMetaUrl: string) {
  return path.dirname(getFileName(importMetaUrl))
}

export function getFileName(importMetaUrl) {
  return url.fileURLToPath(importMetaUrl)
}

export function isImage(filename: string) {
  const result = lookup(path.extname(filename))
  return /image\/.*/.test(`${result}`)
}
