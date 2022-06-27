import terminal_Link from 'terminal-link'

export function terminalLink(key: string, url: string) {
  return terminal_Link(key, url || key)
}

