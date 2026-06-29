<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getCourses } from '../../api/courseApi'
import { getMyEnrollments } from '../../api/enrollmentApi'
import CourseCard from '../course/CourseCard.vue'
import type { Course } from '../../types/course'
import type { MyEnrollment } from '../../types/enrollment'

const courses = ref<Course[]>([])
const enrollments = ref<MyEnrollment[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const getCoursePrice = (price: string) => {
  return Number(String(price).replace(/,/g, ''))
}

const getEnrollmentState = (course: Course) => {
  const enrollment = enrollments.value.find((item) => item.course_id === course.course_id)

  if (!enrollment) {
    return 'none'
  }

  return getCoursePrice(course.price) > 0 && !enrollment.is_paid ? 'pending' : 'active'
}

const fetchFeaturedCourses = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const [data, enrollmentData] = await Promise.all([
      getCourses(),
      getMyEnrollments().catch(() => []),
    ])
    courses.value = data.slice(0, 3)
    enrollments.value = enrollmentData
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ໂຫຼດຄອສແນະນຳບໍ່ສຳເລັດ'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchFeaturedCourses()
})
</script>

<template>
  <section class="bg-muted/10 border-t border-b border-border/80 pb-20 pt-20">
    <div class="mx-auto max-w-[1680px] px-6 sm:px-8 lg:px-16 2xl:px-20">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-[2rem] font-black leading-tight text-foreground">ຄອສຍອດນິຍົມ</h2>
          <p class="mt-3 text-base font-medium text-muted-foreground">
            ຄອສທີ່ຜູ້ຮຽນນິຍົມທີ່ສຸດ
          </p>
        </div>

        <RouterLink
          to="/courses"
          class="interactive-motion hidden h-[46px] items-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-bold text-foreground shadow-sm transition hover:bg-muted md:inline-flex cursor-pointer"
        >
          ເບິ່ງທັງໝົດ <span class="text-sm">→</span>
        </RouterLink>
      </div>

      <div v-if="isLoading" class="mt-11 grid gap-8 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        <article v-for="index in 3" :key="index" class="loading-panel h-[340px] rounded-2xl">
          <div class="h-44 bg-slate-100 dark:bg-slate-800"></div>
          <div class="space-y-4 p-5">
            <div class="loading-line h-4 w-2/3"></div>
            <div class="loading-line h-3 w-1/2"></div>
            <div class="flex gap-2">
              <div class="loading-line h-3 w-16"></div>
              <div class="loading-line h-3 w-20"></div>
              <div class="loading-line h-3 w-14"></div>
            </div>
            <div class="loading-line h-5 w-24"></div>
          </div>
        </article>
      </div>
      <p v-else-if="errorMessage" class="mt-8 rounded-xl bg-red-50/10 border border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
        {{ errorMessage }}
      </p>

      <div v-else class="mt-11 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <p v-if="courses.length === 0" class="text-muted-foreground">ຍັງບໍ່ມີຄອສໃຫ້ສະແດງ</p>

        <RouterLink
          v-for="(course, index) in courses"
          :key="course.course_id"
          :to="`/courses/${course.course_id}`"
          class="course-card-link animate-card-in block rounded-2xl"
          :style="{ animationDelay: `${Math.min(index, 2) * 80}ms` }"
        >
          <CourseCard :course="course" :enrollment-state="getEnrollmentState(course)" />
        </RouterLink>
      </div>
    </div>
  </section>
</template>
