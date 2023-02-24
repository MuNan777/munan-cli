const path = require('path')

const fse = require('fs-extra')
const inquirer = require('./utils/inquirer')
const render = require('./utils/render')
const packageJson = require('./package.json')

module.exports = async function (options) {
  // eslint-disable-next-line no-console
  console.log(options)
  // 注意如果添加参数需要在下方 ejsData 补上
  let appId = ''
  let productName = ''
  let author = ''
  let description = ''
  while (!author) {
    author = await inquirer({
      type: 'string',
      message: '作者 (可在 package.json 修改)',
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
  while (!appId) {
    appId = await inquirer({
      type: 'string',
      message: '应用 id (可在 package.json 修改)',
      defaultValue: '',
    })
  }
  while (!productName) {
    productName = await inquirer({
      type: 'string',
      message: '应用名称 (可在 package.json 修改)',
      defaultValue: '',
    })
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
  ]
  const ejsData = Object.assign({}, options, { author, appId, description, productName })
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
