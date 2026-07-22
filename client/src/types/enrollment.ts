export type Enrollment = {
  enrollment_id: string
  student_id: string
  course_id: string
  status: 'active' | 'completed' | 'dropped'
  is_paid: boolean
}

export type MyEnrollment = Enrollment & {
  amount_paid: string
  enrolled_at: string
  course: {
    course_id: string
    title: string
    description: string | null
    price: string
    thumbnail_url: string | null
    level: string | null
    lesson_count?: number
    category: {
      name: string
    }
    instructor: {
      email: string
      profile: {
        first_name: string
        last_name: string
      } | null
    }
  }
}
