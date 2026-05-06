<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getCourses } from '../../api/courseApi'
import CourseCard from '../course/CourseCard.vue'
import type { Course } from '../../types/course'

const courses = ref<Course[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const fetchFeaturedCourses = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const data = await getCourses()
    courses.value = data.slice(0, 6)
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ໂຫຼດຄອສຍອດນິຍົມບໍ່ສຳເລັດ'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchFeaturedCourses()
})
</script>

<template>
  <section class="bg-[#f8fafc] pb-16 pt-10">
    <div class="mx-auto max-w-[1700px] px-8 lg:px-20 2xl:px-28">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-[#142b63]">ຄອສຍອດນິຍົມ</h2>
          <p class="mt-2 text-sm text-slate-500">ຄອສທີ່ຜູ້ຮຽນສົນໃຈແລະເລືອກຮຽນຫຼາຍ</p>
        </div>

        <RouterLink
          to="/courses"
          class="hidden rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-[#142b63] transition hover:border-[#142b63] md:inline-flex"
        >
          ເບິ່ງທັງໝົດ
        </RouterLink>
      </div>

      <p v-if="isLoading" class="mt-8 text-slate-500">Loading...</p>
      <p v-else-if="errorMessage" class="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
        {{ errorMessage }}
      </p>

      <div v-else class="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <p v-if="courses.length === 0" class="text-slate-500">ຍັງບໍ່ມີຄອສໃຫ້ສະແດງ</p>

        <RouterLink
          v-for="course in courses"
          :key="course.course_id"
          :to="`/courses/${course.course_id}`"
          class="block"
        >
          <CourseCard :course="course" />
        </RouterLink>
      </div>
    </div>
  </section>
</template>
