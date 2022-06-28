import GitServer from './gitServer'
import GithubRequest from './githubRequest'

class Github extends GitServer {
  request: any
  constructor() {
    super('github')
  }

  getTokenHelpUrl = () => {
    return 'https://github.com/settings/tokens'
  }

  setToken = (token: string) => {
    this.request = new GithubRequest(token)
  }

  getUser = async () => {
    const response = await this.request.get('/user')
    return this.handleResponse(response)
  }

  getOrgs = async () => {
    const response = await this.request.get('/user/orgs', {
      page: 1,
      per_page: 100,
    })
    return this.handleResponse(response)
  }

  getRepo = async (repo: string, owner: string) => {
    const response = await this.request.get(`/repos/${owner}/${repo}`)
    return this.handleResponse(response)
  }

  createRepo = async (repo: string) => {
    const response = await this.request.post('/user/repos', {
      name: repo,
    }, {
      Accept: 'application/vnd.github.v3+json',
    })
    return this.handleResponse(response)
  }

  createOrgRepo = async (repo: string, owner: string) => {
    const response = await this.request.post(`/orgs/${owner}/repos`, {
      name: repo,
    }, {
      Accept: 'application/vnd.github.v3+json',
    })
    return this.handleResponse(response)
  }

  getRemote = (repo: string, owner: string, token?: string) => {
    return `https://${token}@github.com/${owner}/${repo}.git`
  }

  getSSHKeysUrl = () => {
    return 'https://github.com/settings/keys'
  }

  getSSHKeysHelpUrl = () => {
    return 'https://docs.github.com/cn/authentication/connecting-to-github-with-ssh'
  }
}

export default Github
