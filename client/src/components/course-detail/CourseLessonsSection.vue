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

const totalDurationText = (lessons: Lesson[]) => {
  const totalSeconds = lessons.reduce((sum, lesson) => {
    return sum + (firstVideo(lesson)?.duration_seconds || 0)
  }, 0)

  if (!totalSeconds) return '20 ຊົ່ວໂມງ'

  const minutes = Math.round(totalSeconds / 60)
  return `${minutes} ນາທີ`
}
</script>

<template>
  <section>
      <p v-if="lessons.length === 0" class="rounded-2xl bg-slate-50 px-5 py-6 text-slate-500">
        ຍັງບໍ່ມີບົດຮຽນໃນຄອສນີ້
      </p>

      <details v-else open class="overflow-hidden rounded-xl border border-slate-200 bg-card shadow-[var(--card-shadow)]">
        <summary class="flex cursor-pointer items-center justify-between gap-4 border-b border-slate-200 bg-muted px-5 py-4">
          <span class="font-heading font-black text-card-foreground">Module 1: ເນື້ອຫາຄອສ</span>
          <span class="text-sm font-bold text-muted-foreground">{{ lessons.length }} ບົດ · {{ totalDurationText(lessons) }}</span>
        </summary>

        <article
          v-for="lesson in lessons"
          :key="lesson.lesson_id"
          class="flex items-center gap-4 border-b border-slate-200 px-5 py-4 last:border-b-0"
        >
          <div class="w-8 text-center">
            <span
              v-if="isLessonCompleted(lesson.lesson_id)"
              class="inline-grid h-7 w-7 place-items-center rounded-full bg-secondary/15 text-sm font-black text-secondary"
            >
              ✓
            </span>
            <span v-else class="text-slate-400">{{ currentEnrollmentId ? '▶' : '🔒' }}</span>
          </div>

          <RouterLink
            :to="`/courses/${courseId}/learn/${lesson.lesson_id}`"
            class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary/15 text-secondary transition hover:bg-secondary hover:text-secondary-foreground"
          >
            ▶
          </RouterLink>

          <div class="min-w-0 flex-1">
            <h3 class="truncate font-black text-card-foreground">{{ lesson.title }}</h3>
            <p class="mt-1 text-xs font-medium text-muted-foreground">
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
            class="hidden rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-primary transition hover:border-primary disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:block"
            @click="$emit('completeLesson', lesson.lesson_id)"
          >
            {{ isLessonCompleted(lesson.lesson_id) ? 'ຮຽນຈົບແລ້ວ' : 'ໝາຍວ່າຮຽນຈົບ' }}
          </button>
        </article>
      </details>
  </section>
</template>
