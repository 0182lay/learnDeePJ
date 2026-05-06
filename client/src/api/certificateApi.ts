import { http } from './http'

export type Certificate = {
  certificate_id: string
  student_id: string
  course_id: string
  certificate_code: string
  issued_at: string
  course: {
    course_id: string
    title: string
    thumbnail_url: string | null
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

export const getMyCertificates = async () => {
  const res = await http.get<{ message: string; data: Certificate[] }>('/certificates')
  return res.data.data
}

export const issueCertificate = async (courseId: string) => {
  const res = await http.post<{ message: string; data: Certificate }>(
    `/courses/${courseId}/certificate`,
  )
  return res.data.data
}
