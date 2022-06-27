import type { AxiosResponse } from 'axios'

function error(methodName: string) {
  throw new Error(`${methodName} must be implemented!`)
}

class GitServer {
  token: string | null
  type: string

  constructor(type: string, token?: string) {
    this.type = type
    this.token = token || null
  }

  setToken = (_token: string) => {
    error('setToken')
  }

  getTokenHelpUrl = () => {
    error('getTokenHelpUrl')
  }

  getUser = () => {
    error('getUser')
  }

  getOrgs = () => {
    error('getOrgs')
  }

  getRepo = (_owner: string, _repo: string) => {
    error('getRepo')
  }

  isHttpResponse = (response: AxiosResponse) => {
    return response
      && response.status
      && response.statusText
      && response.headers
      && response.data
      && response.config
  }

  handleResponse = (response: AxiosResponse) => {
    if (this.isHttpResponse(response) && response.status !== 200)
      return null
    else
      return response
  }
}

export default GitServer
