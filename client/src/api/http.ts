import axios from 'axios'

export const http = axios.create({
  baseURL: 'http://localhost:3003/api',
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
      const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register'

      if (!isAuthPage) {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
      }
    }

    return Promise.reject(error)
  },
)
