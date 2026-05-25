<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Lesson } from '../../types/lesson'

defineProps<{
  courseId: string
  lessons: Lesson[]
  currentEnrollmentId: string
  isLessonCompleted: (lessonId: string) => boolean
}>()

defineEmits<{
  completeLesson: [lessonId: string]
}>()

const firstVideo = (lesson: Lesson) => {
  return lesson.files?.find((file) => file.file_type === 'video')
}

const getLessonTypeLabel = (lesson: Lesson) => {
  if (lesson.lesson_type === 'exercise') return 'ແບບຝຶກຫັດ'
  if (lesson.lesson_type === 'document') return 'ເອກະສານ'
  if (lesson.lesson_type === 'text') return 'ບົດຄວາມ'
  return 'ວິດີໂອ'
}

const formatDuration = (seconds: number | null | undefined) => {
  if (!seconds) {
    return ''
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}
</script>

<template>
  <section class="bg-white px-8 py-10 lg:px-20 2xl:px-28">
    <div class="mx-auto max-w-[1700px]">
      <p v-if="lessons.length === 0" class="rounded-2xl bg-slate-50 px-5 py-6 text-slate-500">
        ຍັງບໍ່ມີບົດຮຽນໃນຄອສນີ້
      </p>

      <div v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <article
          v-for="lesson in lessons"
          :key="lesson.lesson_id"
          class="flex items-center gap-4 border-b border-slate-200 px-5 py-4 last:border-b-0"
        >
          <div class="w-8 text-center">
            <span
              v-if="isLessonCompleted(lesson.lesson_id)"
              class="inline-grid h-7 w-7 place-items-center rounded-full bg-[#f5a400]/15 text-sm font-black text-[#f5a400]"
            >
              ✓
            </span>
            <span
              v-else
              class="inline-grid h-7 w-7 place-items-center rounded-full border border-slate-300 bg-white text-sm font-black text-slate-300"
            >
            </span>
          </div>

          <RouterLink
            :to="`/courses/${courseId}/learn/${lesson.lesson_id}`"
            class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f5a400]/15 text-[#f5a400] transition hover:bg-[#f5a400] hover:text-slate-950"
          >
            ▶
          </RouterLink>

          <div class="min-w-0 flex-1">
            <h3 class="truncate font-black text-slate-950">{{ lesson.title }}</h3>
            <p class="mt-1 text-xs font-medium text-slate-500">
              {{ getLessonTypeLabel(lesson) }}
              <span v-if="firstVideo(lesson)?.duration_seconds">
                · {{ formatDuration(firstVideo(lesson)?.duration_seconds) }}
              </span>
              <span v-if="lesson.lesson_type === 'video' && !firstVideo(lesson)">
                · ຍັງບໍ່ມີວິດີໂອ
              </span>
            </p>
          </div>

          <button
            type="button"
            :disabled="!currentEnrollmentId || isLessonCompleted(lesson.lesson_id)"
            class="hidden rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-[#142b63] transition hover:border-[#142b63] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:block"
            @click="$emit('completeLesson', lesson.lesson_id)"
          >
            {{ isLessonCompleted(lesson.lesson_id) ? 'ຮຽນຈົບແລ້ວ' : 'Mark complete' }}
          </button>
        </article>
      </div>
    </div>
  </section>
</template>
