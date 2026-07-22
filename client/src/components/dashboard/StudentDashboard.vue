<script setup lang="ts">
import { toPng } from 'html-to-image'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import HomeFooter from '../home/HomeFooter.vue'
import {
  getMyCertificates,
  issueCertificate,
  type Certificate,
} from '../../api/certificateApi'
import { resolveAssetUrl } from '../../api/config'
import { getMyEnrollments } from '../../api/enrollmentApi'
import { getMyPayments } from '../../api/paymentApi'
import { getProgress } from '../../api/progressApi'
import { useAuthStore } from '../../stores/authStore'
import fallbackCourseImage from '../../assets/images/learndeeimg.png'
import logoUrl from '../../assets/images/logolearndee.png'
import type { MyEnrollment } from '../../types/enrollment'
import type { MyPayment, PaymentStatus } from '../../types/payment'
import type { LearningProgress } from '../../types/progress'

type StudentTab = 'learning' | 'payments' | 'certificates'

const authStore = useAuthStore()

const activeTab = ref<StudentTab>('learning')
const enrollments = ref<MyEnrollment[]>([])
const payments = ref<MyPayment[]>([])
const certificates = ref<Certificate[]>([])
const progressByEnrollment = ref<Record<string, LearningProgress[]>>({})
const isLoading = ref(false)
const errorMessage = ref('')
const certificateMessage = ref('')
const issuingCourseId = ref('')
const printingCertificateId = ref('')
const downloadingCertificateId = ref('')

const displayName = computed(() => {
  const profile = authStore.user?.profile
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')

  return fullName || authStore.user?.email?.split('@')[0] || 'Student'
})
const avatarText = computed(() => displayName.value.slice(0, 2).toUpperCase())
const avatarUrl = computed(() => authStore.user?.profile?.avatar_url || '')

const resolveFileUrl = (url: string) => {
  return resolveAssetUrl(url)
}

const completedCoursesCount = computed(() => {
  return enrollments.value.filter((enrollment) => getCourseProgress(enrollment).percent === 100).length
})

const totalLearningSeconds = computed(() => {
  return Object.values(progressByEnrollment.value).reduce((total, lessons) => {
    return (
      total +
      lessons.reduce((sum, progress) => {
        return sum + progress.watch_duration_seconds
      }, 0)
    )
  }, 0)
})

const totalLearningTimeParts = computed(() => {
  const totalMinutes = Math.floor(totalLearningSeconds.value / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0 && minutes > 0) {
    return [
      { value: hours, unit: 'ຊມ' },
      { value: minutes, unit: 'ນາທີ' },
    ]
  }

  if (hours > 0) {
    return [{ value: hours, unit: 'ຊມ' }]
  }

  return [{ value: minutes, unit: 'ນາທີ' }]
})

const averageProgress = computed(() => {
  if (enrollments.value.length === 0) return 0

  const total = enrollments.value.reduce((sum, enrollment) => {
    return sum + getCourseProgress(enrollment).percent
  }, 0)

  return Math.round(total / enrollments.value.length)
})

const pendingPaymentsCount = computed(() => {
  return payments.value.filter((payment) => payment.status === 'pending').length
})

const tabs: { key: StudentTab; label: string; icon: string }[] = [
  { key: 'learning', label: 'ຄອສຂອງຂ້ອຍ', icon: '▣' },
  { key: 'payments', label: 'ປະຫວັດການຈ່າຍ', icon: '▤' },
  { key: 'certificates', label: 'ໃບປະກາດ', icon: '🏅' },
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

const getCertificateInstructorName = (certificate: Certificate) => {
  const profile = certificate.course.instructor.profile
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')

  return fullName || certificate.course.instructor.email
}

const getCourseProgress = (enrollment: MyEnrollment) => {
  const progressList = progressByEnrollment.value[enrollment.enrollment_id] || []
  const total = enrollment.course.lesson_count ?? progressList.length
  const completed = progressList.filter((progress) => progress.is_completed).length
  const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0

  return { total, completed, percent }
}

const isCourseComplete = (enrollment: MyEnrollment) => {
  return getCourseProgress(enrollment).percent === 100
}

const getCourseCertificate = (courseId: string) => {
  return certificates.value.find((certificate) => certificate.course_id === courseId)
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

const handleIssueCertificate = async (enrollment: MyEnrollment) => {
  if (issuingCourseId.value) return
  if (!isCourseComplete(enrollment)) return

  try {
    issuingCourseId.value = enrollment.course_id
    certificateMessage.value = ''

    const certificate = await issueCertificate(enrollment.course_id)
    const index = certificates.value.findIndex((item) => item.course_id === certificate.course_id)

    if (index >= 0) {
      certificates.value[index] = certificate
    } else {
      certificates.value.unshift(certificate)
    }

    activeTab.value = 'certificates'
    certificateMessage.value = 'ອອກໃບປະກາດສຳເລັດ'
  } catch (error) {
    console.log(error)
    certificateMessage.value = 'ຍັງອອກໃບປະກາດບໍ່ໄດ້ ກວດວ່າຮຽນຄົບ ແລະ ຜ່ານ quiz ແລ້ວຫຼືຍັງ'
  } finally {
    issuingCourseId.value = ''
  }
}

const handlePrintCertificate = async (certificateId: string) => {
  printingCertificateId.value = certificateId
  await nextTick()
  window.print()

  window.setTimeout(() => {
    printingCertificateId.value = ''
  }, 300)
}

const handleDownloadCertificate = async (certificateId: string, courseTitle: string) => {
  if (downloadingCertificateId.value) return

  downloadingCertificateId.value = certificateId
  await nextTick()

  const el = document.getElementById(`certificate-card-${certificateId}`)
  if (!el) {
    downloadingCertificateId.value = ''
    return
  }

  try {
    const dataUrl = await toPng(el, {
      backgroundColor: '#fffdf8',
      pixelRatio: 2,
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains('certificate-no-print')) {
          return false
        }
        return true
      },
    })

    const link = document.createElement('a')
    link.download = `Certificate-${courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}.png`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('Download certificate error:', error)
    alert('ດາວໂຫຼດຮູບພາບບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ')
  } finally {
    downloadingCertificateId.value = ''
  }
}

const loadDashboard = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const [enrollmentList, paymentList, certificateList] = await Promise.all([
      getMyEnrollments(),
      getMyPayments(),
      getMyCertificates(),
    ])

    enrollments.value = enrollmentList
    payments.value = paymentList
    certificates.value = certificateList

    const progressEntries = await Promise.all(
      enrollmentList.map(async (enrollment) => {
        const progress = await getProgress(enrollment.enrollment_id)
        return [enrollment.enrollment_id, progress] as const
      }),
    )

    progressByEnrollment.value = Object.fromEntries(progressEntries)
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ໂຫຼດຂໍ້ມູນແດຊບອດບໍ່ສຳເລັດ'
  } finally {
    isLoading.value = false
  }
}

const animatedProgress = ref(0)

const animateNumber = (target: number) => {
  const duration = 1000 // 1 second
  const start = performance.now()
  const startValue = animatedProgress.value

  const step = (timestamp: number) => {
    const elapsed = timestamp - start
    const progress = Math.min(elapsed / duration, 1)
    
    // Easing function (easeOutQuad)
    const ease = progress * (2 - progress)
    animatedProgress.value = startValue + (target - startValue) * ease

    if (progress < 1) {
      window.requestAnimationFrame(step)
    } else {
      animatedProgress.value = target
    }
  }

  window.requestAnimationFrame(step)
}

watch(averageProgress, (newVal) => {
  animateNumber(newVal)
})

onMounted(() => {
  loadDashboard().then(() => {
    if (averageProgress.value > 0) {
      animateNumber(averageProgress.value)
    }
  })
})
</script>

<template>
  <main class="min-h-screen bg-[#f7f8fb]">
    <section class="mx-auto max-w-[1700px] px-6 py-8 lg:px-20 2xl:px-28">
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
          <h1 class="text-3xl font-black text-[#0f1f4d]">ສະບາຍດີ, {{ displayName }}!</h1>
          <p class="mt-1 text-sm font-medium text-slate-500">ສິ່ງທີ່ກຳລັງຮຽນຂອງທ່ານ</p>
        </div>
      </div>

      <p v-if="errorMessage" class="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
        {{ errorMessage }}
      </p>

      <p v-if="isLoading" class="mt-8 rounded-2xl bg-white px-6 py-10 text-center text-sm font-bold text-slate-500">
        ກຳລັງໂຫຼດແດຊບອດ...
      </p>

      <template v-else>
        <div class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <article class="card-soft p-5">
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-xl">📖</div>
            <p class="mt-4 font-number text-3xl font-black text-[#0f1f4d]">{{ enrollments.length }}</p>
            <p class="mt-2 text-sm font-bold text-slate-500">ຄອສທີ່ລົງທະບຽນ</p>
          </article>

          <article class="card-soft p-5">
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-[#f5a400]/10 text-xl">⏱</div>
            <p class="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1 text-[#0f1f4d]">
              <span
                v-for="part in totalLearningTimeParts"
                :key="part.unit"
                class="inline-flex items-end gap-1"
              >
                <span class="font-number text-3xl font-black leading-none">{{ part.value }}</span>
                <span class="text-base font-black leading-none text-slate-500">{{ part.unit }}</span>
              </span>
            </p>
            <p class="mt-2 text-sm font-bold text-slate-500">Learning time</p>
          </article>

          <article class="card-soft p-5">
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-xl">🏆</div>
            <p class="mt-4 font-number text-3xl font-black text-[#0f1f4d]">{{ completedCoursesCount }}</p>
            <p class="mt-2 text-sm font-bold text-slate-500">ຄອສສຳເລັດ</p>
          </article>

          <article class="card-soft p-5 flex flex-col justify-between h-full bg-card border-border">
            <div class="flex items-center justify-between">
              <div class="grid h-10 w-10 place-items-center rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 text-xl font-bold">↗</div>
              <p class="text-xs font-bold text-muted-foreground">ຄວາມຄືບໜ້າສະເລ່ຍ</p>
            </div>
            
            <div class="mt-4 flex items-center justify-center">
              <div class="relative flex items-center justify-center h-24 w-24">
                <svg class="w-full h-full transform -rotate-90">
                  <!-- Background circle -->
                  <circle cx="48" cy="48" r="38" stroke="currentColor" stroke-width="7" class="text-slate-100 dark:text-slate-800" fill="transparent" />
                  <!-- Progress circle -->
                  <circle cx="48" cy="48" r="38" stroke="currentColor" stroke-width="7" class="text-red-500 transition-all duration-100 ease-out" fill="transparent"
                    :stroke-dasharray="2 * Math.PI * 38"
                    :stroke-dashoffset="2 * Math.PI * 38 * (1 - animatedProgress / 100)" />
                </svg>
                <span class="absolute font-number font-black text-xl text-foreground">{{ Math.round(animatedProgress) }}%</span>
              </div>
            </div>
          </article>
        </div>

        <div class="mt-8 inline-grid w-full max-w-2xl grid-cols-3 rounded-2xl bg-slate-200/80 p-1">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black transition"
            :class="activeTab === tab.key ? 'bg-white text-[#142b63] shadow-sm' : 'text-slate-500 hover:text-[#142b63]'"
            @click="activeTab = tab.key"
          >
            <span>{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <section v-if="activeTab === 'learning'" class="mt-6 space-y-5">
          <p v-if="enrollments.length === 0" class="card-soft px-6 py-10 text-center text-sm font-bold text-slate-500">
            ຍັງບໍ່ມີຄອສທີ່ລົງທະບຽນ
          </p>

          <article
            v-for="enrollment in enrollments"
            :key="enrollment.enrollment_id"
            class="card-soft flex flex-col gap-4 p-4 md:flex-row md:items-center"
          >
            <img
              :src="enrollment.course.thumbnail_url ? resolveFileUrl(enrollment.course.thumbnail_url) : fallbackCourseImage"
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

            <button
              v-if="!getCourseCertificate(enrollment.course_id)"
              type="button"
              :disabled="!isCourseComplete(enrollment) || issuingCourseId === enrollment.course_id"
              class="inline-flex shrink-0 items-center justify-center rounded-xl border px-5 py-3 text-sm font-black transition"
              :class="
                isCourseComplete(enrollment)
                  ? 'border-[#f5a400]/40 bg-[#f5a400]/10 text-[#9a6500] hover:bg-[#f5a400]/20'
                  : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-70'
              "
              @click="handleIssueCertificate(enrollment)"
            >
              {{ issuingCourseId === enrollment.course_id ? 'ກຳລັງອອກ...' : 'ຮັບໃບປະກາດ' }}
            </button>

            <button
              v-else-if="getCourseCertificate(enrollment.course_id)"
              type="button"
              class="inline-flex shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700"
              @click="activeTab = 'certificates'"
            >
              ມີໃບປະກາດແລ້ວ
            </button>

            <RouterLink
              v-if="!getFirstLessonId(enrollment)"
              :to="`/courses/${enrollment.course_id}`"
              class="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-[#142b63] transition hover:border-[#142b63]"
            >
              ເບິ່ງຄອສ
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

        <section v-else class="mt-6">
          <p
            v-if="certificateMessage"
            class="mb-4 rounded-2xl bg-[#f5a400]/10 px-5 py-4 text-sm font-bold text-[#9a6500]"
          >
            {{ certificateMessage }}
          </p>

          <p
            v-if="certificates.length === 0"
            class="card-soft px-6 py-10 text-center text-sm font-bold text-slate-500"
          >
            ຍັງບໍ່ມີໃບປະກາດ
          </p>

          <div v-else class="grid gap-6 xl:grid-cols-2">
            <article
              v-for="certificate in certificates"
              :key="certificate.certificate_id"
              :id="`certificate-card-${certificate.certificate_id}`"
              class="certificate-print-card relative overflow-hidden rounded-[1.75rem] border border-[#f5a400]/40 bg-[#fffdf8] p-2 shadow-[0_22px_60px_rgba(15,31,77,0.10)]"
              :class="{ 'is-printing': printingCertificateId === certificate.certificate_id }"
            >
              <div class="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#f5a400]/15"></div>
              <div class="absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-[#142b63]/10"></div>

              <div class="relative rounded-[1.4rem] border border-dashed border-[#f5a400]/50 bg-white/90 p-6">
                <img
                  :src="logoUrl"
                  alt=""
                  class="pointer-events-none absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.045]"
                />
                <div class="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p class="text-xs font-black uppercase tracking-[0.28em] text-[#9a6500]">
                      Certificate of Completion
                    </p>
                    <p class="mt-5 text-sm font-black uppercase tracking-wide text-slate-400">
                      Awarded to
                    </p>
                    <h2 class="mt-1 text-3xl font-black leading-tight text-[#0f1f4d]">
                      {{ displayName }}
                    </h2>
                    <p class="mt-5 text-sm font-black uppercase tracking-wide text-slate-400">
                      For successfully completing
                    </p>
                    <h3 class="mt-1 text-2xl font-black leading-tight text-[#142b63]">
                      {{ certificate.course.title }}
                    </h3>
                    <p class="mt-4 max-w-xl text-sm font-medium leading-7 text-slate-500">
                      This certificate confirms that the learner completed all required lessons and passed the course requirements.
                    </p>
                  </div>

                  <div
                    class="grid h-24 w-24 shrink-0 place-items-center rounded-full border-8 border-[#f5a400]/20 bg-white p-3 shadow-[0_16px_40px_rgba(20,43,99,0.22)]"
                  >
                    <img :src="logoUrl" alt="LearnDee" class="h-full w-full object-contain" />
                  </div>
                </div>

                <div class="mt-8 grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-3">
                  <div>
                    <p class="text-xs font-black uppercase text-slate-400">Instructor</p>
                    <p class="mt-1 text-sm font-black text-[#142b63]">
                      {{ getCertificateInstructorName(certificate) }}
                    </p>
                  </div>

                  <div>
                    <p class="text-xs font-black uppercase text-slate-400">Issued date</p>
                    <p class="mt-1 text-sm font-black text-[#142b63]">
                      {{ formatDate(certificate.issued_at) }}
                    </p>
                  </div>

                  <div>
                    <p class="text-xs font-black uppercase text-slate-400">Certificate code</p>
                    <p class="mt-1 font-number text-sm font-black text-[#f5a400]">
                      {{ certificate.certificate_code }}
                    </p>
                  </div>
                </div>

                <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p class="text-xs font-bold text-slate-400">
                    Verified by LearnDee
                  </p>

                  <div class="flex gap-2 certificate-no-print">
                    <button
                      type="button"
                      :disabled="downloadingCertificateId === certificate.certificate_id"
                      class="rounded-xl bg-[#142b63] px-4 py-2 text-sm font-black text-white transition hover:bg-[#0e214d] disabled:cursor-not-allowed disabled:bg-slate-400"
                      @click="handleDownloadCertificate(certificate.certificate_id, certificate.course.title)"
                    >
                      {{ downloadingCertificateId === certificate.certificate_id ? 'ກຳລັງດາວໂຫຼດ...' : 'ດາວໂຫຼດຮູບພາບ' }}
                    </button>
                    <button
                      type="button"
                      class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-[#142b63] transition hover:border-[#142b63]"
                      @click="handlePrintCertificate(certificate.certificate_id)"
                    >
                      Print certificate
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </template>
    </section>

    <HomeFooter />
  </main>
</template>

<style scoped>
@media print {
  :global(body *) {
    visibility: hidden !important;
  }

  .certificate-print-card {
    display: none !important;
  }

  .certificate-print-card.is-printing,
  .certificate-print-card.is-printing * {
    visibility: visible !important;
  }

  .certificate-print-card.is-printing {
    display: block !important;
    position: fixed !important;
    inset: 24px !important;
    width: calc(100vw - 48px) !important;
    height: auto !important;
    box-shadow: none !important;
    background: #fffdf8 !important;
  }

  .certificate-no-print {
    display: none !important;
  }
}
</style>
