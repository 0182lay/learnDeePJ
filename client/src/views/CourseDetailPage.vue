<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { enrollCourse, getMyEnrollments } from '../api/enrollmentApi'
import { getLessonsByCourseId } from '../api/lessonApi'
import { createPayment } from '../api/paymentApi'
import { getProgress, updateProgress } from '../api/progressApi'
import { getCourseById } from '../api/courseApi'
import CourseDetailStats from '../components/course-detail/CourseDetailStats.vue'
import CourseExtraSections from '../components/course-detail/CourseExtraSections.vue'
import CourseLessonsSection from '../components/course-detail/CourseLessonsSection.vue'
import CoursePurchaseCard from '../components/course-detail/CoursePurchaseCard.vue'
import PaymentDialog from '../components/payment/PaymentDialog.vue'
import type { CourseDetail } from '../types/course'
import type { MyEnrollment } from '../types/enrollment'
import type { Lesson } from '../types/lesson'
import type { LearningProgress } from '../types/progress'

const route = useRoute()
const lessons = ref<Lesson[]>([])
const course = ref<CourseDetail | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')
const enrollMessage = ref('')
const isEnrolling = ref(false)
const enrollments = ref<MyEnrollment[]>([])
const isAlreadyEnrolled = ref(false)
const currentEnrollment = ref<MyEnrollment | null>(null)
const currentEnrollmentId = ref('')
const progressList = ref<LearningProgress[]>([])
const showPaymentDialog = ref(false)

const formatPrice = (price: string) => {
  const numberPrice = Number(String(price).replace(/,/g, ''))

  if (Number.isNaN(numberPrice)) {
    return price
  }

  return new Intl.NumberFormat('en-US').format(numberPrice)
}

const resolveThumbnail = (url: string | null) => {
  if (!url) {
    return ''
  }

  if (url.startsWith('http')) {
    return url
  }

  return `http://localhost:3003${url.startsWith('/') ? url : `/${url}`}`
}

const instructorName = computed(() => {
  const profile = course.value?.instructor.profile
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')

  return fullName || course.value?.instructor.email || 'ຜູ້ສອນ'
})

const refreshEnrollmentState = async (courseId: string) => {
  enrollments.value = await getMyEnrollments()
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
    await refreshEnrollmentState(courseId)
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
  if (!course.value?.is_published) {
    enrollMessage.value = 'ຄອສນີ້ຍັງບໍ່ເປີດສອນ ຈຶ່ງຍັງລົງທະບຽນບໍ່ໄດ້'
    return
  }

  try {
    isEnrolling.value = true
    enrollMessage.value = ''

    const courseId = route.params.courseId as string
    await enrollCourse(courseId)
    await refreshEnrollmentState(courseId)
    enrollMessage.value = 'ລົງທະບຽນຄອສສຳເລັດ'
  } catch (error: unknown) {
    if (axios.isAxiosError<{ message: string }>(error)) {
      enrollMessage.value = error.response?.data?.message || 'ລົງທະບຽນຄອສບໍ່ສຳເລັດ'
      return
    }

    enrollMessage.value = 'ລົງທະບຽນຄອສບໍ່ສຳເລັດ'
  } finally {
    isEnrolling.value = false
  }
}

const handlePaymentSuccess = async (method: 'qr' | 'card' | 'mobile') => {
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

    await createPayment(courseId, method)
    await refreshEnrollmentState(courseId)
    showPaymentDialog.value = false
    enrollMessage.value = 'ສ້າງ payment ແລ້ວ. ກຳລັງລໍຖ້າ admin ອະນຸມັດ'
  } catch (error: unknown) {
    showPaymentDialog.value = false

    if (axios.isAxiosError<{ message: string }>(error)) {
      enrollMessage.value = error.response?.data?.message || 'ສ້າງ payment ບໍ່ສຳເລັດ'
      return
    }

    enrollMessage.value = 'ສ້າງ payment ບໍ່ສຳເລັດ'
  } finally {
    isEnrolling.value = false
  }
}

onMounted(() => {
  fetchCourse()
})
</script>

<template>
  <main class="min-h-screen bg-[#f8fafc]">
    <section v-if="isLoading" class="px-8 py-16 text-center text-slate-500">Loading...</section>

    <section v-else-if="errorMessage" class="px-8 py-16">
      <p class="mx-auto max-w-3xl rounded-2xl bg-red-50 px-5 py-4 text-center text-red-600">
        {{ errorMessage }}
      </p>
    </section>

    <template v-else-if="course">
      <section class="hero-gradient">
        <div
          class="mx-auto grid max-w-[1700px] gap-10 px-8 py-10 lg:grid-cols-[1fr_400px] lg:px-20 2xl:px-28"
        >
          <div class="flex flex-col justify-between">
            <div>
              <RouterLink
                to="/courses"
                class="inline-flex items-center gap-2 text-sm font-bold text-white/80 transition hover:text-white"
              >
                ← ກັບໄປໜ້າລາຍການຄອສ
              </RouterLink>

              <div class="mt-7 flex flex-wrap gap-2">
                <span class="rounded-full bg-[#f5a400] px-3 py-1 text-xs font-bold text-slate-950">
                  {{ course.category.name }}
                </span>
                <span class="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white">
                  {{ course.level || 'ເລີ່ມຕົ້ນ' }}
                </span>
                <span
                  v-if="course.is_published"
                  class="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-200"
                >
                  Open course
                </span>
              </div>

              <h1 class="mt-5 max-w-4xl text-4xl font-black leading-tight text-white md:text-5xl xl:text-6xl">
                {{ course.title }}
              </h1>

              <p class="mt-5 max-w-3xl text-lg leading-9 text-white/85">
                {{ course.description || 'ຄອສນີ້ຍັງບໍ່ມີຄຳອະທິບາຍ' }}
              </p>

              <div class="mt-6 flex flex-wrap items-center gap-5 text-sm font-bold text-white/85">
                <span class="text-[#f5a400]">★★★★★ <span class="text-white">4.5</span></span>
                <span>ບົດຮຽນ {{ lessons.length }}</span>
                <span>{{ course.category.name }}</span>
              </div>

              <div class="mt-8 flex items-center gap-4">
                <div
                  class="grid h-12 w-12 place-items-center rounded-full bg-[#f5a400] font-black text-slate-950"
                >
                  ອ
                </div>

                <div>
                  <p class="text-sm text-white/60">ສ້າງໂດຍ</p>
                  <p class="font-black text-white">ອ. {{ instructorName }}</p>
                </div>
              </div>
            </div>

            <CourseDetailStats
              class="mt-14"
              :lesson-count="lessons.length"
              :level="course.level"
              :category-name="course.category.name"
              :is-published="course.is_published"
            />
          </div>

          <CoursePurchaseCard
            class="lg:sticky lg:top-20"
            :thumbnail-url="resolveThumbnail(course.thumbnail_url)"
            :title="course.title"
            :price="formatPrice(course.price)"
            :lesson-count="lessons.length"
            :course-id="course.course_id"
            :first-lesson-id="firstLessonId"
            :progress-percent="progressPercent"
            :is-already-enrolled="isAlreadyEnrolled"
            :is-enrolling="isEnrolling"
            :enroll-message="enrollMessage"
            :is-published="course.is_published"
            @enroll="handleEnroll"
          />
        </div>
      </section>

      <CourseLessonsSection
        :course-id="course.course_id"
        :lessons="lessons"
        :current-enrollment-id="currentEnrollmentId"
        :is-lesson-completed="isLessonCompleted"
        @complete-lesson="handleCompleteLesson"
      />

      <CourseExtraSections
        :course="course"
        :instructor-name="instructorName"
      />

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
