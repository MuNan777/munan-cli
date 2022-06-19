const inquirer = require('inquirer')

module.exports = async ({
  choices,
  defaultValue,
  message,
  type = 'list',
  require = true,
  mask = '*',
}) => {
  const options = {
    type,
    name: 'name',
    message,
    default: defaultValue,
    require,
    mask,
  }
  if (type === 'list') {
    options.choices = choices
  }
  const answer = await inquirer.prompt(options)
  return answer.name
}
