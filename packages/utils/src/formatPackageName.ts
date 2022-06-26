const KEBAB_REGEX = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g

export function formatPackageName(name: string) {
  if (name) {
    name = `${name}`.trim()
    if (name) {
      if (/^[.*_\/\\()&^!@#$%+=?<>~`\s]/.test(name))
        name = name.replace(/^[.*_\/\\()&^!@#$%+=?<>~`\s]+/g, '')

      name = name.replace(KEBAB_REGEX, (match: string) => {
        return `-${match.toLowerCase()}`
      })

      return name.replace(/^-/, '')
    }
    else {
      return name
    }
  }
  else {
    return name
  }
}
