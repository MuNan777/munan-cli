import fs from 'fs'
import { homedir } from 'os'
import colors from 'colors/safe'

// 检查用户主目录
export function checkUserHome() {
  const userHome = homedir()
  if (!userHome || !fs.existsSync(userHome))
    throw new Error(colors.red('当前登录用户不存在主目录'))
}
