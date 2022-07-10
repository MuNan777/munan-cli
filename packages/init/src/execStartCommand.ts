import { exec } from '@munan-cli/utils'

// 执行命令
export async function execStartCommand(targetPath: string, startCommand: string[]) {
  return new Promise((resolve, reject) => {
    const event = exec(startCommand[0], startCommand.slice(1), { stdio: 'inherit', cwd: targetPath })
    event.on('close', (data) => {
      if (data && data > 0)
        reject(new Error('启动失败'))
      else
        resolve(null)
    })
  })
}
