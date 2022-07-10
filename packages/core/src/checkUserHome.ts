import fs from 'fs'
import userHome from 'user-home'
import colors from 'colors/safe'

// 检查用户主目录
export function checkUserHome() {
  if (!userHome || !fs.existsSync(userHome))
    throw new Error(colors.red('当前登录用户不存在主目录'))
}
