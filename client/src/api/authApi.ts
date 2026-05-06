import { http } from './http'

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  email: string
  password: string
  first_name: string
  last_name: string
}

export type LoginResponse = {
  User: {
    id: string
    email: string
    role: 'student' | 'instructor' | 'admin'
  }
  Token: string
}

export const login = async (payload: LoginPayload) => {
  const res = await http.post<LoginResponse>('/login', payload)
  return res.data
}

export const register = async (payload: RegisterPayload) => {
  const res = await http.post('/register', payload)
  return res.data
}
