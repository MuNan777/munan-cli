import type { AxiosResponse } from 'axios'
import { log } from '@munan-cli/utils'

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

  getRepo = (_repo: string, _owner: string) => {
    error('getRepo')
  }

  createRepo = (_repo: string) => {
    error('createRepo')
  }

  createOrgRepo = (_repo: string, _owner: string) => {
    error('createOrgRepo')
  }

  getRemote = (_repo: string, _owner: string, _token?: string) => {
    error('getRemote')
  }

  getSSHKeysUrl = () => {
    error('getSSHKeysUrl')
  }

  getSSHKeysHelpUrl = () => {
    error('getSSHKeysHelpUrl')
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
    if (this.isHttpResponse(response) && response.status !== 200) {
      if (response.data) {
        if (response.data.message)
          log.verbose('error', response.data.message)
        else
          log.verbose('error', response.data)
      }
      return null
    }
    else { return response }
  }
}

export default GitServer
