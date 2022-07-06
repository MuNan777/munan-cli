import childProcess from 'child_process'

/**
 * 执行命令
 * @param {*} command
 * @param {*} args
 * @param {*} options
 * @returns
 */
function exec(command: string, args: string[], options: { [key: string]: string }) {
  // 判断平台
  const win32 = process.platform === 'win32'
  // 判断是否是 windows 系统，windows 使用 cmd ['/c'] 执行命令
  const cmd = win32 ? 'cmd' : command
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args

  return childProcess.spawn(cmd, cmdArgs, options || {})
}

export function execCommand(commandStr: string, options: { [key: string]: string } = { stdio: 'inherit' }): Promise<boolean> {
  const commands = commandStr.split(' ')
  if (commands.length === 0)
    return Promise.resolve(false)
  const command = commands[0]
  const argv = commands.slice(1) || []
  return new Promise((resolve, reject) => {
    const event = exec(command, argv, options)
    event.on('close', (data) => {
      if (data && data > 0)
        reject(new Error(`命令 ${commandStr} 执行失败`))
      else
        resolve(true)
    })
  })
}

export default exec
