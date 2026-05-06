<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getMyCourses } from '../../api/courseApi'
import { getMyPayments, updatePaymentStatus } from '../../api/paymentApi'
import { getUsers, updateUser } from '../../api/userApi'
import { useAuthStore } from '../../stores/authStore'
import type { Course } from '../../types/course'
import type { MyPayment, PaymentStatus } from '../../types/payment'
import type { AppUser } from '../../types/user'

type AdminTab = 'overview' | 'courses' | 'instructors' | 'payments'

const authStore = useAuthStore()

const activeTab = ref<AdminTab>('overview')
const users = ref<AppUser[]>([])
const courses = ref<Course[]>([])
const payments = ref<MyPayment[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const updatingId = ref('')

const displayName = computed(() => {
  const profile = authStore.user?.profile
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')

  return fullName || authStore.user?.email?.split('@')[0] || 'Admin'
})

const avatarText = computed(() => displayName.value.slice(0, 2).toUpperCase())
const avatarUrl = computed(() => authStore.user?.profile?.avatar_url || '')

const resolveFileUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `http://localhost:3003${url.startsWith('/') ? url : `/${url}`}`
}

const activeUsersCount = computed(() => {
  return users.value.filter((user) => user.is_active).length
})

const instructors = computed(() => {
  return users.value.filter((user) => user.role === 'instructor')
})

const pendingInstructors = computed(() => {
  return instructors.value.filter((user) => !user.is_active)
})

const completedPayments = computed(() => {
  return payments.value.filter((payment) => payment.status === 'completed')
})

const pendingPayments = computed(() => {
  return payments.value.filter((payment) => payment.status === 'pending')
})

const totalRevenue = computed(() => {
  return completedPayments.value.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
})

const recentActivities = computed(() => {
  const paymentActivities = payments.value.slice(0, 4).map((payment) => ({
    id: `payment-${payment.payment_id}`,
    title: payment.status === 'completed' ? 'ຊຳລະເງິນສຳເລັດ' : 'payment ໃໝ່ລໍຖ້າ',
    detail: `${formatMoney(payment.amount)} - ${payment.course.title}`,
    time: formatDate(payment.created_at),
  }))

  const courseActivities = courses.value.slice(0, 3).map((course) => ({
    id: `course-${course.course_id}`,
    title: course.is_published ? 'ຄອສກຳລັງເປີດສອນ' : 'ຄອສແບບຮ່າງ',
    detail: course.title,
    time: course.created_at ? formatDate(course.created_at) : '-',
  }))

  return [...paymentActivities, ...courseActivities].slice(0, 5)
})

const tabs: { key: AdminTab; label: string }[] = [
  { key: 'overview', label: 'ພາບລວມ' },
  { key: 'courses', label: 'ຄອສທັ້ງໝົດ' },
  { key: 'instructors', label: 'ຜູ້ສອນລໍຖ້າອະນຸມັດ' },
  { key: 'payments', label: 'ປະຫວັດການຊຳລະເງິນ' },
]

const statusLabel: Record<PaymentStatus, string> = {
  pending: 'ລໍຖ້າ',
  completed: 'ສຳເລັດ',
  failed: 'ປະຕິເສດ',
  refunded: 'ຄືນເງິນ',
}

const statusClass: Record<PaymentStatus, string> = {
  pending: 'bg-[#f5a400]/10 text-[#a46b00]',
  completed: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-600',
  refunded: 'bg-slate-100 text-slate-600',
}

const formatMoney = (amount: string | number) => {
  return `₭${Number(amount || 0).toLocaleString('en-US')}`
}

const formatShortMoney = (amount: number) => {
  if (amount >= 1_000_000) {
    return `₭${Math.round(amount / 1_000_000)}M`
  }

  return formatMoney(amount)
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('lo-LA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

const getUserName = (user: AppUser | undefined) => {
  if (!user) return 'User'

  const fullName = [user.profile?.first_name, user.profile?.last_name].filter(Boolean).join(' ')
  return fullName || user.email
}

const getPaymentStudentName = (payment: MyPayment) => {
  const fullName = [payment.student?.profile?.first_name, payment.student?.profile?.last_name]
    .filter(Boolean)
    .join(' ')

  return fullName || payment.student?.email || 'Student'
}

const getInstructorName = (course: Course) => {
  const fullName = [course.instructor?.profile?.first_name, course.instructor?.profile?.last_name]
    .filter(Boolean)
    .join(' ')

  return fullName || course.instructor?.email || 'Instructor'
}

const fetchAdminData = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const [userList, courseList, paymentList] = await Promise.all([
      getUsers(),
      getMyCourses(),
      getMyPayments(),
    ])

    users.value = userList
    courses.value = courseList
    payments.value = paymentList
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ໂຫຼດຂໍ້ມູນ Admin ບໍ່ສຳເລັດ'
  } finally {
    isLoading.value = false
  }
}

const handlePaymentStatus = async (paymentId: string, status: PaymentStatus) => {
  try {
    updatingId.value = paymentId
    successMessage.value = ''
    errorMessage.value = ''

    const updated = await updatePaymentStatus(paymentId, status)
    const index = payments.value.findIndex((payment) => payment.payment_id === paymentId)

    if (index >= 0) {
      payments.value[index] = updated
    }

    successMessage.value = 'ອັບເດດ payment ແລ້ວ'
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ອັບເດດ payment ບໍ່ສຳເລັດ'
  } finally {
    updatingId.value = ''
  }
}

const handleApproveInstructor = async (user: AppUser) => {
  try {
    updatingId.value = user.user_id
    successMessage.value = ''
    errorMessage.value = ''

    const updated = await updateUser(user.user_id, { is_active: true, role: 'instructor' })
    const index = users.value.findIndex((item) => item.user_id === user.user_id)

    if (index >= 0) {
      users.value[index] = updated
    }

    successMessage.value = 'ອະນຸມັດຜູ້ສອນແລ້ວ'
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ອະນຸມັດຜູ້ສອນບໍ່ສຳເລັດ'
  } finally {
    updatingId.value = ''
  }
}

const handleRejectInstructor = async (user: AppUser) => {
  try {
    updatingId.value = user.user_id
    successMessage.value = ''
    errorMessage.value = ''

    const updated = await updateUser(user.user_id, { is_active: true, role: 'student' })
    const index = users.value.findIndex((item) => item.user_id === user.user_id)

    if (index >= 0) {
      users.value[index] = updated
    }

    successMessage.value = 'ປະຕິເສດຄຳຂໍເປັນຜູ້ສອນແລ້ວ'
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ປະຕິເສດບໍ່ສຳເລັດ'
  } finally {
    updatingId.value = ''
  }
}

onMounted(() => {
  fetchAdminData()
})
</script>

<template>
  <section class="mx-auto max-w-[1700px] px-8 py-8 lg:px-20 2xl:px-28">
    <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div class="flex items-center gap-4">
        <img
          v-if="avatarUrl"
          :src="resolveFileUrl(avatarUrl)"
          :alt="displayName"
          class="h-14 w-14 rounded-full object-cover ring-4 ring-white shadow-sm"
        />
        <div v-else class="grid h-14 w-14 place-items-center rounded-full bg-[#142b63] text-base font-black text-white">
          {{ avatarText }}
        </div>

        <div>
          <h1 class="text-3xl font-black text-[#0f1f4d]">ແຜງຄວບຄຸມ Admin</h1>
          <p class="mt-2 text-sm font-medium text-slate-500">
            ຍິນດີຕ້ອນຮັບ, {{ displayName }} - ຈັດການລະບົບ LearnDee
          </p>
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <RouterLink
          to="/payments"
          class="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#142b63] shadow-sm transition hover:border-[#142b63]"
        >
          ຈັດການ payment
        </RouterLink>

        <RouterLink
          to="/courses/create"
          class="rounded-xl bg-[#142b63] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0e214d]"
        >
          + ສ້າງຄອສໃໝ່
        </RouterLink>
      </div>
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

    <p v-if="isLoading" class="mt-8 rounded-2xl bg-white px-5 py-8 text-center text-sm font-bold text-slate-500">
      Loading admin dashboard...
    </p>

    <template v-else>
      <div class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <article class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div class="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-xl">👥</div>
          <p class="mt-4 text-3xl font-black text-[#0f1f4d]">{{ activeUsersCount }}</p>
          <p class="mt-2 text-sm font-bold text-slate-500">ຜູ້ໃຊ້ທີ່ active</p>
        </article>

        <article class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div class="grid h-10 w-10 place-items-center rounded-xl bg-[#f5a400]/10 text-xl">📖</div>
          <p class="mt-4 text-3xl font-black text-[#0f1f4d]">{{ courses.length }}</p>
          <p class="mt-2 text-sm font-bold text-slate-500">ຄອສທັ້ງໝົດ</p>
        </article>

        <article class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div class="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-xl">💵</div>
          <p class="mt-4 text-3xl font-black text-[#0f1f4d]">{{ formatShortMoney(totalRevenue) }}</p>
          <p class="mt-2 text-sm font-bold text-slate-500">ລາຍຮັບທີ່ອະນຸມັດ</p>
        </article>

        <article class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div class="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-xl">🛡️</div>
          <p class="mt-4 text-3xl font-black text-[#0f1f4d]">{{ pendingPayments.length }}</p>
          <p class="mt-2 text-sm font-bold text-slate-500">payment ລໍຖ້າ</p>
        </article>
      </div>

      <div class="mt-8 inline-flex rounded-2xl bg-slate-200 p-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="rounded-xl px-4 py-2 text-sm font-bold transition"
          :class="activeTab === tab.key ? 'bg-white text-[#142b63] shadow-sm' : 'text-slate-500 hover:text-[#142b63]'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <section v-if="activeTab === 'overview'" class="mt-6 grid gap-6 xl:grid-cols-2">
        <article class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-xl font-black text-[#0f1f4d]">ຜູ້ສອນລໍຖ້າອະນຸມັດ</h2>
            <span class="rounded-full bg-red-500 px-3 py-1 text-sm font-black text-white">
              {{ pendingInstructors.length }}
            </span>
          </div>

          <p v-if="pendingInstructors.length === 0" class="rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
            ຍັງບໍ່ມີຜູ້ສອນລໍຖ້າອະນຸມັດ
          </p>

          <div v-else class="space-y-3">
            <div
              v-for="user in pendingInstructors.slice(0, 3)"
              :key="user.user_id"
              class="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3"
            >
              <div class="flex min-w-0 items-center gap-3">
                <div class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-200 text-sm font-black text-[#142b63]">
                  {{ getUserName(user).slice(0, 1).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="truncate font-black text-[#0f1f4d]">{{ getUserName(user) }}</p>
                  <p class="truncate text-sm text-slate-500">{{ user.email }}</p>
                </div>
              </div>

              <div class="flex shrink-0 gap-2">
                <button
                  type="button"
                  :disabled="updatingId === user.user_id"
                  class="rounded-full px-3 py-2 text-sm font-black text-emerald-600 hover:bg-emerald-50 disabled:text-slate-300"
                  @click="handleApproveInstructor(user)"
                >
                  ✓
                </button>
                <button
                  type="button"
                  :disabled="updatingId === user.user_id"
                  class="rounded-full px-3 py-2 text-sm font-black text-red-500 hover:bg-red-50 disabled:text-slate-300"
                  @click="handleRejectInstructor(user)"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </article>

        <article class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 class="mb-5 text-xl font-black text-[#0f1f4d]">ກິດຈະກຳລ່າສຸດ</h2>

          <div class="space-y-5">
            <div v-for="activity in recentActivities" :key="activity.id" class="flex gap-4">
              <div class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">◷</div>
              <div class="min-w-0 flex-1">
                <p class="font-black text-[#0f1f4d]">{{ activity.title }}</p>
                <p class="mt-1 truncate text-sm text-slate-500">{{ activity.detail }}</p>
              </div>
              <p class="shrink-0 text-sm text-slate-500">{{ activity.time }}</p>
            </div>
          </div>
        </article>
      </section>

      <section v-else-if="activeTab === 'courses'" class="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div class="mb-5 flex items-center justify-between">
          <h2 class="text-xl font-black text-[#0f1f4d]">ຄອສທັ້ງໝົດ</h2>
          <p class="text-sm font-bold text-slate-500">{{ courses.length }} ຄອສ</p>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <article
            v-for="course in courses"
            :key="course.course_id"
            class="rounded-xl border border-slate-100 bg-slate-50 p-4"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="font-black text-[#0f1f4d]">{{ course.title }}</h3>
                <p class="mt-1 text-sm text-slate-500">ຜູ້ສອນ: {{ getInstructorName(course) }}</p>
                <p class="mt-2 text-sm font-black text-[#f5a400]">{{ formatMoney(course.price) }}</p>
              </div>

              <span
                class="rounded-full px-3 py-1 text-xs font-black"
                :class="course.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-500'"
              >
                {{ course.is_published ? 'Published' : 'Draft' }}
              </span>
            </div>

            <div class="mt-4 flex gap-3">
              <RouterLink
                :to="`/courses/${course.course_id}`"
                class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#142b63]"
              >
                ເບິ່ງ
              </RouterLink>
              <RouterLink
                :to="`/courses/${course.course_id}/edit`"
                class="rounded-xl bg-[#142b63] px-4 py-2 text-sm font-bold text-white"
              >
                ແກ້ໄຂ
              </RouterLink>
            </div>
          </article>
        </div>
      </section>

      <section v-else-if="activeTab === 'instructors'" class="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div class="mb-5 flex items-center justify-between">
          <h2 class="text-xl font-black text-[#0f1f4d]">ຜູ້ສອນລໍຖ້າອະນຸມັດ</h2>
          <p class="text-sm font-bold text-slate-500">{{ pendingInstructors.length }} ຄົນ</p>
        </div>

        <p v-if="pendingInstructors.length === 0" class="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          ຍັງບໍ່ມີຄຳຂໍຜູ້ສອນ
        </p>

        <div v-else class="space-y-3">
          <div
            v-for="user in pendingInstructors"
            :key="user.user_id"
            class="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 class="font-black text-[#0f1f4d]">{{ getUserName(user) }}</h3>
              <p class="mt-1 text-sm text-slate-500">{{ user.email }}</p>
              <p class="mt-1 text-xs font-bold text-slate-400">ສະຖານະ: inactive instructor</p>
            </div>

            <div class="flex gap-3">
              <button
                type="button"
                :disabled="updatingId === user.user_id"
                class="rounded-xl bg-[#142b63] px-4 py-2 text-sm font-bold text-white disabled:bg-slate-400"
                @click="handleApproveInstructor(user)"
              >
                ອະນຸມັດ
              </button>
              <button
                type="button"
                :disabled="updatingId === user.user_id"
                class="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-500 disabled:text-slate-400"
                @click="handleRejectInstructor(user)"
              >
                ປະຕິເສດ
              </button>
            </div>
          </div>
        </div>
      </section>

      <section v-else class="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div class="mb-5 flex items-center justify-between">
          <h2 class="text-xl font-black text-[#0f1f4d]">ປະຫວັດການຊຳລະເງິນ</h2>
          <p class="text-sm font-bold text-slate-500">{{ payments.length }} ລາຍການ</p>
        </div>

        <div class="space-y-3">
          <article
            v-for="payment in payments"
            :key="payment.payment_id"
            class="grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 lg:grid-cols-[1fr_auto_auto]"
          >
            <div>
              <h3 class="font-black text-[#0f1f4d]">{{ payment.course.title }}</h3>
              <p class="mt-1 text-sm text-slate-500">ນັກຮຽນ: {{ getPaymentStudentName(payment) }}</p>
            </div>

            <div class="text-sm">
              <p class="font-black text-[#f5a400]">{{ formatMoney(payment.amount) }}</p>
              <p class="mt-1 text-slate-500">{{ formatDate(payment.created_at) }}</p>
            </div>

            <div class="flex items-center gap-3">
              <span class="rounded-full px-3 py-1 text-xs font-black" :class="statusClass[payment.status]">
                {{ statusLabel[payment.status] }}
              </span>

              <template v-if="payment.status === 'pending'">
                <button
                  type="button"
                  :disabled="updatingId === payment.payment_id"
                  class="rounded-xl bg-[#142b63] px-3 py-2 text-sm font-bold text-white disabled:bg-slate-400"
                  @click="handlePaymentStatus(payment.payment_id, 'completed')"
                >
                  ອະນຸມັດ
                </button>
                <button
                  type="button"
                  :disabled="updatingId === payment.payment_id"
                  class="rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-500 disabled:text-slate-400"
                  @click="handlePaymentStatus(payment.payment_id, 'failed')"
                >
                  ປະຕິເສດ
                </button>
              </template>
            </div>
          </article>
        </div>
      </section>
    </template>
  </section>
</template>
