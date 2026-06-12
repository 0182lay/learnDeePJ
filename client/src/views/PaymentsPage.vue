<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { resolveAssetUrl } from '../api/config'
import { getMyPayments, updatePaymentStatus } from '../api/paymentApi'
import { useAuthStore } from '../stores/authStore'
import type { MyPayment, PaymentStatus } from '../types/payment'

const authStore = useAuthStore()

const payments = ref<MyPayment[]>([])
const isLoading = ref(false)
const updatingPaymentId = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const isAdmin = computed(() => authStore.user?.role === 'admin')

const pendingCount = computed(() => {
  return payments.value.filter((payment) => payment.status === 'pending').length
})

const completedCount = computed(() => {
  return payments.value.filter((payment) => payment.status === 'completed').length
})

const totalAmount = computed(() => {
  return payments.value
    .filter((payment) => payment.status === 'completed')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  })

const formatMoney = (amount: string | number) => {
  return `₭${Number(amount || 0).toLocaleString('en-US')}`
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('lo-LA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

const getStudentName = (payment: MyPayment) => {
  const profile = payment.student?.profile
  const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()

  return fullName || payment.student?.email || 'ນັກຮຽນ'
}

const getInstructorName = (payment: MyPayment) => {
  const profile = payment.course.instructor?.profile
  const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()

  return fullName || payment.course.instructor?.email || 'ຜູ້ສອນ'
}

const resolveFileUrl = (url: string) => {
  return resolveAssetUrl(url)
}

const statusLabel: Record<PaymentStatus, string> = {
  pending: 'ລໍຖ້າອະນຸມັດ',
  completed: 'ສຳເລັດ',
  failed: 'ປະຕິເສດ',
  refunded: 'ຄືນເງິນ',
}

const statusClass: Record<PaymentStatus, string> = {
  pending: 'bg-[#f5a400]/10 text-[#b57800]',
  completed: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-600',
  refunded: 'bg-slate-100 text-slate-600',
}

const fetchPayments = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    payments.value = await getMyPayments()
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ໂຫຼດລາຍການຊຳລະເງິນບໍ່ສຳເລັດ'
  } finally {
    isLoading.value = false
  }
}

const handleUpdateStatus = async (paymentId: string, status: PaymentStatus) => {
  try {
    updatingPaymentId.value = paymentId
    errorMessage.value = ''
    successMessage.value = ''

    const updatedPayment = await updatePaymentStatus(paymentId, status)
    const index = payments.value.findIndex((payment) => payment.payment_id === paymentId)

    if (index >= 0) {
      payments.value[index] = updatedPayment
    }

    successMessage.value =
      status === 'completed'
        ? 'ອະນຸມັດການຊຳລະເງິນແລ້ວ'
        : 'ອັບເດດສະຖານະການຊຳລະເງິນແລ້ວ'
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ອັບເດດສະຖານະບໍ່ສຳເລັດ'
  } finally {
    updatingPaymentId.value = ''
  }
}

onMounted(() => {
  fetchPayments()
})
</script>

<template>
  <main class="soft-page min-h-screen">
    <section class="mx-auto max-w-[1680px] px-6 py-8 sm:px-8 lg:px-16 2xl:px-20">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-sm font-bold text-slate-500">
            {{ isAdmin ? 'ແອດມິນ' : 'ແດຊບອດ' }}
          </p>
          <h1 class="mt-2 text-3xl font-black text-[#0f1f4d]">
            {{ isAdmin ? 'ການອະນຸມັດການຊຳລະເງິນ' : 'ລາຍການຊຳລະເງິນຂອງຂ້ອຍ' }}
          </h1>
          <p class="mt-2 text-sm text-slate-500">
            {{
              isAdmin
                ? 'ກວດສອບການຊຳລະເງິນ ແລະ ອະນຸມັດໃຫ້ນັກຮຽນເຂົ້າຮຽນ'
                : 'ຕິດຕາມສະຖານະການຊຳລະເງິນຂອງຄອສທີ່ລົງທະບຽນ'
            }}
          </p>
        </div>

        <RouterLink
          to="/dashboard"
          class="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#142b63] shadow-sm transition hover:border-[#142b63]"
        >
          ກັບຄືນແດຊບອດ
        </RouterLink>
      </div>

      <div class="mt-8 grid gap-4 md:grid-cols-3">
        <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-bold text-slate-500">ລໍຖ້າອະນຸມັດ</p>
          <p class="mt-3 text-3xl font-black text-[#142b63]">{{ pendingCount }}</p>
        </article>

        <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-bold text-slate-500">ສຳເລັດ</p>
          <p class="mt-3 text-3xl font-black text-emerald-600">{{ completedCount }}</p>
        </article>

        <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-sm font-bold text-slate-500">ລາຍຮັບທີ່ອະນຸມັດ</p>
          <p class="mt-3 text-3xl font-black text-[#f5a400]">{{ formatMoney(totalAmount) }}</p>
        </article>
      </div>

      <p v-if="errorMessage" class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
        {{ errorMessage }}
      </p>

      <p
        v-if="successMessage"
        class="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700"
      >
        {{ successMessage }}
      </p>

      <section class="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,31,77,0.06)]">
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 class="text-lg font-black text-[#0f1f4d]">ລາຍການຊຳລະເງິນ</h2>
            <p class="mt-1 text-sm text-slate-500">{{ payments.length }} ລາຍການ</p>
          </div>

          <button
            type="button"
            :disabled="isLoading"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-[#142b63] hover:text-[#142b63] disabled:cursor-not-allowed disabled:text-slate-400"
            @click="fetchPayments"
          >
            ໂຫຼດໃໝ່
          </button>
        </div>

        <p v-if="isLoading" class="px-6 py-10 text-center text-sm font-bold text-slate-500">
          ກຳລັງໂຫຼດລາຍການຊຳລະເງິນ...
        </p>

        <p v-else-if="payments.length === 0" class="px-6 py-10 text-center text-sm font-bold text-slate-500">
          ຍັງບໍ່ມີລາຍການຊຳລະເງິນ
        </p>

        <div v-else class="divide-y divide-slate-100">
          <article
            v-for="payment in payments"
            :key="payment.payment_id"
            class="grid gap-5 px-6 py-5 lg:grid-cols-[1.2fr_0.8fr_auto]"
          >
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-lg font-black text-[#0f1f4d]">{{ payment.course.title }}</h3>
                <span
                  class="rounded-full px-3 py-1 text-xs font-black"
                  :class="statusClass[payment.status]"
                >
                  {{ statusLabel[payment.status] }}
                </span>
              </div>

              <p class="mt-2 text-sm text-slate-500">
                {{ isAdmin ? `ນັກຮຽນ: ${getStudentName(payment)}` : `ຜູ້ສອນ: ${getInstructorName(payment)}` }}
              </p>

              <p class="mt-1 text-xs text-slate-400">
                ID: {{ payment.payment_id }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-1">
              <p>
                <span class="block text-xs font-bold uppercase text-slate-400">ຈຳນວນເງິນ</span>
                <span class="font-black text-[#f5a400]">{{ formatMoney(payment.amount) }}</span>
              </p>

              <p>
                <span class="block text-xs font-bold uppercase text-slate-400">ວິທີຊຳລະ</span>
                <span class="font-bold text-slate-600">{{ payment.payment_method || '-' }}</span>
              </p>

              <p>
                <span class="block text-xs font-bold uppercase text-slate-400">ວັນທີ</span>
                <span class="font-bold text-slate-600">{{ formatDate(payment.created_at) }}</span>
              </p>

              <p v-if="payment.slip_url">
                <span class="block text-xs font-bold uppercase text-slate-400">ສະລິບ</span>
                <a
                  :href="resolveFileUrl(payment.slip_url)"
                  target="_blank"
                  rel="noreferrer"
                  class="font-bold text-[#142b63] underline"
                >
                  ເບິ່ງສະລິບ
                </a>
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3 lg:justify-end">
              <RouterLink
                :to="`/courses/${payment.course.course_id}`"
                class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-[#142b63] transition hover:border-[#142b63]"
              >
                ເບິ່ງຄອສ
              </RouterLink>

              <template v-if="isAdmin && payment.status === 'pending'">
                <button
                  type="button"
                  :disabled="updatingPaymentId === payment.payment_id"
                  class="rounded-xl bg-[#142b63] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0e214d] disabled:cursor-not-allowed disabled:bg-slate-400"
                  @click="handleUpdateStatus(payment.payment_id, 'completed')"
                >
                  {{ updatingPaymentId === payment.payment_id ? 'ກຳລັງບັນທຶກ...' : 'ອະນຸມັດ' }}
                </button>

                <button
                  type="button"
                  :disabled="updatingPaymentId === payment.payment_id"
                  class="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  @click="handleUpdateStatus(payment.payment_id, 'failed')"
                >
                  ປະຕິເສດ
                </button>
              </template>
            </div>
          </article>
        </div>
      </section>
    </section>
  </main>
</template>
