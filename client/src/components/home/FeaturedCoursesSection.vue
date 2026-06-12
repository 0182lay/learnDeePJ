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
    courses.value = data.slice(0, 6)
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
  <section class="bg-[#f7f7f6] pb-20 pt-20">
    <div class="mx-auto max-w-[1680px] px-6 sm:px-8 lg:px-16 2xl:px-20">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-[2rem] font-black leading-tight text-[#0f1f4d]">ຄອສແນະນຳ</h2>
          <p class="mt-3 text-base font-medium text-slate-500">
            ຄອສທີ່ກຳລັງນ່າສົນໃຈ ຄັດມາໃຫ້ເລີ່ມຮຽນໄດ້ທັນທີ
          </p>
        </div>

        <RouterLink
          to="/courses"
          class="interactive-motion hidden h-[50px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-[#294a78] shadow-sm transition hover:border-[#294a78]/35 hover:shadow-md md:inline-flex"
        >
          ເບິ່ງທັງໝົດ <span class="text-lg">→</span>
        </RouterLink>
      </div>

      <p v-if="isLoading" class="mt-8 text-slate-500">ກຳລັງໂຫຼດ...</p>
      <p v-else-if="errorMessage" class="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
        {{ errorMessage }}
      </p>

      <div v-else class="mt-11 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        <p v-if="courses.length === 0" class="text-slate-500">ຍັງບໍ່ມີຄອສໃຫ້ສະແດງ</p>

        <RouterLink
          v-for="(course, index) in courses"
          :key="course.course_id"
          :to="`/courses/${course.course_id}`"
          class="animate-card-in block"
          :style="{ animationDelay: `${Math.min(index, 5) * 70}ms` }"
        >
          <CourseCard :course="course" :enrollment-state="getEnrollmentState(course)" />
        </RouterLink>
      </div>
    </div>
  </section>
</template>
