export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export type Payment = {
  payment_id: string
  student_id: string
  course_id: string
  amount: string
  status: PaymentStatus
  payment_method: string | null
  created_at: string
  updated_at: string
}

export type MyPayment = Payment & {
  course: {
    course_id: string
    title: string
    description: string | null
    price: string
    category?: {
      category_id: string
      name: string
    }
    instructor?: {
      user_id: string
      email: string
      profile: {
        first_name: string
        last_name: string
      } | null
    }
  }
  student?: {
    user_id: string
    email: string
    profile: {
      first_name: string
      last_name: string
    } | null
  }
}
