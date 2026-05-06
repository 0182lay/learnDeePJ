export type LessonFile = {
  file_id: string
  lesson_id: string
  file_type: 'video' | 'document' | 'image'
  file_url: string
  original_name: string
  duration_seconds: number | null
  size_bytes: number | null
  order_index: number
}

export type Lesson = {
  lesson_id: string
  course_id: string
  title: string
  lesson_type: string
  content: string | null
  description: string | null
  order_index: number
  is_free_preview: boolean
  files?: LessonFile[]
}
