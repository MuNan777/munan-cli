const env = require('./env.json')
const crossEnv = require('cross-env')
// 自行配置 env.json (https://github.com/settings/tokens) 权限：repo, write:packages
/**
  {
    "GH_TOKEN": "..."
  }
 */
if (env.GH_TOKEN) {
  const argv = process.argv.slice(2)
  argv.unshift(`GH_TOKEN=${env.GH_TOKEN}`)
  crossEnv(argv)
}
