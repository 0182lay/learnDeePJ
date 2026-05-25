export type ReviewUser = {
  user_id: string
  email: string
  profile: {
    first_name: string
    last_name: string
    avatar_url: string | null
  } | null
}

export type CourseReview = {
  review_id: string
  course_id: string
  student_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
  student: ReviewUser
}

export type ReviewStats = {
  average_rating: number
  review_count: number
}
