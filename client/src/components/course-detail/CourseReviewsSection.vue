<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { deleteCourseReview, getCourseReviews, submitCourseReview } from '../../api/reviewApi'
import { useAuthStore } from '../../stores/authStore'
import type { CourseReview, ReviewStats } from '../../types/review'

const props = defineProps<{
  courseId: string
  canReview: boolean
}>()

const emit = defineEmits<{
  updated: []
}>()

const authStore = useAuthStore()
const reviews = ref<CourseReview[]>([])
const stats = ref<ReviewStats>({ average_rating: 0, review_count: 0 })
const rating = ref(5)
const comment = ref('')
const isLoading = ref(false)
const isSubmitting = ref(false)
const deletingReviewId = ref('')
const message = ref('')

const myReview = computed(() => {
  return reviews.value.find((review) => review.student_id === authStore.user?.id) || null
})

const displayRating = computed(() => {
  return stats.value.review_count > 0 ? stats.value.average_rating.toFixed(1) : '0.0'
})

const canDeleteReviews = computed(() => {
  return authStore.user?.role === 'admin'
})

const getReviewerName = (review: CourseReview) => {
  const profile = review.student.profile
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')

  return fullName || review.student.email
}

const fetchReviews = async () => {
  try {
    isLoading.value = true
    const data = await getCourseReviews(props.courseId)
    reviews.value = data.reviews
    stats.value = data.stats

    if (myReview.value) {
      rating.value = myReview.value.rating
      comment.value = myReview.value.comment || ''
    }
  } catch (error) {
    console.log(error)
    message.value = 'ໂຫຼດຣີວິວບໍ່ສຳເລັດ'
  } finally {
    isLoading.value = false
  }
}

const handleSubmitReview = async () => {
  try {
    isSubmitting.value = true
    message.value = ''

    await submitCourseReview(props.courseId, {
      rating: rating.value,
      comment: comment.value.trim(),
    })

    await fetchReviews()
    emit('updated')
    message.value = myReview.value ? 'ບັນທຶກຣີວິວແລ້ວ' : 'ສົ່ງຣີວິວແລ້ວ'
  } catch (error: unknown) {
    if (axios.isAxiosError<{ message: string }>(error)) {
      message.value = error.response?.data?.message || 'ບັນທຶກຣີວິວບໍ່ສຳເລັດ'
      return
    }

    message.value = 'ບັນທຶກຣີວິວບໍ່ສຳເລັດ'
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteReview = async (review: CourseReview) => {
  const confirmed = window.confirm('Delete this review?')

  if (!confirmed) return

  try {
    deletingReviewId.value = review.review_id
    message.value = ''

    await deleteCourseReview(props.courseId, review.review_id)
    await fetchReviews()
    emit('updated')
    message.value = 'Review deleted.'
  } catch (error: unknown) {
    if (axios.isAxiosError<{ message: string }>(error)) {
      message.value = error.response?.data?.message || 'Delete review failed.'
      return
    }

    message.value = 'Delete review failed.'
  } finally {
    deletingReviewId.value = ''
  }
}

onMounted(() => {
  fetchReviews()
})
</script>

<template>
  <section class="bg-white px-8 pb-16 lg:px-20 2xl:px-28">
    <div class="mx-auto max-w-[1700px]">
      <div class="grid gap-6 xl:grid-cols-[380px_1fr]">
        <aside class="rounded-2xl border border-slate-200 bg-[#f8fafc] p-6">
          <p class="text-sm font-black uppercase tracking-wide text-[#f5a400]">Course reviews</p>
          <div class="mt-4 flex items-end gap-3">
            <p class="font-number text-5xl font-black text-[#142b63]">{{ displayRating }}</p>
            <div class="pb-2">
              <p class="text-lg font-black text-[#f5a400]">★★★★★</p>
              <p class="text-sm font-bold text-slate-500">{{ stats.review_count }} ຣີວິວ</p>
            </div>
          </div>

          <form v-if="canReview" class="mt-6 space-y-4" @submit.prevent="handleSubmitReview">
            <div>
              <p class="mb-2 text-sm font-black text-slate-700">
                {{ myReview ? 'ແກ້ໄຂຣີວິວຂອງເຈົ້າ' : 'ຂຽນຣີວິວ' }}
              </p>
              <div class="flex gap-1">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  class="text-2xl transition"
                  :class="star <= rating ? 'text-[#f5a400]' : 'text-slate-300'"
                  @click="rating = star"
                >
                  ★
                </button>
              </div>
            </div>

            <textarea
              v-model="comment"
              rows="4"
              class="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-[#142b63]"
              placeholder="ຂຽນຄວາມຄິດເຫັນຂອງເຈົ້າ..."
            ></textarea>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full rounded-xl bg-[#142b63] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0e214d] disabled:bg-slate-400"
            >
              {{ isSubmitting ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກຣີວິວ' }}
            </button>
          </form>

          <p v-else class="mt-6 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-500">
            ລົງທະບຽນຄອສນີ້ກ່ອນ ແລ້ວຈຶ່ງສາມາດຣີວິວໄດ້
          </p>

          <p v-if="message" class="mt-4 text-sm font-bold text-[#142b63]">{{ message }}</p>
        </aside>

        <div class="space-y-4">
          <p v-if="isLoading" class="rounded-2xl bg-slate-50 px-5 py-8 text-center text-slate-500">
            Loading reviews...
          </p>

          <p
            v-else-if="reviews.length === 0"
            class="rounded-2xl bg-slate-50 px-5 py-8 text-center text-slate-500"
          >
            ຍັງບໍ່ມີຣີວິວສຳລັບຄອສນີ້
          </p>

          <article
            v-for="review in reviews"
            v-else
            :key="review.review_id"
            class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="flex items-center gap-3">
                <div class="grid h-11 w-11 place-items-center rounded-full bg-[#142b63] font-black text-white">
                  {{ getReviewerName(review).slice(0, 1).toUpperCase() }}
                </div>
                <div>
                  <h3 class="font-black text-[#0f1f4d]">{{ getReviewerName(review) }}</h3>
                  <p class="text-xs font-bold text-slate-400">
                    {{ new Date(review.created_at).toLocaleDateString() }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <p class="text-sm font-black text-[#f5a400]">
                  {{ '★'.repeat(review.rating) }}<span class="text-slate-300">{{ '★'.repeat(5 - review.rating) }}</span>
                </p>

                <button
                  v-if="canDeleteReviews"
                  type="button"
                  :disabled="deletingReviewId === review.review_id"
                  class="rounded-full border border-red-200 px-3 py-1 text-xs font-black text-red-500 transition hover:bg-red-50 disabled:text-slate-400"
                  @click="handleDeleteReview(review)"
                >
                  {{ deletingReviewId === review.review_id ? 'Deleting...' : 'Delete' }}
                </button>
              </div>
            </div>

            <p class="mt-4 text-sm leading-7 text-slate-600">
              {{ review.comment || 'ບໍ່ມີຄວາມຄິດເຫັນ' }}
            </p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
