import { http } from './http'
import type { Category } from '../types/category'

type CategoriesResponse = {
  message: string
  data: Category[]
}

export const getCategories = async () => {
  const res = await http.get<CategoriesResponse>('/category')
  return res.data.data
}
