import axios from 'axios'
import type { AxiosInstance, AxiosRequestHeaders } from 'axios'

const BASE_URL = 'https://api.github.com'

export default class GithubRequest {
  token: string
  service: AxiosInstance
  constructor(token: string) {
    this.token = token
    this.service = axios.create({
      baseURL: BASE_URL,
      timeout: 5000,
    })
    this.service.interceptors.request.use(
      (config) => {
        if (!config.headers)
          config.headers = {}
        config.headers.Authorization = `token ${this.token}`
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )
    this.service.interceptors.response.use(
      (response) => {
        return response.data
      },
      (error) => {
        if (error.response && error.response.data)
          return error.response
        else
          return Promise.reject(error)
      },
    )
  }

  get(url: string, params: { [key: string]: unknown }, headers: AxiosRequestHeaders | undefined) {
    return this.service({
      url,
      data: params,
      method: 'get',
      headers,
    })
  }

  post(url: string, data: { [key: string]: unknown }, headers: AxiosRequestHeaders | undefined) {
    return this.service({
      url,
      data,
      method: 'post',
      headers,
    })
  }
}
