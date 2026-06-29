<script setup lang="ts">
import { Award, BookOpen, CalendarClock, Globe2, Star, Users, Clock, Trophy } from '@lucide/vue'
import axios from 'axios'
import confetti from 'canvas-confetti'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { enrollCourse, getMyEnrollments } from '../api/enrollmentApi'
import { getLessonsByCourseId } from '../api/lessonApi'
import { createPayment, getMyPayments, uploadPaymentSlip } from '../api/paymentApi'
import { getProgress, updateProgress } from '../api/progressApi'
import { getCourseById } from '../api/courseApi'
import CourseLessonsSection from '../components/course-detail/CourseLessonsSection.vue'
import CourseOutcomesSection from '../components/course-detail/CourseOutcomesSection.vue'
import CoursePurchaseCard from '../components/course-detail/CoursePurchaseCard.vue'
import CourseReviewsSection from '../components/course-detail/CourseReviewsSection.vue'
import PaymentDialog from '../components/payment/PaymentDialog.vue'
import { resolveAssetUrl } from '../api/config'
import { useAuthStore } from '../stores/authStore'
import type { CourseDetail } from '../types/course'
import type { MyEnrollment } from '../types/enrollment'
import type { Lesson } from '../types/lesson'
import type { MyPayment } from '../types/payment'
import type { LearningProgress } from '../types/progress'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const lessons = ref<Lesson[]>([])
const course = ref<CourseDetail | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')
const enrollMessage = ref('')
const isEnrolling = ref(false)
const enrollments = ref<MyEnrollment[]>([])
const payments = ref<MyPayment[]>([])
const isAlreadyEnrolled = ref(false)
const currentEnrollment = ref<MyEnrollment | null>(null)
const currentEnrollmentId = ref('')
const progressList = ref<LearningProgress[]>([])
const showPaymentDialog = ref(false)
const activeDetailTab = ref<'overview' | 'curriculum' | 'instructor' | 'reviews'>('overview')

const detailTabs = [
  { key: 'overview', label: 'ພາບລວມ' },
  { key: 'curriculum', label: 'ຫຼັກສູດ' },
  { key: 'instructor', label: 'ຜູ້ສອນ' },
  { key: 'reviews', label: 'ຄວາມເຫັນ' },
] as const

const formatPrice = (price: string) => {
  const numberPrice = Number(String(price).replace(/,/g, ''))

  if (Number.isNaN(numberPrice)) {
    return price
  }

  return new Intl.NumberFormat('en-US').format(numberPrice)
}

const resolveThumbnail = (url: string | null) => resolveAssetUrl(url)

const hasAuthToken = () => !!localStorage.getItem('token')

const instructorName = computed(() => {
  const profile = course.value?.instructor.profile
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
  const baseName = fullName || course.value?.instructor.email || 'ຜູ້ສອນ'

  return baseName.startsWith('ອ.') ? baseName : `ອ. ${baseName}`
})

const instructorAvatar = computed(() => {
  return course.value?.instructor.profile?.avatar_url
    ? resolveThumbnail(course.value.instructor.profile.avatar_url)
    : ''
})

const instructorInitial = computed(() => {
  const profile = course.value?.instructor.profile
  const name = profile?.first_name || instructorName.value
  const cleanName = name.startsWith('ອ. ') ? name.slice(3) : name.startsWith('ອ.') ? name.slice(2) : name
  return cleanName ? cleanName.charAt(0).toUpperCase() : 'ຜ'
})

const getMockDuration = (lessonCount: number | undefined) => {
  const count = lessonCount || 0
  if (count === 40) return 25
  if (count === 16) return 7
  if (count === 24) return 11
  return Math.max(Math.round(count * 0.6), 1)
}

const lastUpdatedText = computed(() => {
  const date = course.value?.updated_at || course.value?.created_at
  if (!date) return 'ບໍ່ມີຂໍ້ມູນວັນທີ'

  return new Intl.DateTimeFormat('lo-LA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
})

const courseRatingText = computed(() => {
  return course.value?.review_count ? (course.value.average_rating || 0).toFixed(1) : '0.0'
})

const courseReviewText = computed(() => {
  const count = course.value?.review_count || 0
  return count > 0 ? `${count} ຣີວິວ` : 'ຍັງບໍ່ມີຣີວິວ'
})

const courseEnrollmentCount = computed(() => course.value?.enrollment_count || 0)

const courseLessonCount = computed(() => {
  return lessons.value.length || course.value?.lesson_count || 0
})

const levelLabel = computed(() => {
  const labels: Record<string, string> = {
    beginner: 'ເລີ່ມຕົ້ນ',
    intermediate: 'ປານກາງ',
    advanced: 'ຂັ້ນສູງ',
  }

  return course.value?.level ? labels[course.value.level] || course.value.level : 'ເລີ່ມຕົ້ນ'
})

const showTopRatedBadge = computed(() => {
  return (course.value?.review_count || 0) > 0 && (course.value?.average_rating || 0) >= 4.5
})

const refreshEnrollmentState = async (courseId: string) => {
  enrollments.value = await getMyEnrollments()
  payments.value = await getMyPayments()
  currentEnrollment.value =
    enrollments.value.find((enrollment) => enrollment.course_id === courseId) || null
  isAlreadyEnrolled.value = !!currentEnrollment.value
  currentEnrollmentId.value = currentEnrollment.value?.enrollment_id || ''

  if (currentEnrollment.value) {
    progressList.value = await getProgress(currentEnrollment.value.enrollment_id)
  } else {
    progressList.value = []
  }
}

const fetchCourse = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const courseId = route.params.courseId as string
    course.value = await getCourseById(courseId)
    lessons.value = await getLessonsByCourseId(courseId)

    if (hasAuthToken()) {
      await refreshEnrollmentState(courseId)
    } else {
      enrollments.value = []
      payments.value = []
      currentEnrollment.value = null
      isAlreadyEnrolled.value = false
      currentEnrollmentId.value = ''
      progressList.value = []
    }
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ໂຫຼດລາຍລະອຽດຄອສບໍ່ສຳເລັດ'
  } finally {
    isLoading.value = false
  }
}

const isLessonCompleted = (lessonId: string) => {
  return progressList.value.some(
    (progress) => progress.lesson_id === lessonId && progress.is_completed,
  )
}

const completedLessonCount = computed(() => {
  return lessons.value.filter((lesson) => isLessonCompleted(lesson.lesson_id)).length
})

const progressPercent = computed(() => {
  if (lessons.value.length === 0) return 0
  return Math.round((completedLessonCount.value / lessons.value.length) * 100)
})

const firstLessonId = computed(() => lessons.value[0]?.lesson_id || '')

const coursePriceNumber = computed(() => {
  return Number(String(course.value?.price || 0).replace(/,/g, '')) || 0
})

const requiresPayment = computed(() => coursePriceNumber.value > 0)

const canAccessCourse = computed(() => {
  return (
    isAlreadyEnrolled.value &&
    currentEnrollment.value?.status !== 'dropped' &&
    (!requiresPayment.value || !!currentEnrollment.value?.is_paid)
  )
})

const canAccessLessons = computed(() => {
  if (canAccessCourse.value) {
    return true
  }

  if (authStore.user?.role === 'admin') {
    return true
  }

  if (authStore.user?.role === 'instructor') {
    return course.value?.instructor.user_id === authStore.user.id
  }

  return false
})

const coursePayment = computed(() => {
  return payments.value.find((payment) => payment.course_id === course.value?.course_id)
})

const hasSubmittedSlip = computed(() => {
  return !!coursePayment.value?.slip_url && coursePayment.value.status === 'pending'
})

const handleCompleteLesson = async (lessonId: string) => {
  if (!currentEnrollmentId.value) {
    return
  }

  const updated = await updateProgress(currentEnrollmentId.value, lessonId, {
    is_completed: true,
  })

  const index = progressList.value.findIndex((progress) => progress.lesson_id === lessonId)

  if (index >= 0) {
    progressList.value[index] = updated
  } else {
    progressList.value.push(updated)
  }
}

const handleEnroll = async () => {
  if (!hasAuthToken()) {
    router.push({
      path: '/login',
      query: { redirect: route.fullPath },
    })
    return
  }

  if (!course.value?.is_published) {
    enrollMessage.value = 'ຄອສນີ້ຍັງບໍ່ເປີດສອນ'
    return
  }

  try {
    isEnrolling.value = true
    enrollMessage.value = ''

    const courseId = route.params.courseId as string

    if (requiresPayment.value && !currentEnrollment.value?.is_paid) {
      if (hasSubmittedSlip.value) {
        enrollMessage.value = 'ສົ່ງສະລິບແລ້ວ. ລໍຖ້າການອະນຸມັດຈາກແອດມິນ.'
        return
      }

      showPaymentDialog.value = true
      enrollMessage.value = ''
      return
    }

    await enrollCourse(courseId)
    await refreshEnrollmentState(courseId)

    if (requiresPayment.value && !currentEnrollment.value?.is_paid) {
      if (hasSubmittedSlip.value) {
        enrollMessage.value = 'ສົ່ງສະລິບແລ້ວ. ລໍຖ້າການອະນຸມັດຈາກແອດມິນ.'
        return
      }

      showPaymentDialog.value = true
      enrollMessage.value = 'ລົງທະບຽນແລ້ວ. ກະລຸນາອັບໂຫຼດສະລິບເພື່ອໃຫ້ແອດມິນກວດ.'
    } else {
      enrollMessage.value = 'ລົງທະບຽນຄອສສຳເລັດ'
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      })
    }
  } catch (error: unknown) {
    if (axios.isAxiosError<{ message: string }>(error)) {
      enrollMessage.value = error.response?.data?.message || 'ລົງທະບຽນບໍ່ສຳເລັດ'
      return
    }

    enrollMessage.value = 'ລົງທະບຽນບໍ່ສຳເລັດ'
  } finally {
    isEnrolling.value = false
  }
}

const handlePaymentSuccess = async (slip: File) => {
  try {
    isEnrolling.value = true
    enrollMessage.value = ''

    const courseId = route.params.courseId as string
    if (!currentEnrollment.value) {
      try {
        await enrollCourse(courseId)
      } catch (error: unknown) {
        await refreshEnrollmentState(courseId)

        if (!currentEnrollment.value) {
          throw error
        }
      }
    }

    const payment = await createPayment(courseId, 'slip')
    await uploadPaymentSlip(payment.payment_id, slip)
    await refreshEnrollmentState(courseId)
    showPaymentDialog.value = false
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.6 },
    })
    enrollMessage.value = 'ສົ່ງສະລິບແລ້ວ. ລໍຖ້າການອະນຸມັດຈາກແອດມິນ.'
  } catch (error: unknown) {
    showPaymentDialog.value = false

    if (axios.isAxiosError<{ message: string }>(error)) {
      enrollMessage.value = error.response?.data?.message || 'ອັບໂຫຼດສະລິບບໍ່ສຳເລັດ'
      return
    }

    enrollMessage.value = 'ອັບໂຫຼດສະລິບບໍ່ສຳເລັດ'
  } finally {
    isEnrolling.value = false
  }
}

onMounted(() => {
  fetchCourse()
})
</script>

<template>
  <main class="min-h-screen bg-background">
    <section
      v-if="isLoading"
      class="mx-auto grid max-w-[1120px] gap-6 px-6 py-10 lg:grid-cols-[1fr_320px]"
      aria-busy="true"
    >
      <div class="loading-panel min-h-[460px] p-6">
        <div class="loading-line h-5 w-36"></div>
        <div class="mt-8 space-y-4">
          <div class="loading-line h-10 w-3/4"></div>
          <div class="loading-line h-4 w-full"></div>
          <div class="loading-line h-4 w-2/3"></div>
        </div>
        <div class="mt-16 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div v-for="index in 4" :key="index" class="loading-panel h-[150px]"></div>
        </div>
      </div>
      <div class="loading-panel h-[420px]"></div>
    </section>

    <section v-else-if="errorMessage" class="px-8 py-16">
      <p class="mx-auto max-w-3xl rounded-xl bg-red-50 px-5 py-4 text-center text-red-600">
        {{ errorMessage }}
      </p>
    </section>

    <template v-else-if="course">
      <section class="course-detail-hero">
        <div class="mx-auto grid min-h-[580px] max-w-[1120px] gap-9 px-6 py-9 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div class="min-w-0 text-white">
            <RouterLink
              to="/courses"
              class="inline-flex items-center gap-2 text-sm font-bold text-white/75 transition hover:text-white"
            >
              ← ກັບຄືນລາຍການຄອສ
            </RouterLink>

            <div class="mt-7 flex flex-wrap gap-2">
              <span class="rounded-full bg-[#f5a400] px-3 py-1 text-xs font-black text-slate-900 shadow-sm">
                {{ course.category.name }}
              </span>
              <span class="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-black text-white">
                {{ levelLabel }}
              </span>
              <span
                v-if="showTopRatedBadge"
                class="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-100"
              >
                <Award class="h-3.5 w-3.5" /> ຄະແນນສູງ
              </span>
            </div>

            <h1 class="mt-3 max-w-[700px] font-heading text-4xl font-black leading-tight md:text-[2.7rem] text-white">
              {{ course.title }}
            </h1>

            <p class="mt-4 max-w-[720px] text-sm font-semibold leading-7 text-white/88 md:text-base">
              {{ course.description || 'ຄອສນີ້ຍັງບໍ່ມີຄຳອະທິບາຍ' }}
            </p>

            <div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-white/88">
              <div class="flex items-center gap-1">
                <div class="flex items-center gap-0.5 text-[#f5a400]">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    class="h-3.5 w-3.5"
                    :class="i <= Math.round(Number(courseRatingText)) ? 'fill-current' : 'opacity-35'"
                  />
                </div>
                <span class="text-white ml-1">{{ courseRatingText }}</span>
              </div>
              <span>({{ courseReviewText }})</span>
              <span class="inline-flex items-center gap-1">
                <Users class="h-3.5 w-3.5 text-white/70" /> {{ courseEnrollmentCount.toLocaleString('en-US') }} ນັກຮຽນ
              </span>
              <span class="inline-flex items-center gap-1">
                <Globe2 class="h-3.5 w-3.5 text-white/70" /> ພາສາລາວ
              </span>
              <span class="inline-flex items-center gap-1">
                <CalendarClock class="h-3.5 w-3.5 text-white/70" /> ອັບເດດລ່າສຸດ {{ lastUpdatedText }}
              </span>
            </div>

            <div class="mt-7 flex items-center gap-3">
              <span v-if="instructorAvatar" class="h-12 w-12 overflow-hidden rounded-full bg-white/15">
                <img :src="instructorAvatar" :alt="instructorName" class="h-full w-full object-cover" />
              </span>
              <span v-else class="grid h-12 w-12 place-items-center rounded-full bg-[#f5a400] text-lg font-black text-slate-950">
                {{ instructorInitial }}
              </span>
              <div>
                <p class="text-[10px] font-bold text-white/58">ສ້າງໂດຍ</p>
                <p class="font-black text-white text-sm">{{ instructorName }}</p>
              </div>
            </div>

            <div class="mt-28 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div class="h-[140px] rounded-2xl border border-white/15 bg-white/8 p-5 backdrop-blur-md flex flex-col justify-between">
                <BookOpen class="h-5 w-5 text-[#f5a400]" />
                <div>
                  <p class="font-number text-2xl font-black text-white leading-none">{{ courseLessonCount }}</p>
                  <p class="text-[11px] font-bold text-white/60 mt-1">ບົດຮຽນ</p>
                </div>
              </div>
              <div class="h-[140px] rounded-2xl border border-white/15 bg-white/8 p-5 backdrop-blur-md flex flex-col justify-between">
                <Clock class="h-5 w-5 text-[#f5a400]" />
                <div>
                  <p class="font-number text-2xl font-black text-white leading-none">{{ getMockDuration(courseLessonCount) }} ຊມ</p>
                  <p class="text-[11px] font-bold text-white/60 mt-1">ຄວາມຍາວ</p>
                </div>
              </div>
              <div class="h-[140px] rounded-2xl border border-white/15 bg-white/8 p-5 backdrop-blur-md flex flex-col justify-between">
                <Users class="h-5 w-5 text-[#f5a400]" />
                <div>
                  <p class="font-number text-2xl font-black text-white leading-none">{{ courseEnrollmentCount.toLocaleString('en-US') }}</p>
                  <p class="text-[11px] font-bold text-white/60 mt-1">ນັກຮຽນ</p>
                </div>
              </div>
              <div class="h-[140px] rounded-2xl border border-white/15 bg-white/8 p-5 backdrop-blur-md flex flex-col justify-between">
                <Trophy class="h-5 w-5 text-[#f5a400]" />
                <div>
                  <p class="font-number text-2xl font-black text-white leading-none">98%</p>
                  <p class="text-[11px] font-bold text-white/60 mt-1">ຄວາມພໍໃຈ</p>
                </div>
              </div>
            </div>
          </div>

          <CoursePurchaseCard
            class="lg:sticky lg:top-24 lg:mt-8 lg:self-start"
            :thumbnail-url="resolveThumbnail(course.thumbnail_url)"
            :title="course.title"
            :price="formatPrice(course.price)"
            :lesson-count="lessons.length"
            :course-id="course.course_id"
            :first-lesson-id="firstLessonId"
            :progress-percent="progressPercent"
            :is-already-enrolled="isAlreadyEnrolled"
            :can-access-course="canAccessCourse"
            :requires-payment="requiresPayment"
            :is-paid="!!currentEnrollment?.is_paid"
            :has-submitted-slip="hasSubmittedSlip"
            :is-enrolling="isEnrolling"
            :enroll-message="enrollMessage"
            :is-published="course.is_published"
            @enroll="handleEnroll"
          />
        </div>
      </section>

      <section class="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
        <section class="card-soft overflow-hidden">
          <div class="flex flex-wrap gap-2 border-b border-slate-200 bg-muted/60 p-2">
            <button
              v-for="tab in detailTabs"
              :key="tab.key"
              type="button"
              class="rounded-lg px-4 py-2 text-sm transition duration-300 ease-out"
              :class="
                activeDetailTab === tab.key
                  ? 'bg-card font-black text-primary shadow-[var(--card-shadow)]'
                  : 'font-bold text-muted-foreground hover:text-primary'
              "
              @click="activeDetailTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="animate-card-in p-5 md:p-6">
            <div v-if="activeDetailTab === 'overview'" class="space-y-6">
              <div>
                <h2 class="font-heading text-2xl font-black text-card-foreground">ພາບລວມ</h2>
                <p class="mt-3 text-base leading-8 text-muted-foreground">
                  {{ course.description || 'ຄອສນີ້ຍັງບໍ່ມີຄຳອະທິບາຍ' }}
                </p>
              </div>

              <CourseOutcomesSection />
            </div>

            <CourseLessonsSection
              v-else-if="activeDetailTab === 'curriculum'"
              :course-id="course.course_id"
              :lessons="lessons"
              :current-enrollment-id="currentEnrollmentId"
              :can-access-lessons="canAccessLessons"
              :is-lesson-completed="isLessonCompleted"
              @complete-lesson="handleCompleteLesson"
            />

            <div v-else-if="activeDetailTab === 'instructor'" class="grid gap-5 sm:grid-cols-[auto_1fr]">
              <div v-if="instructorAvatar" class="h-24 w-24 overflow-hidden rounded-full bg-muted">
                <img :src="instructorAvatar" :alt="instructorName" class="h-full w-full object-cover" />
              </div>
              <div v-else class="grid h-24 w-24 place-items-center rounded-full bg-primary text-3xl font-black text-white">
                {{ instructorInitial }}
              </div>
              <div>
                <h2 class="font-heading text-2xl font-black text-card-foreground">{{ instructorName }}</h2>
                <p class="mt-2 text-base leading-8 text-muted-foreground">
                  ຜູ້ສອນຂອງຄອສນີ້ ພ້ອມພາຜູ້ຮຽນໄປຕາມບົດຮຽນແບບເປັນຂັ້ນຕອນ.
                </p>
                <div class="mt-5 grid gap-3 sm:grid-cols-3">
                  <div class="rounded-xl bg-muted p-4">
                    <p class="font-heading text-xl font-black text-primary">1+</p>
                    <p class="text-xs font-bold text-muted-foreground">ຄອສ</p>
                  </div>
                  <div class="rounded-xl bg-muted p-4">
                    <p class="font-heading text-xl font-black text-primary">350+</p>
                    <p class="text-xs font-bold text-muted-foreground">ນັກຮຽນ</p>
                  </div>
                  <div class="rounded-xl bg-muted p-4">
                    <p class="font-heading text-xl font-black text-primary">{{ courseRatingText }}</p>
                    <p class="text-xs font-bold text-muted-foreground">rating</p>
                  </div>
                </div>
              </div>
            </div>

            <CourseReviewsSection
              v-else-if="activeDetailTab === 'reviews'"
              :course-id="course.course_id"
              :can-review="isAlreadyEnrolled"
              @updated="fetchCourse"
            />
          </div>
        </section>
      </section>

      <PaymentDialog
        :open="showPaymentDialog"
        :course-title="course.title"
        :price="course.price"
        :is-submitting="isEnrolling"
        @close="showPaymentDialog = false"
        @success="handlePaymentSuccess"
      />
    </template>
  </main>
</template>
