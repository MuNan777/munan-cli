import GitServer from './gitServer'
import GiteeRequest from './giteeRequest'
class Gitee extends GitServer {
  request: GiteeRequest

  constructor() {
    super('gitee')
  }

  setToken = (token: string) => {
    this.request = new GiteeRequest(token)
  }

  getTokenHelpUrl = () => {
    return 'https://gitee.com/personal_access_tokens'
  }

  getUser = async () => {
    const response = await this.request.get('/user')
    return this.handleResponse(response)
  }

  getOrgs = async () => {
    const response = await this.request.get('/user/orgs', {
      page: 1,
      per_page: 100,
      admin: true,
    })
    return this.handleResponse(response)
  }

  getRepo = async (repo: string, owner: string) => {
    const response = await this.request.get(`/repos/${owner}/${repo}/branches`)
    return this.handleResponse(response)
  }

  createRepo = async (repo: string) => {
    const response = await this.request.post('/user/repos', {
      name: repo,
    })
    return this.handleResponse(response)
  }

  createOrgRepo = async (repo: string, owner: string) => {
    const response = await this.request.post(`/orgs/${owner}/repos`, {
      name: repo,
    })
    return this.handleResponse(response)
  }

  getRemote = (repo: string, owner: string) => {
    return `https://gitee.com/${owner}/${repo}.git`
  }

  getSSHKeysUrl = () => {
    return 'https://gitee.com/profile/sshkeys'
  }

  getSSHKeysHelpUrl = () => {
    return 'https://gitee.com/help/articles/4191'
  }
}

export default Gitee
