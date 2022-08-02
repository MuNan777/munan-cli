import validate from 'validate-npm-package-name'

export function validatePackageName(name: string) {
  const result = validate(name)
  return result.validForNewPackages
}
