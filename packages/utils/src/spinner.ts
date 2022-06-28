import ora from 'ora'

export default function (msg: string) {
  const spinner = ora(msg)
  spinner.start()
  return spinner
}
