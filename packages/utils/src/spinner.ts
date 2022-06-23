import { Spinner } from 'cli-spinner'

export default function (msg: string, spinnerString = '|/-\\') {
  const spinner = new Spinner(`${msg} %s`)
  spinner.setSpinnerString(spinnerString)
  spinner.start()
  return spinner
}
