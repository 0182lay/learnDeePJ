import { http } from './http'
import type { Payment, MyPayment, PaymentStatus } from '../types/payment'

type PaymentResponse = {
  message: string
  data: Payment
}
type PaymentsResponse = {
  message: string
  data: MyPayment[]
}

export const createPayment = async (courseId: string, paymentMethod: string) => {
  const res = await http.post<PaymentResponse>('/payments', {
    course_id: courseId,
    payment_method: paymentMethod,
  })

  return res.data.data
}

export const uploadPaymentSlip = async (paymentId: string, slip: File) => {
  const formData = new FormData()
  formData.append('slip', slip)

  const res = await http.post<{ message: string; data: MyPayment }>(
    `/payments/${paymentId}/slip`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return res.data.data
}

export const getMyPayments = async () => {
  const res = await http.get<PaymentsResponse>('/payments')
  return res.data.data
}

export const updatePaymentStatus = async (paymentId: string, status: PaymentStatus) => {
  const res = await http.patch<{ message: string; data: MyPayment }>(`/payments/${paymentId}/status`, {
    status,
  })

  return res.data.data
}

export const deletePayment = async (paymentId: string) => {
  const res = await http.delete<{ message: string; data: { payment_id: string } }>(
    `/payments/${paymentId}`,
  )

  return res.data.data
}
