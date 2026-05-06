import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { AuthUser } from '../types/auth'

const getStoredUser = (): AuthUser | null => {
  const storedUser = localStorage.getItem('user')

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser) as AuthUser
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))

  const user = ref<AuthUser | null>(getStoredUser())

  const isLoggedIn = computed(() => !!token.value)

  const setAuth = (newToken: string, newUser: AuthUser) => {
    token.value = newToken
    user.value = newUser

    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const setUser = (newUser: AuthUser) => {
    user.value = newUser
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const logout = () => {
    token.value = null
    user.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    token,
    user,
    isLoggedIn,
    setAuth,
    setUser,
    logout,
  }
})
