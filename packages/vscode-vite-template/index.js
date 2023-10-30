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
  while (!description) {
    description = await inquirer({
      type: 'string',
      message: '请输入描述信息',
      defaultValue: '',
    })
  }
  const sourceDir = options.templatePath || path.resolve(__dirname, 'template')
  const targetDir = options.targetPath || path.resolve(process.cwd(), options.name)
  if (!options.packageName)
    options.packageName = options.name

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
  const ejsData = Object.assign({}, options, { description })
  await render(targetDir, ejsData, {
    ignore: ejsIgnoreFiles,
  })
  const commands = packageJson.templateConfig.startCommand.split(' ')
  await npmInstall(targetDir)
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

async function npmInstall(targetPath) {
  const install = await chooseInstall()
  return new Promise((resolve, reject) => {
    const p = exec(install, ['install'], { stdio: 'inherit', cwd: targetPath })
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

async function chooseInstall() {
  const { install } = await inquirer({
    type: 'list',
    name: 'install',
    message: '请选择安装方式',
    choices: [
      { name: 'npm', value: 'npm' },
      { name: 'yarn', value: 'yarn' },
      { name: 'pnpm', value: 'pnpm' },
    ],
  })
  return install
}
