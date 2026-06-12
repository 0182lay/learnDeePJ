<script setup lang="ts">
import axios from 'axios'
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
import type { CourseDetail } from '../types/course'
import type { MyEnrollment } from '../types/enrollment'
import type { Lesson } from '../types/lesson'
import type { MyPayment } from '../types/payment'
import type { LearningProgress } from '../types/progress'

const route = useRoute()
const router = useRouter()
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
  { key: 'overview', label: 'เบเบฒเบเบฅเบงเบก' },
  { key: 'curriculum', label: 'เบซเบผเบฑเบเบชเบนเบ”' },
  { key: 'instructor', label: 'เบเบนเปเบชเบญเบ' },
  { key: 'reviews', label: 'เบเบณเป€เบซเบฑเบ' },
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

  return fullName || course.value?.instructor.email || 'เบเบนเปเบชเบญเบ'
})

const instructorAvatar = computed(() => {
  return course.value?.instructor.profile?.avatar_url
    ? resolveThumbnail(course.value.instructor.profile.avatar_url)
    : ''
})

const instructorInitial = computed(() => instructorName.value.slice(0, 1).toUpperCase())

const lastUpdatedText = computed(() => {
  const date = course.value?.updated_at || course.value?.created_at
  if (!date) return 'เบญเบฑเบเป€เบ”เบ”เบฅเปเบฒเบชเบธเบ”'

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
  return count > 0 ? `${count} เบฃเบตเบงเบดเบง` : 'เบเบฑเบเบเปเปเบกเบตเบฃเบตเบงเบดเบง'
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
    errorMessage.value = 'เปเบซเบผเบ”เบฅเบฒเบเบฅเบฐเบญเบฝเบ”เบเบญเบชเบเปเปเบชเบณเป€เบฅเบฑเบ”'
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
  return isAlreadyEnrolled.value && (!requiresPayment.value || !!currentEnrollment.value?.is_paid)
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
    enrollMessage.value = 'เบเบญเบชเบเบตเปเบเบฑเบเบเปเปเป€เบเบตเบ”เบชเบญเบ'
    return
  }

  try {
    isEnrolling.value = true
    enrollMessage.value = ''

    const courseId = route.params.courseId as string
    await enrollCourse(courseId)
    await refreshEnrollmentState(courseId)

    if (requiresPayment.value && !currentEnrollment.value?.is_paid) {
      if (hasSubmittedSlip.value) {
        enrollMessage.value = 'เบชเบปเปเบเบชเบฐเบฅเบตเบเปเบฅเปเบง. เบฅเปเบ–เปเบฒเบเบฒเบเบญเบฐเบเบธเบกเบฑเบ”เบเบฒเบเปเบญเบ”เบกเบดเบ.'
        return
      }

      showPaymentDialog.value = true
      enrollMessage.value = 'เบฅเบปเบเบ—เบฐเบเบฝเบเปเบฅเปเบง. เบเบฐเบฅเบธเบเบฒเบญเบฑเบเปเบซเบผเบ”เบชเบฐเบฅเบตเบเป€เบเบทเปเบญเปเบซเปเปเบญเบ”เบกเบดเบเบเบงเบ”.'
    } else {
      enrollMessage.value = 'เบฅเบปเบเบ—เบฐเบเบฝเบเบเบญเบชเบชเบณเป€เบฅเบฑเบ”'
    }
  } catch (error: unknown) {
    if (axios.isAxiosError<{ message: string }>(error)) {
      enrollMessage.value = error.response?.data?.message || 'เบฅเบปเบเบ—เบฐเบเบฝเบเบเปเปเบชเบณเป€เบฅเบฑเบ”'
      return
    }

    enrollMessage.value = 'เบฅเบปเบเบ—เบฐเบเบฝเบเบเปเปเบชเบณเป€เบฅเบฑเบ”'
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
    enrollMessage.value = 'เบชเบปเปเบเบชเบฐเบฅเบตเบเปเบฅเปเบง. เบฅเปเบ–เปเบฒเบเบฒเบเบญเบฐเบเบธเบกเบฑเบ”เบเบฒเบเปเบญเบ”เบกเบดเบ.'
  } catch (error: unknown) {
    showPaymentDialog.value = false

    if (axios.isAxiosError<{ message: string }>(error)) {
      enrollMessage.value = error.response?.data?.message || 'เบญเบฑเบเปเบซเบผเบ”เบชเบฐเบฅเบตเบเบเปเปเบชเบณเป€เบฅเบฑเบ”'
      return
    }

    enrollMessage.value = 'เบญเบฑเบเปเบซเบผเบ”เบชเบฐเบฅเบตเบเบเปเปเบชเบณเป€เบฅเบฑเบ”'
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
              โ เบเบฑเบเบเบทเบเบฅเบฒเบเบเบฒเบเบเบญเบช
            </RouterLink>

            <div class="mt-7 flex flex-wrap gap-2">
              <span class="rounded-full bg-secondary px-3 py-1 text-xs font-black text-secondary-foreground">
                {{ course.category.name }}
              </span>
              <span class="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-black text-white">
                {{ course.level || 'เป€เบฅเบตเปเบกเบ•เบปเปเบ' }}
              </span>
              <span class="rounded-full bg-accent/20 px-3 py-1 text-xs font-black text-emerald-100">
                Bestseller
              </span>
            </div>

            <h1 class="mt-3 max-w-[700px] font-heading text-4xl font-black leading-tight md:text-[2.7rem]">
              {{ course.title }}
            </h1>

            <p class="mt-4 max-w-[720px] text-sm font-semibold leading-7 text-white/88 md:text-base">
              {{ course.description || 'เบเบญเบชเบเบตเปเบเบฑเบเบเปเปเบกเบตเบเบณเบญเบฐเบ—เบดเบเบฒเบ' }}
            </p>

            <div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-white/88">
              <span class="text-secondary">โ…โ…โ…โ…โ… <span class="text-white">{{ courseRatingText }}</span></span>
              <span>({{ courseReviewText }})</span>
              <span>๐‘ฅ 1,250 เบเบฑเบเบฎเบฝเบ</span>
              <span>๐ เบเบฒเบชเบฒเบฅเบฒเบง</span>
              <span>โ—ท เบญเบฑเบเป€เบ”เบ” {{ lastUpdatedText }}</span>
            </div>

            <div class="mt-7 flex items-center gap-3">
              <span v-if="instructorAvatar" class="h-12 w-12 overflow-hidden rounded-full bg-white/15">
                <img :src="instructorAvatar" :alt="instructorName" class="h-full w-full object-cover" />
              </span>
              <span v-else class="grid h-12 w-12 place-items-center rounded-full bg-secondary text-lg font-black text-secondary-foreground">
                {{ instructorInitial }}
              </span>
              <div>
                <p class="text-xs font-bold text-white/58">เบชเปเบฒเบเปเบ”เบ</p>
                <p class="font-black text-white">{{ instructorName }}</p>
              </div>
            </div>

            <div class="mt-28 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div class="h-[170px] rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <p class="text-xl text-secondary">โ–ฑ</p>
                <p class="mt-4 font-heading text-xl font-black">{{ lessons.length }}</p>
                <p class="text-xs font-bold text-white/62">เบเบปเบ”เบฎเบฝเบ</p>
              </div>
              <div class="h-[170px] rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <p class="text-xl text-secondary">โ—ท</p>
                <p class="mt-4 font-heading text-xl font-black">12 เบเบก</p>
                <p class="text-xs font-bold text-white/62">เป€เบงเบฅเบฒเบฎเบฝเบ</p>
              </div>
              <div class="h-[170px] rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <p class="text-xl text-secondary">๐‘ฅ</p>
                <p class="mt-4 font-heading text-xl font-black">1,250</p>
                <p class="text-xs font-bold text-white/62">เบเบฑเบเบฎเบฝเบ</p>
              </div>
              <div class="h-[170px] rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <p class="text-xl text-secondary">๐</p>
                <p class="mt-4 font-heading text-xl font-black">98%</p>
                <p class="text-xs font-bold text-white/62">เบเบงเบฒเบกเบเปเปเบ</p>
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
                <h2 class="font-heading text-2xl font-black text-card-foreground">เบเบฒเบเบฅเบงเบก</h2>
                <p class="mt-3 text-base leading-8 text-muted-foreground">
                  {{ course.description || 'เบเบญเบชเบเบตเปเบเบฑเบเบเปเปเบกเบตเบเบณเบญเบฐเบ—เบดเบเบฒเบ' }}
                </p>
              </div>

              <CourseOutcomesSection />
            </div>

            <CourseLessonsSection
              v-else-if="activeDetailTab === 'curriculum'"
              :course-id="course.course_id"
              :lessons="lessons"
              :current-enrollment-id="currentEnrollmentId"
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
                  เบเบนเปเบชเบญเบเบเบญเบเบเบญเบชเบเบตเป เบเปเบญเบกเบเบฒเบเบนเปเบฎเบฝเบเปเบเบ•เบฒเบกเบเบปเบ”เบฎเบฝเบเปเบเบเป€เบเบฑเบเบเบฑเปเบเบ•เบญเบ.
                </p>
                <div class="mt-5 grid gap-3 sm:grid-cols-3">
                  <div class="rounded-xl bg-muted p-4">
                    <p class="font-heading text-xl font-black text-primary">1+</p>
                    <p class="text-xs font-bold text-muted-foreground">เบเบญเบช</p>
                  </div>
                  <div class="rounded-xl bg-muted p-4">
                    <p class="font-heading text-xl font-black text-primary">350+</p>
                    <p class="text-xs font-bold text-muted-foreground">เบเบฑเบเบฎเบฝเบ</p>
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
