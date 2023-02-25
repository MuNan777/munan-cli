const path = require('path')

const fse = require('fs-extra')
const inquirer = require('./utils/inquirer')
const render = require('./utils/render')
const packageJson = require('./package.json')

module.exports = async function (options) {
  // eslint-disable-next-line no-console
  console.log(options)
  // 注意如果添加参数需要在下方 ejsData 补上
  let description = ''
  let access = ''
  let region = ''
  let fcName = ''
  while (!access) {
    access = await inquirer({
      type: 'string',
      message: '云函数密钥名称（https://www.serverless-devs.com/serverless-devs/command/config）',
      defaultValue: '',
    })
  }
  while (!region) {
    region = await inquirer({
      type: 'string',
      message: '云函数区域 (例如：cn-hangzhou)',
      defaultValue: '',
    })
  }
  while (!fcName) {
    fcName = await inquirer({
      type: 'string',
      message: '云函数名称',
      defaultValue: '',
    })
  }
  while (!description) {
    description = await inquirer({
      type: 'string',
      message: '请输入描述信息',
      defaultValue: '',
    })
  }
  let pgDb = ''
  let pgUser = ''
  let pgPassword = ''
  let pgPort = ''
  while (!pgDb) {
    pgDb = await inquirer({
      type: 'string',
      message: 'pg数据库名称',
      defaultValue: '',
    })
  }
  while (!pgUser) {
    pgUser = await inquirer({
      type: 'string',
      message: 'pg 数据库用户[postgres]',
      defaultValue: '',
    })
    if (pgUser === '')
      pgUser = 'postgres'
  }
  while (!pgPassword) {
    pgPassword = await inquirer({
      type: 'string',
      message: 'pg 用户密码',
      defaultValue: '',
    })
  }
  while (!pgPort) {
    pgPort = await inquirer({
      type: 'number',
      message: 'pg 数据库端口[5432]',
      defaultValue: '',
    })
    if (pgPort === '')
      pgPort = 5432
  }
  const sourceDir = options.templatePath || path.resolve(__dirname, 'template')
  const targetDir = options.targetPath
  fse.ensureDirSync(sourceDir)
  fse.ensureDirSync(targetDir)
  fse.copySync(sourceDir, targetDir)
  const ejsIgnoreFiles = [
    '**/node_modules/**',
    '**/.git/**',
    '**/.vscode/**',
    '**/.DS_Store',
    '**/public/**',
    '**/node-v16.14.2-linux-x64/**',
  ]
  const ejsData = Object.assign({}, options, { description, access, region, fcName, pgDb, pgUser, pgPassword, pgPort })
  await render(targetDir, ejsData, {
    ignore: ejsIgnoreFiles,
  })
  const commands = packageJson.templateConfig.startCommand.split(' ')
  await npminstall(targetDir)
  await execStartCommand(targetDir, commands)
}

async function execStartCommand(targetPath, startCommand) {
  return new Promise((resolve, reject) => {
    const p = exec(startCommand[0], startCommand.slice(1), { stdio: 'inherit', cwd: targetPath })
    p.on('error', (e) => {
      reject(e)
    })
    p.on('exit', (c) => {
      resolve(c)
    })
  })
}

async function npminstall(targetPath) {
  return new Promise((resolve, reject) => {
    const p = exec('npm', ['install'], { stdio: 'inherit', cwd: targetPath })
    p.on('error', (e) => {
      reject(e)
    })
    p.on('exit', (c) => {
      resolve(c)
    })
  })
}

function exec(command, args, options) {
  const win32 = process.platform === 'win32'

  const cmd = win32 ? 'cmd' : command
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args

  return require('child_process').spawn(cmd, cmdArgs, options || {})
}