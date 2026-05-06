import { http } from './http'
import type { AppUser, UpdateUserPayload } from '../types/user'

type UsersResponse = {
  data: AppUser[]
}

type UserResponse = {
  data: AppUser
}

type UploadAvatarResponse = {
  data: {
    url: string
    original_name: string
    size_bytes: number
  }
}

export const getUsers = async () => {
  const res = await http.get<UsersResponse>('/users')
  return res.data.data
}

export const getMe = async () => {
  const res = await http.get<UserResponse>('/me')
  return res.data.data
}

export const updateMyProfile = async (payload: UpdateUserPayload) => {
  const res = await http.patch<UserResponse>('/me/profile', payload)
  return res.data.data
}

export const requestInstructor = async () => {
  const res = await http.post<UserResponse>('/me/instructor-request')
  return res.data.data
}

export const uploadMyAvatar = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await http.post<UploadAvatarResponse>('/me/avatar/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return res.data.data
}

export const updateUser = async (userId: string, payload: UpdateUserPayload) => {
  const res = await http.put<UserResponse>(`/users/${userId}`, payload)
  return res.data.data
}

export const deleteUser = async (userId: string) => {
  await http.delete(`/users/${userId}`)
}
