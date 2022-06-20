import inquirer from 'inquirer'

type typeProps = "number" | "input" | "password" | "list" | "expand" | "checkbox" | "confirm" | "editor" | "rawlist"

interface ChoicesProps {
  name: string
  value: unknown
}

export async function prompt ({
  choices,
  defaultValue,
  message,
  type = 'list',
}: { type: typeProps, message: string, defaultValue: string, choices: ChoicesProps[] }) {
  const options = {
    type,
    name: 'name',
    message,
    default: defaultValue,
    require,
  }
  const answer = await inquirer.prompt(Object.assign(options, type === 'list' ? { choices } : {}))
  return answer.name
}
