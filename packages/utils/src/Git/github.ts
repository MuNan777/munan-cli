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
}

export default Github
