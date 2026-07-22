<script setup lang="ts">
import { Check, Lock, Play } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import type { Lesson } from '../../types/lesson'

defineProps<{
  courseId: string
  lessons: Lesson[]
  currentEnrollmentId: string
  canAccessLessons: boolean
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
  if (!seconds) return ''

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

const totalDurationText = (lessons: Lesson[]) => {
  const totalSeconds = lessons.reduce((sum, lesson) => {
    return sum + (firstVideo(lesson)?.duration_seconds || 0)
  }, 0)

  if (!totalSeconds) return 'ວິດີໂອສຳລັບຜູ້ລົງທະບຽນ'

  const minutes = Math.round(totalSeconds / 60)
  return `${minutes} ນາທີ`
}

const getLessonAccessText = (lesson: Lesson, canAccessLessons: boolean) => {
  const video = firstVideo(lesson)

  if (video?.duration_seconds) {
    return formatDuration(video.duration_seconds)
  }

  if (!canAccessLessons && !lesson.is_free_preview) {
    return 'ສຳລັບຜູ້ລົງທະບຽນ'
  }

  return ''
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
            <Check class="h-4 w-4" />
          </span>
          <Play
            v-else-if="canAccessLessons || lesson.is_free_preview"
            class="mx-auto h-4 w-4 text-slate-400"
          />
          <Lock v-else class="mx-auto h-4 w-4 text-slate-400" />
        </div>

        <RouterLink
          v-if="canAccessLessons || lesson.is_free_preview"
          :to="`/courses/${courseId}/learn/${lesson.lesson_id}`"
          class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary/15 text-secondary transition hover:bg-secondary hover:text-secondary-foreground"
        >
          <Play class="h-4 w-4 fill-current" />
        </RouterLink>
        <span
          v-else
          class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-400"
        >
          <Lock class="h-4 w-4" />
        </span>

        <div class="min-w-0 flex-1">
          <h3 class="truncate font-black text-card-foreground">{{ lesson.title }}</h3>
          <p class="mt-1 text-xs font-medium text-muted-foreground">
            {{ getLessonTypeLabel(lesson) }}
            <span v-if="getLessonAccessText(lesson, canAccessLessons)">
              · {{ getLessonAccessText(lesson, canAccessLessons) }}
            </span>
          </p>
        </div>

        <button
          v-if="canAccessLessons"
          type="button"
          :disabled="isLessonCompleted(lesson.lesson_id)"
          class="hidden rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-primary transition hover:border-primary disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:block"
          @click="$emit('completeLesson', lesson.lesson_id)"
        >
          {{ isLessonCompleted(lesson.lesson_id) ? 'ຮຽນຈົບແລ້ວ' : 'ກຳນົດວ່າຮຽນຈົບ' }}
        </button>
        <span
          v-else-if="lesson.is_free_preview"
          class="hidden rounded-full border border-secondary/30 bg-secondary/10 px-4 py-2 text-xs font-bold text-secondary sm:block"
        >
          ຮຽນຟຣີ
        </span>
      </article>
    </details>
  </section>
</template>
