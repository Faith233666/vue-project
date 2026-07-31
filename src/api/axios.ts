import axios from 'axios'

interface ApiResponse<T = any> {
  code: number
  message?: string
  msg?: string
  data?: T
}

const instance = axios.create({
  timeout: 10000,
})

instance.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {}
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json;charset=UTF-8'
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response.data
    }
    return Promise.reject(response)
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

const get = <T = any>(url: string, params?: Record<string, any>, config?: any): Promise<ApiResponse<T>> => {
  return instance.get(url, { params, ...config })
}

const post = <T = any>(url: string, data?: Record<string, any>, config?: any): Promise<ApiResponse<T>> => {
  return instance.post(url, data, config)
}

const put = <T = any>(url: string, data?: Record<string, any>, config?: any): Promise<ApiResponse<T>> => {
  return instance.put(url, data, config)
}

const del = <T = any>(url: string, config?: any): Promise<ApiResponse<T>> => {
  return instance.delete(url, config)
}

const getText = (url: string, params?: Record<string, any>, config?: any): Promise<string> => {
  return instance.get(url, {
    params,
    responseType: 'text',
    ...config,
  })
}

export { get, post, put, del, getText }
export default instance