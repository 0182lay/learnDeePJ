const DEFAULT_API_BASE_URL = 'http://localhost:3003'

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, '')

export const API_URL = `${API_BASE_URL}/api`

export const resolveAssetUrl = (url: string | null | undefined) => {
  if (!url) {
    return ''
  }

  if (url.startsWith('http')) {
    return url
  }

  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`
}
