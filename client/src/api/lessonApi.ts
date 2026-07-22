import { http } from './http'
import type { Lesson, LessonFile } from '../types/lesson'

type LessonsResponse = {
  message: string
  data: Lesson[]
}

type CreateLessonPayload = {
  title: string
  lesson_type?: string
  content?: string
  description?: string
  order_index?: number
  is_free_preview?: boolean
  is_last_lesson?: boolean
}

type UpdateLessonPayload = Partial<CreateLessonPayload>

type LessonResponse = {
  message: string
  data: Lesson
}

type LessonFileResponse = {
  message: string
  data: LessonFile
}

export const getLessonsByCourseId = async (courseId: string) => {
  const res = await http.get<LessonsResponse>(`/courses/${courseId}/lessons`)
  return res.data.data
}

export const getLessonById = async (courseId: string, lessonId: string) => {
  const res = await http.get<LessonResponse>(`/courses/${courseId}/lessons/${lessonId}`)
  return res.data.data
}

export const createLesson = async (courseId: string, payload: CreateLessonPayload) => {
  const res = await http.post<LessonResponse>(`/courses/${courseId}/lessons`, payload)
  return res.data.data
}

export const updateLesson = async (courseId: string, lessonId: string, payload: UpdateLessonPayload) => {
  const res = await http.patch<LessonResponse>(`/courses/${courseId}/lessons/${lessonId}`, payload)
  return res.data.data
}

export const deleteLesson = async (courseId: string, lessonId: string) => {
  await http.delete(`/courses/${courseId}/lessons/${lessonId}`)
}

export const deleteLessonFile = async (lessonId: string, fileId: string) => {
  await http.delete(`/lessons/${lessonId}/files/${fileId}`)
}

export const uploadLessonFile = async (
  lessonId: string,
  file: File,
  durationSeconds?: number,
) => {
  const formData = new FormData()
  formData.append('file', file)

  if (durationSeconds) {
    formData.append('duration_seconds', String(Math.round(durationSeconds)))
  }

  const res = await http.post<LessonFileResponse>(`/lessons/${lessonId}/files/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 25 * 60 * 1000,
  })

  return res.data.data
}
