import { http } from './http'
import type { Enrollment, MyEnrollment } from '../types/enrollment'

type EnrollmentResponse = {
  message: string
  data: Enrollment
}

type MyEnrollmentsResponse = {
  message: string
  data: MyEnrollment[]
}

export const enrollCourse = async (courseId: string) => {
  const res = await http.post<EnrollmentResponse>('/enrollments', {
    course_id: courseId,
  })

  return res.data.data
}

export const getMyEnrollments = async () => {
  const res = await http.get<MyEnrollmentsResponse>('/enrollments')
  return res.data.data
}
