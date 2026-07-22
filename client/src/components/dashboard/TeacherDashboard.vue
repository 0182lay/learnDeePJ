<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import HomeFooter from '../home/HomeFooter.vue'
import { resolveAssetUrl } from '../../api/config'
import { deleteCourse, getMyCourses, updateCourse } from '../../api/courseApi'
import { getMyEnrollments } from '../../api/enrollmentApi'
import { getMyPayments } from '../../api/paymentApi'
import { getProgress } from '../../api/progressApi'
import { useAuthStore } from '../../stores/authStore'
import fallbackCourseImage from '../../assets/images/learndeeimg.png'
import type { Course } from '../../types/course'
import type { MyEnrollment } from '../../types/enrollment'
import type { MyPayment, PaymentStatus } from '../../types/payment'
import type { LearningProgress } from '../../types/progress'

type TeacherTab = 'teaching' | 'learning' | 'payments' | 'reports'
type TeacherReportType = 'courseStudents' | 'totalRevenue' | 'courseRevenue' | 'platformFee'

const authStore = useAuthStore()

const activeTab = ref<TeacherTab>('teaching')
const teachingCourses = ref<Course[]>([])
const enrollments = ref<MyEnrollment[]>([])
const payments = ref<MyPayment[]>([])
const progressByEnrollment = ref<Record<string, LearningProgress[]>>({})
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const updatingCourseId = ref('')
const deletingCourseId = ref('')
const selectedReportType = ref<TeacherReportType>('courseStudents')
const selectedReportCourseId = ref('')

const displayName = computed(() => {
  const profile = authStore.user?.profile
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')

  return fullName || authStore.user?.email?.split('@')[0] || 'Teacher'
})
const avatarText = computed(() => displayName.value.slice(0, 2).toUpperCase())
const avatarUrl = computed(() => authStore.user?.profile?.avatar_url || '')

const publishedCoursesCount = computed(() => {
  return teachingCourses.value.filter((course) => course.is_published).length
})

const enrolledLearningCount = computed(() => enrollments.value.length)

const pendingPaymentsCount = computed(() => {
  return payments.value.filter((payment) => payment.status === 'pending').length
})

const platformFeeRate = 0.3

const reportCourses = computed(() => {
  return teachingCourses.value.map((course) => {
    const studentCount = course.enrollment_count || 0
    const price = Number(String(course.price || 0).replace(/,/g, ''))
    const grossRevenue = studentCount * price
    const platformFee = grossRevenue * platformFeeRate
    const instructorRevenue = grossRevenue - platformFee

    return {
      ...course,
      studentCount,
      grossRevenue,
      platformFee,
      instructorRevenue,
    }
  })
})

const selectedReportCourse = computed(() => {
  return (
    reportCourses.value.find((course) => course.course_id === selectedReportCourseId.value) ||
    reportCourses.value[0]
  )
})

const totalCourseStudents = computed(() => {
  return reportCourses.value.reduce((sum, course) => sum + course.studentCount, 0)
})

const totalGrossRevenue = computed(() => {
  return reportCourses.value.reduce((sum, course) => sum + course.grossRevenue, 0)
})

const totalPlatformFee = computed(() => totalGrossRevenue.value * platformFeeRate)
const totalInstructorRevenue = computed(() => totalGrossRevenue.value - totalPlatformFee.value)

const tabs: { key: TeacherTab; label: string; icon: string }[] = [
  { key: 'teaching', label: 'ຄອສທີ່ເປີດສອນ', icon: '▣' },
  { key: 'learning', label: 'ຄອສທີ່ຮຽນ', icon: '▤' },
  { key: 'payments', label: 'ປະຫວັດການຈ່າຍ', icon: '▥' },
  { key: 'reports', label: 'ລາຍງານ', icon: '▦' },
]

const reportTypes: { key: TeacherReportType; label: string }[] = [
  { key: 'courseStudents', label: 'ຈຳນວນຄົນສະໝັກຄອສຮຽນ' },
  { key: 'totalRevenue', label: 'ລາຍໄດ້ລວມຂອງຄອສທັງໝົດ' },
  { key: 'courseRevenue', label: 'ລາຍໄດ້ສະເພາະຄອສນັ້ນ' },
  { key: 'platformFee', label: 'ສະຫຼຸບຫັກຄ່າແພລດຟອມ 30%' },
]

const statusLabel: Record<PaymentStatus, string> = {
  pending: 'ລໍຖ້າອະນຸມັດ',
  completed: 'ຈ່າຍສຳເລັດ',
  failed: 'ບໍ່ສຳເລັດ',
  refunded: 'ຄືນເງິນ',
}

const statusClass: Record<PaymentStatus, string> = {
  pending: 'bg-[#f5a400]/10 text-[#9a6500]',
  completed: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-600',
  refunded: 'bg-slate-100 text-slate-600',
}

const formatMoney = (amount: string | number) => {
  const value = Number(String(amount || 0).replace(/,/g, ''))
  return `₭${value.toLocaleString('en-US')}`
}

const csvCell = (value: string | number | null | undefined) => {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

const exportTeacherReportCsv = () => {
  const rows = [
    [
      'Course',
      'Students',
      'Course price',
      'Gross revenue',
      'Platform fee 30%',
      'Instructor net revenue',
    ],
    ...reportCourses.value.map((course) => [
      course.title,
      course.studentCount,
      formatMoney(course.price),
      formatMoney(course.grossRevenue),
      formatMoney(course.platformFee),
      formatMoney(course.instructorRevenue),
    ]),
    [],
    ['Total students', totalCourseStudents.value],
    ['Total gross revenue', formatMoney(totalGrossRevenue.value)],
    ['Total platform fee 30%', formatMoney(totalPlatformFee.value)],
    ['Total instructor net revenue', formatMoney(totalInstructorRevenue.value)],
  ]

  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `teacher-report-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const printTeacherReport = () => {
  document.body.classList.add('printing-teacher-report')
  window.print()

  window.setTimeout(() => {
    document.body.classList.remove('printing-teacher-report')
  }, 300)
}

const resolveThumbnail = (url: string | null) => {
  if (!url) return fallbackCourseImage
  return resolveAssetUrl(url)
}

const resolveFileUrl = (url: string) => {
  return resolveAssetUrl(url)
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

const getInstructorName = (enrollment: MyEnrollment) => {
  const profile = enrollment.course.instructor.profile
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')

  return fullName || enrollment.course.instructor.email
}

const getCourseProgress = (enrollment: MyEnrollment) => {
  const progressList = progressByEnrollment.value[enrollment.enrollment_id] || []
  const total = progressList.length
  const completed = progressList.filter((progress) => progress.is_completed).length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  return { total, completed, percent }
}

const getFirstLessonId = (enrollment: MyEnrollment) => {
  const progressList = progressByEnrollment.value[enrollment.enrollment_id] || []
  return progressList[0]?.lesson_id
}

const getPaymentMethodLabel = (method: string | null) => {
  if (!method) return 'ບໍ່ລະບຸ'

  const labels: Record<string, string> = {
    qr: 'QR',
    card: 'Card',
    mobile: 'Mobile Banking',
  }

  return labels[method] || method
}

const loadDashboard = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const [courseList, enrollmentList, paymentList] = await Promise.all([
      getMyCourses(),
      getMyEnrollments(),
      getMyPayments(),
    ])

    teachingCourses.value = courseList
    enrollments.value = enrollmentList
    payments.value = paymentList
    selectedReportCourseId.value ||= courseList[0]?.course_id || ''

    const progressEntries = await Promise.all(
      enrollmentList.map(async (enrollment) => {
        const progress = await getProgress(enrollment.enrollment_id)
        return [enrollment.enrollment_id, progress] as const
      }),
    )

    progressByEnrollment.value = Object.fromEntries(progressEntries)
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ໂຫຼດຂໍ້ມູນແດຊບອດຜູ້ສອນບໍ່ສຳເລັດ'
  } finally {
    isLoading.value = false
  }
}

const handleToggleCoursePublish = async (course: Course) => {
  try {
    updatingCourseId.value = course.course_id
    errorMessage.value = ''
    successMessage.value = ''

    const updatedCourse = await updateCourse(course.course_id, {
      is_published: !course.is_published,
    })

    const index = teachingCourses.value.findIndex((item) => item.course_id === course.course_id)

    if (index >= 0) {
      teachingCourses.value[index] = {
        ...teachingCourses.value[index],
        ...updatedCourse,
      }
    }

    successMessage.value = updatedCourse.is_published
      ? 'ເປີດໃຫ້ຜູ້ຮຽນເຫັນຄອສແລ້ວ'
      : 'ປິດຄອສເປັນຮ່າງແລ້ວ'
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ອັບເດດສະຖານະຄອສບໍ່ສຳເລັດ'
  } finally {
    updatingCourseId.value = ''
  }
}

const handleDeleteCourse = async (course: Course) => {
  const confirmed = window.confirm(`ລົບຄອສ "${course.title}" ແທ້ບໍ?`)

  if (!confirmed) return

  try {
    deletingCourseId.value = course.course_id
    errorMessage.value = ''
    successMessage.value = ''

    await deleteCourse(course.course_id)
    teachingCourses.value = teachingCourses.value.filter((item) => item.course_id !== course.course_id)
    successMessage.value = 'ລົບຄອສສຳເລັດ'
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ລົບຄອສບໍ່ສຳເລັດ'
  } finally {
    deletingCourseId.value = ''
  }
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <main class="min-h-screen bg-[#f7f8fb]">
    <section class="mx-auto max-w-[1700px] px-6 py-8 lg:px-20 2xl:px-28">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex items-center gap-4">
          <img
            v-if="avatarUrl"
            :src="resolveFileUrl(avatarUrl)"
            :alt="displayName"
            class="h-16 w-16 rounded-full object-cover ring-4 ring-white shadow-sm"
          />
          <div v-else class="grid h-16 w-16 place-items-center rounded-full bg-[#142b63] text-lg font-black text-white">
            {{ avatarText }}
          </div>
          <div>
            <h1 class="text-3xl font-black text-[#0f1f4d]">ແດຊບອດຜູ້ສອນ</h1>
            <p class="mt-1 text-sm font-medium text-slate-500">ສະບາຍດີ, {{ displayName }} · ຈັດການຄອສ ແລະ ຕິດຕາມການຮຽນ</p>
          </div>
        </div>

        <RouterLink
          to="/courses/create"
          class="inline-flex items-center justify-center rounded-xl bg-[#142b63] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0e214d]"
        >
          + ສ້າງຄອສໃໝ່
        </RouterLink>
      </div>

      <p v-if="errorMessage" class="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
        {{ errorMessage }}
      </p>

      <p
        v-if="successMessage"
        class="mt-6 rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700"
      >
        {{ successMessage }}
      </p>

      <p v-if="isLoading" class="mt-8 rounded-2xl bg-white px-6 py-10 text-center text-sm font-bold text-slate-500">
        ກຳລັງໂຫຼດແດຊບອດຜູ້ສອນ...
      </p>

      <template v-else>
        <div class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <article class="card-soft p-5">
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-xl">📚</div>
            <p class="mt-4 font-number text-3xl font-black text-[#0f1f4d]">{{ teachingCourses.length }}</p>
            <p class="mt-2 text-sm font-bold text-slate-500">ຄອສທີ່ສ້າງ</p>
          </article>

          <article class="card-soft p-5">
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-xl">✓</div>
            <p class="mt-4 font-number text-3xl font-black text-[#0f1f4d]">{{ publishedCoursesCount }}</p>
            <p class="mt-2 text-sm font-bold text-slate-500">ຄອສທີ່ເຜີຍແຜ່</p>
          </article>

          <article class="card-soft p-5">
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-xl">₭</div>
            <p class="mt-4 font-number text-3xl font-black text-[#0f1f4d]">{{ formatMoney(totalInstructorRevenue) }}</p>
            <p class="mt-2 text-sm font-bold text-slate-500">ລາຍໄດ້ຫຼັງຫັກ 30%</p>
          </article>

          <article class="card-soft p-5">
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-xl">↗</div>
            <p class="mt-4 font-number text-3xl font-black text-[#0f1f4d]">{{ enrolledLearningCount }}</p>
            <p class="mt-2 text-sm font-bold text-slate-500">ຄອສທີ່ກຳລັງຮຽນ</p>
          </article>
        </div>

        <div class="mt-8 inline-grid w-full max-w-4xl grid-cols-2 rounded-2xl bg-slate-200/80 p-1 md:grid-cols-4">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition"
            :class="activeTab === tab.key ? 'bg-white text-[#142b63] shadow-sm' : 'text-slate-500 hover:text-[#142b63]'"
            @click="activeTab = tab.key"
          >
            <span>{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <section v-if="activeTab === 'teaching'" class="mt-6">
          <p v-if="teachingCourses.length === 0" class="card-soft px-6 py-10 text-center text-sm font-bold text-slate-500">
            ຍັງບໍ່ມີຄອສທີ່ເປີດສອນ
          </p>

          <div v-else class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <article
              v-for="course in teachingCourses"
              :key="course.course_id"
              class="card-soft card-soft-hover group overflow-hidden"
            >
              <div class="relative h-52 overflow-hidden bg-slate-100">
              <img
                :src="resolveThumbnail(course.thumbnail_url)"
                :alt="course.title"
                class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
                <div class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0f1f4d]/55 to-transparent"></div>

                <div class="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span class="rounded-full bg-[#f5a400] px-3 py-1 text-xs font-bold text-slate-950 shadow-sm">
                    {{ course.category?.name || 'Course' }}
                  </span>
                  <span class="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
                    {{ course.level || 'beginner' }}
                  </span>
                </div>

                  <span
                    class="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold shadow-sm"
                    :class="course.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                  >
                    {{ course.is_published ? 'ເຜີຍແຜ່' : 'ຮ່າງ' }}
                  </span>
              </div>

              <div class="px-5 pb-5 pt-4">
                <h3 class="line-clamp-2 min-h-14 text-lg font-black leading-7 text-[#0f1f4d]">{{ course.title }}</h3>
                <p class="mt-2 line-clamp-1 text-sm font-semibold text-slate-500">
                  {{ course.description || 'No description yet' }}
                </p>
                <div class="mt-4 border-t border-slate-200 pt-3">
                  <p class="font-number text-[1.15rem] font-black text-[#f5a400]">{{ formatMoney(course.price) }}</p>
                </div>

                <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <RouterLink :to="`/courses/${course.course_id}`" class="inline-flex items-center justify-center rounded-2xl bg-[#142b63] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#0e214d]">
                    ເບິ່ງ
                  </RouterLink>
                  <RouterLink :to="`/courses/${course.course_id}/edit`" class="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-[#142b63] transition hover:border-[#142b63]">
                    ແກ້ໄຂ
                  </RouterLink>
                  <button
                    type="button"
                    :disabled="updatingCourseId === course.course_id || deletingCourseId === course.course_id"
                    class="inline-flex items-center justify-center rounded-2xl border px-4 py-2.5 text-sm font-black transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                    :class="
                      course.is_published
                        ? 'border-[#f5a400]/40 text-[#9a6500] hover:bg-[#f5a400]/10'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    "
                    @click="handleToggleCoursePublish(course)"
                  >
                    {{
                      updatingCourseId === course.course_id
                        ? 'ກຳລັງບັນທຶກ...'
                        : course.is_published
                          ? 'ປິດ'
                          : 'ເປີດ'
                    }}
                  </button>
                  <button
                    type="button"
                    :disabled="updatingCourseId === course.course_id || deletingCourseId === course.course_id"
                    class="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                    @click="handleDeleteCourse(course)"
                  >
                    {{ deletingCourseId === course.course_id ? '...' : 'ລົບ' }}
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section v-else-if="activeTab === 'learning'" class="mt-6 space-y-5">
          <p v-if="enrollments.length === 0" class="card-soft px-6 py-10 text-center text-sm font-bold text-slate-500">
            ຍັງບໍ່ມີຄອສທີ່ກຳລັງຮຽນ
          </p>

          <article
            v-for="enrollment in enrollments"
            :key="enrollment.enrollment_id"
            class="card-soft flex flex-col gap-4 p-4 md:flex-row md:items-center"
          >
            <img
              :src="enrollment.course.thumbnail_url || fallbackCourseImage"
              :alt="enrollment.course.title"
              class="h-24 w-full rounded-xl object-cover md:w-40"
            />

            <div class="min-w-0 flex-1">
              <h2 class="line-clamp-1 text-lg font-black text-[#0f1f4d]">
                {{ enrollment.course.title }}
              </h2>
              <p class="mt-1 text-sm font-medium text-slate-500">ອ. {{ getInstructorName(enrollment) }}</p>

              <div class="mt-4 flex items-center gap-4">
                <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-[#f5a400]">
                  <div
                    class="h-full rounded-full bg-[#142b63]"
                    :style="{ width: `${getCourseProgress(enrollment).percent}%` }"
                  />
                </div>
                <span class="font-number text-sm font-bold text-slate-500">
                  {{ getCourseProgress(enrollment).percent }}%
                </span>
              </div>
            </div>

            <RouterLink
              v-if="getFirstLessonId(enrollment)"
              :to="`/courses/${enrollment.course_id}/learn/${getFirstLessonId(enrollment)}`"
              class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#142b63] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0e214d]"
            >
              ▷ ຮຽນຕໍ່
            </RouterLink>
          </article>
        </section>

        <section v-else-if="activeTab === 'payments'" class="mt-6">
          <p v-if="payments.length === 0" class="card-soft px-6 py-10 text-center text-sm font-bold text-slate-500">
            ຍັງບໍ່ມີປະຫວັດການຈ່າຍ
          </p>

          <div v-else class="space-y-4">
            <article
              v-for="payment in payments"
              :key="payment.payment_id"
              class="card-soft grid gap-4 p-5 lg:grid-cols-[1fr_auto_auto]"
            >
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="text-lg font-black text-[#0f1f4d]">{{ payment.course.title }}</h2>
                  <span class="rounded-full px-3 py-1 text-xs font-black" :class="statusClass[payment.status]">
                    {{ statusLabel[payment.status] }}
                  </span>
                </div>
                <p class="mt-2 text-sm font-medium text-slate-500">
                  {{ formatDate(payment.created_at) }} · {{ getPaymentMethodLabel(payment.payment_method) }}
                </p>
              </div>

              <div>
                <p class="text-xs font-bold uppercase text-slate-400">ຈຳນວນເງິນ</p>
                <p class="mt-1 font-number text-xl font-black text-[#f5a400]">{{ formatMoney(payment.amount) }}</p>
              </div>

              <RouterLink
                :to="`/courses/${payment.course_id}`"
                class="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-[#142b63] transition hover:border-[#142b63]"
              >
                ເບິ່ງຄອສ
              </RouterLink>
            </article>
          </div>

          <p v-if="pendingPaymentsCount > 0" class="mt-4 rounded-2xl bg-[#f5a400]/10 px-5 py-4 text-sm font-bold text-[#9a6500]">
            ມີ {{ pendingPaymentsCount }} ລາຍການທີ່ລໍຖ້າ admin ອະນຸມັດ
          </p>
        </section>

        <section v-else id="teacher-report-print" class="mt-6 space-y-6">
          <article class="card-soft p-6">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 class="text-xl font-black text-[#0f1f4d]">ລາຍງານຜູ້ສອນ</h2>
                <p class="mt-1 text-sm font-semibold text-slate-500">
                  ສະຫຼຸບຈຳນວນຜູ້ສະໝັກ, ລາຍໄດ້ຄອສ ແລະ ຄ່າແພລດຟອມ 30%
                </p>
              </div>

              <div class="report-actions flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <label class="block">
                  <span class="text-xs font-black uppercase text-slate-400">ປະເພດລາຍງານ</span>
                  <select
                    v-model="selectedReportType"
                    class="mt-2 min-w-64 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#0f1f4d] outline-none transition focus:border-[#142b63] focus:ring-2 focus:ring-[#142b63]/15"
                  >
                    <option v-for="report in reportTypes" :key="report.key" :value="report.key">
                      {{ report.label }}
                    </option>
                  </select>
                </label>

                <label
                  v-if="selectedReportType === 'courseRevenue'"
                  class="block"
                >
                  <span class="text-xs font-black uppercase text-slate-400">ເລືອກຄອສ</span>
                  <select
                    v-model="selectedReportCourseId"
                    class="mt-2 min-w-64 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#0f1f4d] outline-none transition focus:border-[#142b63] focus:ring-2 focus:ring-[#142b63]/15"
                  >
                    <option
                      v-for="course in reportCourses"
                      :key="course.course_id"
                      :value="course.course_id"
                    >
                      {{ course.title }}
                    </option>
                  </select>
                </label>

                <button
                  type="button"
                  :disabled="reportCourses.length === 0"
                  class="inline-flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#0f1f4d] shadow-sm transition hover:border-[#142b63] hover:text-[#142b63] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:self-end"
                  @click="exportTeacherReportCsv"
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 3v11m0 0 4-4m-4 4-4-4"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                  ສົ່ງອອກ CSV
                </button>

                <button
                  type="button"
                  :disabled="reportCourses.length === 0"
                  class="inline-flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#0f1f4d] shadow-sm transition hover:border-[#142b63] hover:text-[#142b63] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:self-end"
                  @click="printTeacherReport"
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4a2 2 0 0 1-2 2h-2"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M7 14h10v7H7z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linejoin="round"
                    />
                  </svg>
                  ພິມ
                </button>
              </div>
            </div>
          </article>

          <p
            v-if="reportCourses.length === 0"
            class="card-soft px-6 py-10 text-center text-sm font-bold text-slate-500"
          >
            ຍັງບໍ່ມີຄອສສຳລັບສ້າງລາຍງານ
          </p>

          <template v-else>
            <div
              v-if="selectedReportType === 'courseStudents'"
              class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              <article
                v-for="course in reportCourses"
                :key="course.course_id"
                class="card-soft p-5"
              >
                <p class="line-clamp-2 min-h-12 text-base font-black text-[#0f1f4d]">
                  {{ course.title }}
                </p>
                <p class="mt-4 font-number text-3xl font-black text-[#f5a400]">
                  {{ course.studentCount }}
                </p>
                <p class="mt-1 text-sm font-bold text-slate-500">ຄົນສະໝັກຄອສນີ້</p>
              </article>
            </div>

            <article
              v-else-if="selectedReportType === 'totalRevenue'"
              class="card-soft p-6"
            >
              <div class="grid gap-4 md:grid-cols-3">
                <div class="rounded-2xl bg-slate-50 p-5">
                  <p class="text-sm font-bold text-slate-500">ຈຳນວນຜູ້ສະໝັກທັງໝົດ</p>
                  <p class="mt-2 font-number text-3xl font-black text-[#0f1f4d]">
                    {{ totalCourseStudents }}
                  </p>
                </div>
                <div class="rounded-2xl bg-slate-50 p-5">
                  <p class="text-sm font-bold text-slate-500">ລາຍໄດ້ລວມກ່ອນຫັກ</p>
                  <p class="mt-2 font-number text-3xl font-black text-[#f5a400]">
                    {{ formatMoney(totalGrossRevenue) }}
                  </p>
                </div>
                <div class="rounded-2xl bg-emerald-50 p-5">
                  <p class="text-sm font-bold text-emerald-700">ລາຍໄດ້ສຸດທິຜູ້ສອນ</p>
                  <p class="mt-2 font-number text-3xl font-black text-emerald-700">
                    {{ formatMoney(totalInstructorRevenue) }}
                  </p>
                </div>
              </div>
            </article>

            <article
              v-else-if="selectedReportType === 'courseRevenue' && selectedReportCourse"
              class="card-soft p-6"
            >
              <h3 class="text-lg font-black text-[#0f1f4d]">{{ selectedReportCourse.title }}</h3>
              <div class="mt-5 grid gap-4 md:grid-cols-4">
                <div class="rounded-2xl bg-slate-50 p-5">
                  <p class="text-sm font-bold text-slate-500">ຜູ້ສະໝັກ</p>
                  <p class="mt-2 font-number text-3xl font-black text-[#0f1f4d]">
                    {{ selectedReportCourse.studentCount }}
                  </p>
                </div>
                <div class="rounded-2xl bg-slate-50 p-5">
                  <p class="text-sm font-bold text-slate-500">ລາຍໄດ້ກ່ອນຫັກ</p>
                  <p class="mt-2 font-number text-2xl font-black text-[#f5a400]">
                    {{ formatMoney(selectedReportCourse.grossRevenue) }}
                  </p>
                </div>
                <div class="rounded-2xl bg-red-50 p-5">
                  <p class="text-sm font-bold text-red-600">ຫັກແພລດຟອມ 30%</p>
                  <p class="mt-2 font-number text-2xl font-black text-red-600">
                    {{ formatMoney(selectedReportCourse.platformFee) }}
                  </p>
                </div>
                <div class="rounded-2xl bg-emerald-50 p-5">
                  <p class="text-sm font-bold text-emerald-700">ຜູ້ສອນໄດ້ຮັບ</p>
                  <p class="mt-2 font-number text-2xl font-black text-emerald-700">
                    {{ formatMoney(selectedReportCourse.instructorRevenue) }}
                  </p>
                </div>
              </div>
            </article>

            <article v-else class="card-soft overflow-hidden">
              <div class="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-sm font-black text-slate-500">
                <p>ຄອສ</p>
                <p>ລາຍໄດ້ກ່ອນຫັກ</p>
                <p>ຫັກ 30%</p>
                <p>ຜູ້ສອນໄດ້ຮັບ</p>
              </div>

              <div>
                <div
                  v-for="course in reportCourses"
                  :key="course.course_id"
                  class="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b border-slate-100 px-5 py-4 text-sm last:border-b-0"
                >
                  <p class="font-bold text-[#0f1f4d]">{{ course.title }}</p>
                  <p class="font-number font-bold text-slate-700">{{ formatMoney(course.grossRevenue) }}</p>
                  <p class="font-number font-bold text-red-600">{{ formatMoney(course.platformFee) }}</p>
                  <p class="font-number font-black text-emerald-700">{{ formatMoney(course.instructorRevenue) }}</p>
                </div>
              </div>
            </article>
          </template>
        </section>
      </template>
    </section>

    <HomeFooter />
  </main>
</template>

<style scoped>
@media print {
  @page {
    size: A4;
    margin: 12mm;
  }

  :global(body.printing-teacher-report *) {
    visibility: hidden !important;
  }

  :global(body.printing-teacher-report #teacher-report-print),
  :global(body.printing-teacher-report #teacher-report-print *) {
    visibility: visible !important;
  }

  .report-actions {
    display: none !important;
  }

  #teacher-report-print {
    position: absolute;
    inset: 0;
    margin: 0 !important;
    width: 100%;
  }

  #teacher-report-print article {
    box-shadow: none !important;
    break-inside: avoid;
  }
}
</style>
