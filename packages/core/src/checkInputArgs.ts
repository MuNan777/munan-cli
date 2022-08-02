import { log } from '@munan-cli/utils'
import minimist from 'minimist'

// 检查用户输入参数
export function checkInputArgs(opt: { args: minimist.ParsedArgs }) {
  log.verbose('info', '检查用户输入参数')
  opt.args = minimist(process.argv.slice(2))
  if (opt.args.d)
    opt.args.debug = true

  checkArgs(opt)
}

function checkArgs(opt: { args: minimist.ParsedArgs }) {
  const { args } = opt
  if (args.debug || args.d)
    process.env.LOG_LEVEL = 'verbose'
  else
    process.env.LOG_LEVEL = 'info'

  log.level = process.env.LOG_LEVEL
}
