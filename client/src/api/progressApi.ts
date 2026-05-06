import { http } from './http'
import type { LearningProgress } from '../types/progress'

type ProgressResponse = {
  message: string
  data: LearningProgress[]
}

type UpdateProgressResponse = {
  message: string
  data: LearningProgress
}

export const getProgress = async (enrollmentId: string) => {
  const res = await http.get<ProgressResponse>(`/enrollments/${enrollmentId}/progress`)
  return res.data.data
}

export const updateProgress = async (
  enrollmentId: string,
  lessonId: string,
  payload: {
    is_completed?: boolean
    watch_duration_seconds?: number
  },
) => {
  const res = await http.patch<UpdateProgressResponse>(
    `/enrollments/${enrollmentId}/progress/${lessonId}`,
    payload,
  )

  return res.data.data
}
