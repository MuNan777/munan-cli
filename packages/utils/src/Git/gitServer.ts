// function error(methodName: string) {
//   throw new Error(`${methodName} must be implemented!`)
// }

class GitServer {
  token: string | null
  type: string

  constructor(type: string, token?: string) {
    this.type = type
    this.token = token || null
  }
}

export default GitServer
