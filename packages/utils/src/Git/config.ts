const GITHUB = 'github'
const GITEE = 'gitee'
const REPO_OWNER_USER = 'user' // 用户仓库
const REPO_OWNER_ORG = 'org' // 组织仓库

export default {
  DEFAULT_CLI_HOME: '.munan-cli', // 脚手架默认主目录
  GIT_ROOT_DIR: '.git-root', // git 缓存目录
  GIT_SERVER_FILE: '.git_server', // git 服务缓存目录
  GITHUB,
  GITEE,
  GIT_SERVER_TYPE: [{
    name: 'Github',
    value: GITHUB,
  }, {
    name: 'Gitee(码云)',
    value: GITEE,
  }],
  GIT_TOKEN_FILE: '.git_token',
  GIT_OWN_FILE: '.git_own',
  GIT_LOGIN_FILE: '.git_login',
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
}
