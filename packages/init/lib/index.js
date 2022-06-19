const fs = require('fs')
const { log, inquirer } = require('@munan-cli/utils')

async function prepare(opt) {
  let files = fs.readdirSync(process.cwd())
  // node_modules 模块文件夹 .git 版本控制文件 .DS_Store 文件夹描述文件（macOS）
  files = files.filter(
    (file) => ['node_modules', '.git', '.DS_Store'].indexOf(file) !== -1
  )
  log.verbose('files', files)
  let isContinueWhenDirNotEmpty = true
  if (files && files.length > 0) {
    isContinueWhenDirNotEmpty = await inquirer({
      type: 'confirm',
      message: '当前文件夹不为空，是否继续创建项目？',
      defaultValue: false,
    })
  }
  if (!isContinueWhenDirNotEmpty) {
    return
  }
  console.log('init')
}

async function init(opt) {
  console.log('init')
  try {
    // 设置 targetPath
    const targetPath = process.cwd()
    const options = opt
    if (!options.targetPath) {
      options.targetPath = targetPath
    }
    log.verbose('init', options)
  } catch (e) {
    if (opt.debug) {
      log.error('Error:', e.stack)
    } else {
      log.error('Error:', e.message)
    }
  }
}

module.exports = init
