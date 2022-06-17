const axios = require('axios')
const urlJoin = require('url-join')
const semver = require('semver')

// 获取 registry 信息
function getNpmRegistry(isOriginal = false) {
  return isOriginal
    ? 'https://registry.npmjs.org'
    : 'https://registry.npm.taobao.org'
}

// 从 registry 获取 npm 的信息
function getNpmInfo(npm, registry) {
  const register = registry || getNpmRegistry()
  const url = urlJoin(register, npm)
  console.log(url)
  return axios.get(url).then((response) => {
    try {
      if (response.status === 200) {
        return response.data
      }
      return null
    } catch (error) {
      return Promise.reject(error)
    }
  })
}

// 获取某个 npm 的最新版本号
function getLatestVersion(npm, registry) {
  return getNpmInfo(npm, registry).then((data) => {
    if (!data['dist-tags'] || !data['dist-tags'].latest) {
      console.error('没有 latest 版本号', data)
      return Promise.reject(new Error('Error: 没有 latest 版本号'))
    }
    const latestVersion = data['dist-tags'].latest
    return latestVersion
  })
}

// 获取某个 npm 的所有版本号
function getVersions(npm, registry) {
  return getNpmInfo(npm, registry).then((body) => {
    const versions = Object.keys(body.versions)
    return versions
  })
}

// 根据指定 version 获取符合 semver 规范的最新版本号
function getLatestSemverVersion(baseVersion, versions) {
  const versionLists = versions
    .filter((version) => {
      return semver.satisfies(version, `^${baseVersion}`)
    })
    .sort((a, b) => {
      return semver.gt(b, a)
    })
  return versionLists[0]
}

// 根据指定 version 和包名获取符合 semver 规范的最新版本号
function getNpmLatestSemverVersion(npm, baseVersion, registry) {
  return getVersions(npm, registry).then((versions) => {
    return getLatestSemverVersion(baseVersion, versions)
  })
}

module.exports = {
  getNpmRegistry,
  getNpmInfo,
  getLatestVersion,
  getNpmLatestSemverVersion,
}
