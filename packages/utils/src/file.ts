import path from 'path'
import url from 'url'
import fs from 'fs'
import type { WriteOptions } from 'fs-extra'
import fse from 'fs-extra'

export function getDirName(importMetaUrl: string) {
  return path.dirname(getFileName(importMetaUrl))
}

export function getFileName(importMetaUrl: string) {
  return url.fileURLToPath(importMetaUrl)
}

export function readFile(path: string, options?: { toJson: boolean }) {
  if (fs.existsSync(path)) {
    const buffer = fs.readFileSync(path)
    if (buffer) {
      const result = buffer.toString()
      if (options && options.toJson)
        return JSON.parse(result)
      else
        return result
    }
  }
  else {
    return null
  }
}

export function writeFile(
  path: string,
  data: string | NodeJS.ArrayBufferView,
  options: { rewrite: boolean, flag?: string } = { rewrite: true },
) {
  if (fs.existsSync(path)) {
    if (options.rewrite) {
      fs.writeFileSync(path, data)
      return true
    }
    return false
  }
  else {
    fs.writeFileSync(path, data, { flag: 'a+' })
    return true
  }
}

export function writeJSONFile(
  path: string,
  data: { [key: string]: unknown },
  options?: WriteOptions,
) {
  try {
    let temp = fse.readJSONSync(path)
    temp = Object.assign(temp, data)
    fse.writeJSONSync(path, temp, { spaces: 2, ...options })
    return true
  }
  catch (e) {
    return false
  }
}
