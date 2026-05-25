import { http } from './http'
import type { CourseReview, ReviewStats } from '../types/review'

type ReviewsResponse = {
  message: string
  data: {
    reviews: CourseReview[]
    stats: ReviewStats
  }
}

type ReviewResponse = {
  message: string
  data: CourseReview
}

export type ReviewPayload = {
  rating: number
  comment?: string
}

export const getCourseReviews = async (courseId: string) => {
  const res = await http.get<ReviewsResponse>(`/courses/${courseId}/reviews`)
  return res.data.data
}

export const submitCourseReview = async (courseId: string, payload: ReviewPayload) => {
  const res = await http.post<ReviewResponse>(`/courses/${courseId}/reviews`, payload)
  return res.data.data
}

export const deleteCourseReview = async (courseId: string, reviewId: string) => {
  await http.delete(`/courses/${courseId}/reviews/${reviewId}`)
}
