import path from 'path'
import url from 'url'

import { lookup } from 'es-mime-types'
import validate from 'validate-npm-package-name'

import Log from './log'
import FormatPath from './formatPath'
import p from './Package'
import Exec from './exec'
import Spinner from './spinner'

export * from './npm'
export * from './inquirer'
export * from './ejs'
export const Package = p
export const log = Log
export const formatPath = FormatPath
export const exec = Exec
export const spinner = Spinner

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

export function validatePackageName(name: string) {
  const result = validate(name)
  return result.validForNewPackages
}

const KEBAB_REGEX = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g

export function formatPackageName(name: string) {
  if (name) {
    name = `${name}`.trim()
    if (name) {
      if (/^[.*_\/\\()&^!@#$%+=?<>~`\s]/.test(name))
        name = name.replace(/^[.*_\/\\()&^!@#$%+=?<>~`\s]+/g, '')

      name = name.replace(KEBAB_REGEX, (match: string) => {
        return `-${match.toLowerCase()}`
      })

      return name.replace(/^-/, '')
    }
    else {
      return name
    }
  }
  else {
    return name
  }
}
