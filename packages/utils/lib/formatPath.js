const path = require('path')

function formatPath(p) {
  const { sep } = path
  if (sep === '/') {
    return p
  }
  return p.replace(/\\/g, '/')
}

module.exports = formatPath
