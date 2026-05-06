<script setup lang="ts">
import CourseCard from '../course/CourseCard.vue'
import type { Course } from '../../types/course'

defineProps<{
  courses: Course[]
  isLoading: boolean
  errorMessage: string
}>()
</script>

<template>
  <section>
    <p v-if="isLoading" class="rounded-2xl bg-white px-5 py-6 text-slate-500 shadow-sm">
      Loading...
    </p>

    <p v-else-if="errorMessage" class="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
      {{ errorMessage }}
    </p>

    <div v-else class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <p v-if="courses.length === 0" class="rounded-2xl bg-white px-5 py-6 text-slate-500 shadow-sm">
        ບໍ່ພົບຄອສທີ່ກົງກັບການຄົ້ນຫາ
      </p>

      <RouterLink
        v-for="course in courses"
        :key="course.course_id"
        :to="`/courses/${course.course_id}`"
        class="block"
      >
        <CourseCard :course="course" />
      </RouterLink>
    </div>
  </section>
</template>
