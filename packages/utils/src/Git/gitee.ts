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

  getRepo = async (owner: string, repo: string) => {
    const response = await this.request.get(`/repos/${owner}/${repo}`)
    return this.handleResponse(response)
  }
}

export default Gitee
