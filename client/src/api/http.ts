import axios from 'axios'
import { API_URL } from './config'

export const http = axios.create({
  baseURL: API_URL,
  timeout: 30000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = token
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      const currentPath = `${window.location.pathname}${window.location.search}`
      const publicPaths = ['/', '/courses', '/login', '/register']
      const isPublicPage = publicPaths.includes(window.location.pathname)

      if (!isPublicPage) {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
      }
    }

    return Promise.reject(error)
  },
)
