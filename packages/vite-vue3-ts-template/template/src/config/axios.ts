import axios, { AxiosRequestConfig } from 'axios'
import config from './index'
import loadAxiosInterceptor from './interceptors'

export let backendBaseURL = config.devBackendBaseURL

if (process.env.NODE_ENV === 'production') {
  backendBaseURL = config.prodBackendBaseURL
}

const axiosConfig = () => {
  axios.defaults.baseURL = backendBaseURL

  // 加载 axios 拦截器
  loadAxiosInterceptor()
}

export const axiosWithLoadingName = async <T = any> (url: string,
  loadingName: string,
  config: AxiosRequestConfig = { method: 'get' }) => {
  const newConfig = { ...config, loadingName }
  const resp = await axios<T>(url, newConfig)
  return resp.data
}

export default axiosConfig