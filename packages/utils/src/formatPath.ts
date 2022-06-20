import path from 'path'

function formatPath (p: string) {
  const { sep } = path
  if (sep === '/') {
    return p
  }
  return p.replace(/\\/g, '/')
}

export default formatPath
