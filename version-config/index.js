const crossEnv = require('cross-env')
const env = require('./env.json')
// 自行配置 env.json (https://github.com/settings/tokens) 权限：repo, write:packages
/**
  {
    "GITHUB_TOKEN": "..."
  }
 */
if (env.GITHUB_TOKEN) {
  const argv = process.argv.slice(2)
  argv.unshift(`GITHUB_TOKEN=${env.GITHUB_TOKEN}`)
  crossEnv(argv)
}
