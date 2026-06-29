<script setup lang="ts">
import CourseCard from '../course/CourseCard.vue'
import type { Course } from '../../types/course'

defineProps<{
  courses: Course[]
  isLoading: boolean
  errorMessage: string
  enrollmentStates?: Record<string, 'none' | 'active' | 'pending'>
}>()
</script>

<template>
  <section>
    <div v-if="isLoading" class="grid gap-8 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
      <article v-for="index in 6" :key="index" class="loading-panel h-[340px] rounded-2xl">
        <div class="h-44 bg-slate-100"></div>
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

    <p v-else-if="errorMessage" class="rounded-[14px] bg-red-50 px-5 py-4 text-sm text-red-600">
      {{ errorMessage }}
    </p>

    <div v-else class="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      <p v-if="courses.length === 0" class="rounded-[14px] bg-white px-5 py-6 text-slate-500 shadow-sm">
        ບໍ່ພົບຄອສທີ່ກົງກັບການຄົ້ນຫາ
      </p>

      <RouterLink
        v-for="(course, index) in courses"
        :key="course.course_id"
        :to="`/courses/${course.course_id}`"
        class="course-card-link animate-card-in block rounded-2xl"
        :style="{ animationDelay: `${Math.min(index, 8) * 55}ms` }"
      >
        <CourseCard
          :course="course"
          variant="courses"
          :enrollment-state="enrollmentStates?.[course.course_id] || 'none'"
        />
      </RouterLink>
    </div>
  </section>
</template>
