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
