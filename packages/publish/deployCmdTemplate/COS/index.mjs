import path from 'path'
import fse from 'fs-extra'
import { exec, getDirName, log, prompt, renderFiles } from '@munan-cli/utils'

const targetDirName = 'munan-cli-deploy'

export const createFn = async () => {
  const packagePath = path.resolve(process.cwd(), 'package.json')
  const pkg = fse.readJSONSync(packagePath)
  let deployCmd = 'deploy:cos'
  deployCmd = await prompt({
    type: 'input',
    message: '请输入发布命令',
    defaultValue: deployCmd,
  })
  const keys = Object.keys(pkg.scripts)
  while (keys.includes(deployCmd) && deployCmd !== '') {
    log.error(`${deployCmd} 发布命令已存在`)
    deployCmd = ''
    deployCmd = await prompt({
      type: 'input',
      message: '请输入新的发布命令，以 deploy 开头',
    })
  }
  let secretId = ''
  while (!secretId) {
    secretId = await prompt({
      type: 'input',
      message: '请输入 cos secret Id',
      defaultValue: '',
    })
  }
  let secretKey = ''
  while (!secretKey) {
    secretKey = await prompt({
      type: 'input',
      message: '请输入 cos secret key',
      defaultValue: '',
    })
  }
  let location = ''
  while (!location) {
    location = await prompt({
      type: 'input',
      message: '请输入 cos location',
      defaultValue: '',
    })
  }
  let bucketName = ''
  while (!bucketName) {
    bucketName = await prompt({
      type: 'input',
      message: '请输入 cos bucket name',
      defaultValue: '',
    })
  }
  let distName = ''
  while (!distName) {
    distName = await prompt({
      type: 'input',
      message: '请输入打包路径',
      defaultValue: 'dist',
    })
  }
  try {
    log.notice('info', '开始创建配置')
    const sourceDir = path.resolve(getDirName(import.meta.url), '.', 'template')
    const targetDir = path.resolve(process.cwd(), `${targetDirName}-cos`)
    fse.ensureDirSync(sourceDir)
    fse.ensureDirSync(targetDir)
    fse.copySync(sourceDir, targetDir)
    await renderFiles(targetDir, { secretId, secretKey, location, bucketName, distName })
    log.success('配置创建成功')
    log.notice('info', '添加执行命令')
    pkg.scripts[deployCmd] = `node ./${targetDirName}-cos/index.js`
    pkg.scripts[`${deployCmd}:cloud`] = `node ./${targetDirName}-cos/cloud.js`
    fse.writeJSONSync(packagePath, pkg, { spaces: 2 })
    const gitignoreConfig = `
# munan-cli-deoploy config
${targetDirName}-cos/config`
    if (fse.existsSync('./.gitignore'))
      fse.writeFileSync('./.gitignore', gitignoreConfig, { flag: 'a+' })
    log.success('添加执行命令成功')
    log.notice('info', '安装所需依赖')
    const packages = ['cos-nodejs-sdk-v5', 'inquirer@^7.3.3']
    for (const p of packages) {
      await new Promise((resolve, reject) => {
        const event = exec('npm', ['install'].concat([p, '-D']), {
          stdio: 'inherit',
          cwd: process.cwd(),
        })
        event.on('close', (data) => {
          if (data && data > 0)
            reject(new Error('安装依赖失败'))
          else
            resolve(null)
        })
      })
    }
    log.success('安装所需依赖成功')
    log.success(`配置创建成功, ./${targetDirName}-cos`)
    log.success(`可对 ./${targetDirName}-cos/index.js 进行进一步调整`)
    log.success(`可执行 npm run ${deployCmd} 尝试发布`)
  }
  catch (err) {
    log.error('error', '配置创建失败')
    log.error('Error:', err.stack)
  }
}

export default createFn
