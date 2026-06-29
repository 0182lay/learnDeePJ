<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getCourses } from '../../api/courseApi'
import type { Course } from '../../types/course'

const courses = ref<Course[]>([])

const publishedCourses = computed(() => courses.value.filter((course) => course.is_published))
const courseCount = computed(() => publishedCourses.value.length)
const studentCount = computed(() => {
  return publishedCourses.value.reduce((total, course) => total + (course.enrollment_count || 0), 0)
})
const lessonCount = computed(() => {
  return publishedCourses.value.reduce((total, course) => total + (course.lesson_count || 0), 0)
})
const averageRating = computed(() => {
  const ratedCourses = publishedCourses.value.filter((course) => course.review_count)
  if (ratedCourses.length === 0) return '0.0'

  const totalRating = ratedCourses.reduce((total, course) => total + (course.average_rating || 0), 0)
  return (totalRating / ratedCourses.length).toFixed(1)
})

const fetchStats = async () => {
  try {
    courses.value = await getCourses()
  } catch (error) {
    console.log(error)
    courses.value = []
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <section class="border-b border-border bg-card">
    <div
      class="grid grid-cols-2 gap-px overflow-hidden bg-border text-center md:grid-cols-4 w-full"
    >
      <div class="bg-card px-6 py-8">
        <p class="font-number text-4xl font-black text-primary">{{ courseCount }}</p>
        <p class="mt-2 text-sm font-medium text-muted-foreground">ຄອສຮຽນ</p>
      </div>

      <div class="bg-card px-6 py-8">
        <p class="font-number text-4xl font-black text-primary">{{ studentCount }}</p>
        <p class="mt-2 text-sm font-medium text-muted-foreground">ຜູ້ຮຽນ</p>
      </div>

      <div class="bg-card px-6 py-8">
        <p class="font-number text-4xl font-black text-primary">{{ lessonCount }}</p>
        <p class="mt-2 text-sm font-medium text-muted-foreground">ບົດຮຽນ</p>
      </div>

      <div class="bg-card px-6 py-8">
        <p class="font-number text-4xl font-black text-primary">{{ averageRating }}</p>
        <p class="mt-2 text-sm font-medium text-muted-foreground">ຄະແນນສະເລ່ຍ</p>
      </div>
    </div>
  </section>
</template>
