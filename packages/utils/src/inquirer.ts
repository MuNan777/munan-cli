import inquirer from 'inquirer'

type typeProps = 'number' | 'input' | 'list' | 'checkbox' | 'confirm'

interface ChoicesProps {
  name: string
  value: unknown
}

const Prompt = inquirer.createPromptModule()

export function prompt<T = unknown>({
  choices,
  defaultValue = '',
  message,
  type = 'list',
  require = true,
}: { type: typeProps; message: string; defaultValue?: unknown; choices?: ChoicesProps[]; require?: boolean }) {
  const options = {
    type,
    name: 'name',
    message,
    default: defaultValue,
    require,
  }

  return new Promise<T>((resolve, reject) => {
    Prompt([Object.assign(options, type === 'list' ? { choices } : {})]).then(answer => resolve(answer.name)).catch(error => reject(error))
  })
}
