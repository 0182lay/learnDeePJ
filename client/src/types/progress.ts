export type LearningProgress = {
  progress_id: string
  enrollment_id: string
  lesson_id: string
  is_completed: boolean
  watch_duration_seconds: number
  last_accessed_at: string
  completed_at: string | null
}
