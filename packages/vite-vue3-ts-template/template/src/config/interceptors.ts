import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useRequestStore } from '../store/request'
import { IBaseResp } from '../types/respType'
import { ElMessage } from 'element-plus'

export type loadingAxiosRequestConfig = AxiosRequestConfig & { loadingName?: string }

const loadAxiosInterceptor = () => {
  const requestStore = useRequestStore()
  axios.interceptors.request.use(config => {
    const { loadingName } = config as loadingAxiosRequestConfig
    requestStore.startLoading(loadingName)
    requestStore.setError({ status: false, message: '' })
    return config
  })
  axios.interceptors.response.use((resp: AxiosResponse<IBaseResp>) => {
    const { config, data } = resp
    const { loadingName } = config as loadingAxiosRequestConfig
    requestStore.finishLoading(loadingName)
    const { errno, message } = data
    if (errno !== 0) {
      requestStore.setError({ status: true, message })
      return Promise.reject(data)
    }
    return resp
  }, (e: AxiosError) => {
    if (e.message === 'Network Error') {
      requestStore.setError({ status: true, message: '网络错误' })
    }
    console.log(e)
    if (e.config) {
      const { loadingName } = e.config as loadingAxiosRequestConfig
      requestStore.finishLoading(loadingName)
    }
    ElMessage.error(e.message)
    return Promise.reject(e)
  })
}



export default loadAxiosInterceptor