const GITHUB = 'github'
const GITEE = 'gitee'
const REPO_OWNER_USER = 'user' // 用户仓库
const REPO_OWNER_ORG = 'org' // 组织仓库
const WORKPLACE_GIT_CONFIG_PATH = 'munan-cli.git.config'

const COMPONENT_GITIGNORE = `.DS_Store
node_modules


# local env files
.env.local
.env.*.local

# Log files
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# workplace publish config
${WORKPLACE_GIT_CONFIG_PATH}.mjs
${WORKPLACE_GIT_CONFIG_PATH}.json
`

const PROJECT_GITIGNORE = `.DS_Store
node_modules
/dist

# local env files
.env.local
.env.*.local

# Log files
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# workplace publish config
${WORKPLACE_GIT_CONFIG_PATH}.mjs
${WORKPLACE_GIT_CONFIG_PATH}.json
`

export default {
  DEFAULT_CLI_HOME: '.munan-cli', // 脚手架默认主目录
  GIT_ROOT_DIR: '.git', // git 缓存目录
  GIT_ROOT_CONFIG_NAME: 'munan-cli.git.config', // git 配置文件名称
  GIT_SERVER_NAME: 'gitServer', // git 服务缓存目录
  GIT_TOKEN_NAME: 'gitToken',
  GIT_OWN_NAME: 'gitOwn',
  GIT_LOGIN_NAME: 'gitLogin',
  GIT_PUBLISH_NAME: 'gitPublish',
  GITHUB,
  GITEE,
  GIT_SERVER_TYPE: [{
    name: 'Github',
    value: GITHUB,
  }, {
    name: 'Gitee(码云)',
    value: GITEE,
  }],
  REPO_OWNER_USER,
  REPO_OWNER_ORG,
  GIT_OWNER_TYPE: [{
    name: '个人',
    value: REPO_OWNER_USER, // 用户仓库
  }, {
    name: '组织',
    value: REPO_OWNER_ORG, // 组织仓库
  }],
  GIT_OWNER_TYPE_ONLY: [{
    name: '个人',
    value: REPO_OWNER_USER,
  }],
  GIT_IGNORE_FILE: '.gitignore',
  COMPONENT_FILE: '.componentrc',
  COMPONENT_GITIGNORE,
  PROJECT_GITIGNORE,
  VERSION_RELEASE: 'release',
  VERSION_DEVELOP: 'dev',
  GIT_PUBLISH_TYPE: [{
    name: 'COS',
    value: 'cos',
  }, {
    name: 'OSS',
    value: 'oss',
  }],
}
