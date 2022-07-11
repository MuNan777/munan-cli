import type { AxiosInstance, AxiosRequestHeaders } from 'axios'
import axios from 'axios'

const BASE_URL = 'https://gitee.com/api/v5'

export default class GithubRequest {
  token: string
  service: AxiosInstance
  constructor(token: string) {
    this.token = token
    this.service = axios.create({
      baseURL: BASE_URL,
      timeout: 5000,
    })
    this.service.interceptors.response.use((response) => {
      return response.data
    }, (error) => {
      if (error.response && error.response.data)
        return error.response
      else
        return Promise.reject(error)
    })
  }

  get(url: string, params?: { [key: string]: unknown }, headers?: AxiosRequestHeaders | undefined) {
    return this.service(url, {
      params: {
        ...params,
        access_token: this.token,
      },
      method: 'GET',
      headers,
    })
  }

  post(url: string, data: { [key: string]: unknown }, headers?: AxiosRequestHeaders | undefined) {
    return this.service(url, {
      method: 'POST',
      headers,
      data: { access_token: this.token, ...data },
    })
  }
}

