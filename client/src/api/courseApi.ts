import { http } from './http'
import type { Course, CourseDetail } from '../types/course'
type CoursesResponse = {
  message: string
  data: Course[]
}

type CourseDetailResponse = {
  message: string
  data: CourseDetail
}

type CreateCoursePayload = {
  category_id: string
  title: string
  description?: string
  price: string
  thumbnail_url?: string
  level?: string
  is_published?: boolean
}

type UpdateCoursePayload = Partial<CreateCoursePayload>

type CreateCourseResponse = {
  message: string
  data: Course
}

type UploadCourseCoverResponse = {
  message: string
  data: {
    url: string
    original_name: string
    size_bytes: number
  }
}

export const getCourses = async () => {
  const res = await http.get<CoursesResponse>('/courses')
  return res.data.data
}

export const getMyCourses = async () => {
  const res = await http.get<CoursesResponse>('/my-courses')
  return res.data.data
}

export const getCourseById = async (courseId: string) => {
  const res = await http.get<CourseDetailResponse>(`/courses/${courseId}`)
  return res.data.data
}

export const createCourse = async (payload: CreateCoursePayload) => {
  const res = await http.post<CreateCourseResponse>('/courses', payload)
  return res.data.data
}

export const updateCourse = async (courseId: string, payload: UpdateCoursePayload) => {
  const res = await http.patch<CreateCourseResponse>(`/courses/${courseId}`, payload)
  return res.data.data
}

export const deleteCourse = async (courseId: string) => {
  await http.delete(`/courses/${courseId}`)
}

export const uploadCourseCover = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await http.post<UploadCourseCoverResponse>('/courses/cover/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return res.data.data
}
