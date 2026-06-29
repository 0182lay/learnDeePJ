<script setup lang="ts">
import { ArrowUpDown, BookOpen, TrendingUp, Users } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getCategories } from '../api/categoryApi'
import { getCourses } from '../api/courseApi'
import { getMyEnrollments } from '../api/enrollmentApi'
import CoursesFilterSidebar from '../components/courses/CoursesFilterSidebar.vue'
import CoursesGrid from '../components/courses/CoursesGrid.vue'
import CoursesHero from '../components/courses/CoursesHero.vue'
import HomeFooter from '../components/home/HomeFooter.vue'
import type { Category } from '../types/category'
import type { Course } from '../types/course'
import type { MyEnrollment } from '../types/enrollment'

const route = useRoute()
const courses = ref<Course[]>([])
const categories = ref<Category[]>([])
const enrollments = ref<MyEnrollment[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchText = ref('')
const selectedCategory = ref(typeof route.query.category === 'string' ? route.query.category : 'all')
const selectedLevel = ref('all')
const selectedPrice = ref('all')
const selectedSort = ref<'popular' | 'latest' | 'price-low'>('popular')

const fetchCategories = async () => {
  try {
    categories.value = await getCategories()
  } catch (error) {
    console.log(error)
    categories.value = []
  }
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

const fetchEnrollments = async () => {
  try {
    enrollments.value = await getMyEnrollments()
  } catch (error) {
    console.log(error)
    enrollments.value = []
  }
}

const getCoursePrice = (price: string) => {
  return Number(String(price).replace(/,/g, ''))
}

const publishedCoursesCount = computed(() => {
  return courses.value.filter((course) => course.is_published).length
})

const totalEnrollmentCount = computed(() => {
  return courses.value.reduce((total, course) => {
    return course.is_published ? total + (course.enrollment_count || 0) : total
  }, 0)
})

const totalLessonCount = computed(() => {
  return courses.value.reduce((total, course) => {
    return course.is_published ? total + (course.lesson_count || 0) : total
  }, 0)
})

const filteredCourses = computed(() => {
  const filtered = courses.value.filter((course) => {
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
    const matchesCategory =
      selectedCategory.value === 'all' || course.category?.category_id === selectedCategory.value

    return matchesSearch && matchesLevel && matchesCategory && matchesPrice
  })

  return [...filtered].sort((firstCourse, secondCourse) => {
    if (selectedSort.value === 'latest') {
      return (
        new Date(secondCourse.created_at || 0).getTime() -
        new Date(firstCourse.created_at || 0).getTime()
      )
    }

    if (selectedSort.value === 'price-low') {
      return getCoursePrice(firstCourse.price) - getCoursePrice(secondCourse.price)
    }

    return (secondCourse.enrollment_count || 0) - (firstCourse.enrollment_count || 0)
  })
})

const enrollmentStates = computed<Record<string, 'none' | 'active' | 'pending'>>(() => {
  return courses.value.reduce<Record<string, 'none' | 'active' | 'pending'>>((states, course) => {
    const enrollment = enrollments.value.find((item) => item.course_id === course.course_id)

    if (!enrollment) {
      states[course.course_id] = 'none'
      return states
    }

    states[course.course_id] = getCoursePrice(course.price) > 0 && !enrollment.is_paid ? 'pending' : 'active'
    return states
  }, {})
})

onMounted(() => {
  fetchCategories()
  fetchCourses()
  fetchEnrollments()
})
</script>

<template>
  <main class="soft-page min-h-screen">
    <CoursesHero v-model="searchText" :course-count="publishedCoursesCount" />

    <section class="border-b border-border bg-card">
      <div class="mx-auto flex max-w-[1680px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-5 text-sm sm:px-8 lg:px-16 2xl:px-20">
        <p class="inline-flex items-center gap-2 font-bold text-muted-foreground">
          <TrendingUp class="h-4 w-4 text-[#f5a400]" />
          <span class="font-number font-black text-foreground">{{ publishedCoursesCount }}</span>
          ຄອສທີ່ເຜີຍແຜ່
        </p>
        <p class="inline-flex items-center gap-2 font-bold text-muted-foreground">
          <Users class="h-4 w-4 text-emerald-500" />
          <span class="font-number font-black text-foreground">{{ totalEnrollmentCount }}</span>
          ນັກຮຽນ
        </p>
        <p class="inline-flex items-center gap-2 font-bold text-muted-foreground">
          <BookOpen class="h-4 w-4 text-[#f5a400]" />
          <span class="font-number font-black text-foreground">{{ totalLessonCount }}</span>
          ບົດຮຽນ
        </p>
      </div>
    </section>

    <section v-scroll-reveal class="mx-auto max-w-[1680px] px-6 py-8 sm:px-8 lg:px-16 2xl:px-20">
      <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
        <CoursesFilterSidebar
          v-model:selected-category="selectedCategory"
          v-model:selected-level="selectedLevel"
          v-model:selected-price="selectedPrice"
          :categories="categories"
          class="shrink-0 lg:sticky lg:top-24"
        />

        <div class="min-w-0 flex-1">
          <div class="mb-7 flex items-center justify-between">
            <p class="text-sm font-medium text-muted-foreground">
              ສະແດງ {{ filteredCourses.length }} ຄອສ
            </p>

            <label class="interactive-motion flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-muted-foreground shadow-sm">
              <ArrowUpDown class="h-3.5 w-3.5 text-muted-foreground" />
              <select
                v-model="selectedSort"
                class="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer"
              >
                <option value="popular">ຍອດນິຍົມ</option>
                <option value="latest">ໃໝ່ລ່າສຸດ</option>
                <option value="price-low">ລາຄາຕ່ຳສຸດ</option>
              </select>
            </label>
          </div>

          <CoursesGrid
            :courses="filteredCourses"
            :is-loading="isLoading"
            :error-message="errorMessage"
            :enrollment-states="enrollmentStates"
          />
        </div>
      </div>
    </section>

    <HomeFooter />
  </main>
</template>
