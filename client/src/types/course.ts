export type Course = {
  course_id: string
  title: string
  description: string | null
  price: string
  thumbnail_url: string | null
  level: string | null
  is_published: boolean
  average_rating?: number
  review_count?: number
  created_at?: string
  updated_at?: string
  category?: {
    category_id: string
    name: string
    description: string | null
  }
  instructor?: {
    user_id: string
    email: string
    profile: {
      first_name: string
      last_name: string
      avatar_url: string | null
    } | null
  }
}

export type CourseDetail = Course & {
  category: NonNullable<Course['category']>
  instructor: NonNullable<Course['instructor']>
}
