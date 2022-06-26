import path from 'path'
import url from 'url'
import fs from 'fs'

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
  options: { rewrite: boolean } = { rewrite: true },
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
