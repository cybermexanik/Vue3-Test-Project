import axios from 'axios';

const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = import.meta.env.VITE_API_BASE_URL

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

axiosInstance.interceptors.request.use(config => {
  config.params = {
    ...(config.params || {}),
    key: API_KEY,
  }
  return config;
})

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('API ERROR: ', {
      url: error.config?.url,
      method: error.config?.method,
      params: error.config?.params,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    })

    return Promise.reject(error)
  }
)

export default axiosInstance;
