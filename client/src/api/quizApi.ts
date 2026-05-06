import { http } from './http'

export type QuizQuestion = {
  question_id: string
  quiz_id: string
  question_text: string
  question_type: 'multiple_choice' | 'true_false'
  options: string[]
  correct_answer: string
  order_index: number
}

export type Quiz = {
  quiz_id: string
  lesson_id: string
  title: string
  description: string | null
  questions: QuizQuestion[]
}

export type CreateQuizQuestionPayload = {
  question_text: string
  question_type: 'multiple_choice' | 'true_false'
  options: string[]
  correct_answer: string
  order_index?: number
}

export type CreateQuizPayload = {
  title: string
  description?: string
  questions: CreateQuizQuestionPayload[]
}

export const createQuiz = async (lessonId: string, payload: CreateQuizPayload) => {
  const res = await http.post<{ message: string; data: Quiz }>(`/lessons/${lessonId}/quiz`, payload)
  return res.data.data
}

export const getQuizByLessonId = async (lessonId: string) => {
  const res = await http.get<{ message: string; data: Quiz }>(`/lessons/${lessonId}/quiz`)
  return res.data.data
}

export const updateQuiz = async (lessonId: string, payload: CreateQuizPayload) => {
  const res = await http.patch<{ message: string; data: Quiz }>(`/lessons/${lessonId}/quiz`, payload)
  return res.data.data
}

export const deleteQuiz = async (lessonId: string) => {
  await http.delete(`/lessons/${lessonId}/quiz`)
}
