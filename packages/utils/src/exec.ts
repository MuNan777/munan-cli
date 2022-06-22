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

export default exec
