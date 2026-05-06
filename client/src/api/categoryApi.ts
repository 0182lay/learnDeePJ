import { http } from './http'
import type { Category } from '../types/category'

type CategoriesResponse = {
  message: string
  data: Category[]
}

type CategoryResponse = {
  message: string
  data: Category
}

export type CategoryPayload = {
  name: string
  description?: string
  icon?: string
}

export const getCategories = async () => {
  const res = await http.get<CategoriesResponse>('/category')
  return res.data.data
}

export const createCategory = async (payload: CategoryPayload) => {
  const res = await http.post<CategoryResponse>('/category', payload)
  return res.data.data
}

export const updateCategory = async (categoryId: string, payload: CategoryPayload) => {
  const res = await http.put<CategoryResponse>(`/category/${categoryId}`, payload)
  return res.data.data
}

export const deleteCategory = async (categoryId: string) => {
  await http.delete(`/category/${categoryId}`)
}
