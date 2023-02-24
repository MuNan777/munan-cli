import simpleGit from 'simple-git'
import { isDev } from '../../../utils/env'
import seq from '../index'
import '../../../models/index'
import UserModel from '../../../models/user'
import { signUp } from '../../../controller/user'

// 同步数据表
async function syncDB() {
  let needToSyncDb = true
  // 只适用于开发环境！！！
  if (isDev) {
    // 开发环境下，修改频繁，每次重启都同步数据表，消耗太大
    // 如果是，则同步数据表。否则，不用同步数据表。
    try {
      const git = simpleGit()
      // 获取 git status 修改的文件，modified 格式如  [ '.gitignore', 'package.json', 'src/models/README.md' ]
      const {
        modified,
        not_added: nodeAdded,
        created,
        deleted,
        renamed,
      } = await git.status()
      const fileChanged = modified
        .concat(nodeAdded)
        .concat(created)
        .concat(deleted)
      // .concat(renamed)
      if (fileChanged.length) {
        // 到此，说明 git status 有改动
        // 是否改动了 db 相关的文件
        const changedDbFiles = fileChanged.some((f) => {
          // 改动了 src/models/ ，需要同步数据库
          if (f.includes('src/models/'))
            return true
          // 改动了 src/db/sequelize ，需要同步数据库
          if (f.includes('src/db/sequelize/'))
            return true
          // 其他情况，不同步
          return false
        })
        // 没改动 db 文件，则不需要同步
        if (!changedDbFiles)
          needToSyncDb = false
      }
      // 如果 git status 没有改动，则照常同步数据表，重要！！！
    }
    catch (err) {
      console.error(`
      ================================================================
      1. 请先执行 git init 命令！！！
      2. 同时配置 src/config/env/prod.ts 文件
      3. 填写 src/config/constant.ts 文件中的邮箱配置（不需要的可以自行删除）
      ================================================================
      `)
    }
  }
  if (needToSyncDb) {
    await seq.sync({ alter: true })
    const list = await UserModel.findAll()
    if (!list || list.length === 0)
      await signUp('admin', '123456@a', '123456@qq.com')
  }
}

export default syncDB
