<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getCourses } from '../api/courseApi'
import CoursesFilterSidebar from '../components/courses/CoursesFilterSidebar.vue'
import CoursesGrid from '../components/courses/CoursesGrid.vue'
import CoursesHero from '../components/courses/CoursesHero.vue'
import CoursesStats from '../components/courses/CoursesStats.vue'
import HomeFooter from '../components/home/HomeFooter.vue'
import type { Course } from '../types/course'

const courses = ref<Course[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchText = ref('')
const selectedCategory = ref('all')
const selectedLevel = ref('all')
const selectedPrice = ref('all')

const categoryKeywords: Record<string, string[]> = {
  web: ['web', 'ເວັບ', 'react', 'vue', 'frontend', 'backend'],
  design: ['design', 'figma', 'ui', 'ux', 'ອອກແບບ'],
  business: ['business', 'ທຸລະກິດ'],
  marketing: ['marketing', 'ads', 'facebook', 'tiktok', 'ຕະຫຼາດ'],
  language: ['language', 'ພາສາ'],
  technology: ['technology', 'tech', 'ເທັກໂນໂລຊີ'],
  finance: ['finance', 'ການເງິນ'],
  health: ['health', 'ສຸຂະພາບ'],
}

const fetchCourses = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    courses.value = await getCourses()
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ໂຫຼດລາຍການຄອສບໍ່ສຳເລັດ'
  } finally {
    isLoading.value = false
  }
}

const getCoursePrice = (price: string) => {
  return Number(String(price).replace(/,/g, ''))
}

const filteredCourses = computed(() => {
  return courses.value.filter((course) => {
    if (!course.is_published) {
      return false
    }

    const text = [
      course.title,
      course.description,
      course.level,
      course.category?.name,
      course.instructor?.email,
      course.instructor?.profile?.first_name,
      course.instructor?.profile?.last_name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const coursePrice = getCoursePrice(course.price)
    const matchesSearch = !searchText.value || text.includes(searchText.value.toLowerCase())
    const matchesLevel = selectedLevel.value === 'all' || course.level === selectedLevel.value
    const matchesPrice =
      selectedPrice.value === 'all' ||
      (selectedPrice.value === 'free' && coursePrice === 0) ||
      (selectedPrice.value === 'paid' && coursePrice > 0)

    const keywords = categoryKeywords[selectedCategory.value] || []
    const matchesCategory =
      selectedCategory.value === 'all' || keywords.some((keyword) => text.includes(keyword))

    return matchesSearch && matchesLevel && matchesCategory && matchesPrice
  })
})

onMounted(() => {
  fetchCourses()
})
</script>

<template>
  <main class="min-h-screen bg-[#f8fafc]">
    <CoursesHero v-model="searchText" />
    <CoursesStats />

    <section class="mx-auto max-w-[1700px] px-8 py-8 lg:px-20 2xl:px-28">
      <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
        <CoursesFilterSidebar
          v-model:selected-category="selectedCategory"
          v-model:selected-level="selectedLevel"
          v-model:selected-price="selectedPrice"
          class="shrink-0 lg:sticky lg:top-24"
        />

        <div class="min-w-0 flex-1">
          <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm font-bold text-slate-500">
                ສະແດງ <span class="text-[#142b63]">{{ filteredCourses.length }}</span> ຄອສ
              </p>
            </div>

            <label class="flex items-center gap-3 text-sm font-bold text-slate-500">
              ຈັດຮຽງ
              <select
                class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#142b63] outline-none"
              >
                <option>ຍອດນິຍົມ</option>
                <option>ໃໝ່ລ່າສຸດ</option>
                <option>ລາຄາຕ່ຳສຸດ</option>
              </select>
            </label>
          </div>

          <CoursesGrid
            :courses="filteredCourses"
            :is-loading="isLoading"
            :error-message="errorMessage"
          />
        </div>
      </div>
    </section>

    <HomeFooter />
  </main>
</template>
