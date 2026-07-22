import type { LessonFile } from './lesson'

export type CreateCourseTab = 'info' | 'lessons'

export type CourseForm = {
  category_id: string
  title: string
  description: string
  price: string
  thumbnail_url: string
  level: string
}

export type DraftQuizQuestion = {
  id: number
  questionId?: string
  question: string
  options: string[]
  correctIndex: number
}

export type DraftLesson = {
  id: number
  lessonId?: string
  quizId?: string
  title: string
  type: string
  duration: string
  durationSeconds: number
  description: string
  isFreePreview: boolean
  isLastLesson: boolean
  videoFile: File | null
  videoPreviewUrl: string
  videoName: string
  imageFile: File | null
  imagePreviewUrl: string
  imageName: string
  documentFile: File | null
  documentName: string
  existingFiles: LessonFile[]
  questions: DraftQuizQuestion[]
}
