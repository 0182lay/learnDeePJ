<script setup lang="ts">
import LessonEditor from './LessonEditor.vue'
import type { DraftLesson } from '../../types/createCourse'

defineProps<{
  lessons: DraftLesson[]
  selectedLesson: DraftLesson | undefined
  courseId?: string
}>()

const selectedLessonId = defineModel<number>('selectedLessonId', { required: true })

defineEmits<{
  addLesson: []
  removeLesson: [id: number]
  videoChange: [event: Event]
  imageChange: [event: Event]
  documentChange: [event: Event]
  removeFile: [fileId: string]
  updateLesson: [patch: Partial<DraftLesson>]
  addQuestion: []
  removeQuestion: [id: number]
}>()

const getLessonTypeLabel = (type: string) => {
  if (type === 'exercise') return 'ແບບຝຶກຫັດ'
  if (type === 'image') return 'ຮູບພາບ'
  if (type === 'document') return 'ເອກະສານ'
  if (type === 'text') return 'ບົດຄວາມ'
  return 'ວິດີໂອ'
}
const hasLessonFile = (lesson: DraftLesson) => {
  return Boolean(
    lesson.existingFiles.length ||
      lesson.videoFile ||
      lesson.imageFile ||
      lesson.documentFile,
  )
}

const hasLessonQuestions = (lesson: DraftLesson) => {
  return lesson.questions.some((question) => {
    return question.question.trim() && question.options.some((option) => option.trim())
  })
}

const getLessonStatus = (lesson: DraftLesson) => {
  if (!lesson.title.trim()) {
    return { icon: '!', label: 'ຍັງບໍ່ມີຊື່', className: 'bg-red-50 text-red-600' }
  }

  if (lesson.type === 'exercise') {
    const questionCount = lesson.questions.filter((question) => question.question.trim()).length

    return hasLessonQuestions(lesson)
      ? { icon: '✓', label: `${questionCount} ຄຳຖາມ`, className: 'bg-emerald-50 text-emerald-700' }
      : { icon: '!', label: 'ຍັງບໍ່ມີຄຳຖາມ', className: 'bg-[#f5a400]/10 text-[#9a6500]' }
  }

  if (lesson.type === 'text') {
    return lesson.description.trim()
      ? { icon: '✓', label: 'ພ້ອມແລ້ວ', className: 'bg-emerald-50 text-emerald-700' }
      : { icon: '!', label: 'ຍັງບໍ່ມີເນື້ອຫາ', className: 'bg-[#f5a400]/10 text-[#9a6500]' }
  }

  return hasLessonFile(lesson)
    ? { icon: '✓', label: 'ມີໄຟລ໌ແລ້ວ', className: 'bg-emerald-50 text-emerald-700' }
    : { icon: '!', label: 'ຍັງບໍ່ມີໄຟລ໌', className: 'bg-[#f5a400]/10 text-[#9a6500]' }
}
</script>

<template>
  <section class="mt-7">
    <div class="rounded-2xl border border-[#f5a400]/40 bg-[#f5a400]/5 p-4">
      <h2 class="text-sm font-black text-slate-950">ຄູ່ມືຈັດການບົດຮຽນ</h2>
      <div class="mt-3 grid gap-3 text-xs font-medium text-slate-600 md:grid-cols-3">
        <p>• ເພີ່ມບົດຮຽນກ່ອນ</p>
        <p>• ເລືອກບົດຮຽນແລ້ວແກ້ໄຂລາຍລະອຽດ</p>
        <p>• ຄຳຖາມຈະຖືກເກັບກັບບົດຮຽນນັ້ນ</p>
      </div>
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
      <aside class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 class="font-black text-slate-950">ລາຍການບົດຮຽນ</h2>
            <p class="mt-1 text-xs text-slate-500">{{ lessons.length }} ບົດຮຽນ</p>
          </div>

          <button
            type="button"
            class="rounded-xl bg-[#142b63] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#0e214d]"
            @click="$emit('addLesson')"
          >
            + ເພີ່ມ
          </button>
        </div>

        <div class="space-y-3">
          <button
            v-for="lesson in lessons"
            :key="lesson.id"
            type="button"
            class="w-full rounded-2xl border p-4 text-left transition"
            :class="
              selectedLessonId === lesson.id
                ? 'border-[#142b63] bg-[#142b63] text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-[#142b63]/40'
            "
            @click="selectedLessonId = lesson.id"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="mt-1 truncate font-black">
                  {{ lesson.title || 'ຍັງບໍ່ມີຊື່ບົດຮຽນ' }}
                </h3>
                <p class="mt-2 text-xs opacity-70">
                  {{ getLessonTypeLabel(lesson.type) }} •
                  {{ lesson.duration || 'ຍັງບໍ່ມີເວລາ' }}
                </p>
                <p v-if="lesson.videoName" class="mt-1 truncate text-xs font-bold opacity-80">
                  {{ lesson.videoName }}
                </p>

                <div class="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black"
                    :class="getLessonStatus(lesson).className"
                  >
                    <span>{{ getLessonStatus(lesson).icon }}</span>
                    <span>{{ getLessonStatus(lesson).label }}</span>
                  </span>

                  <RouterLink
                    v-if="courseId && lesson.lessonId"
                    :to="`/courses/${courseId}/learn/${lesson.lessonId}`"
                    class="inline-flex rounded-full px-2.5 py-1 text-[11px] font-black transition"
                    :class="
                      selectedLessonId === lesson.id
                        ? 'bg-white/15 text-white hover:bg-white/25'
                        : 'bg-white text-[#142b63] ring-1 ring-slate-200 hover:ring-[#142b63]'
                    "
                    @click.stop
                  >
                    Preview
                  </RouterLink>
                </div>
              </div>
              <span
                v-if="lesson.isFreePreview"
                class="shrink-0 rounded-full bg-[#f5a400] px-2 py-1 text-[10px] font-bold text-slate-950"
              >
                Free
              </span>
            </div>
          </button>
        </div>
      </aside>

      <LessonEditor
        v-if="selectedLesson"
        :lesson="selectedLesson"
        :lessons-count="lessons.length"
        @remove-lesson="$emit('removeLesson', $event)"
        @video-change="$emit('videoChange', $event)"
        @image-change="$emit('imageChange', $event)"
        @document-change="$emit('documentChange', $event)"
        @remove-file="$emit('removeFile', $event)"
        @update-lesson="$emit('updateLesson', $event)"
        @add-question="$emit('addQuestion')"
        @remove-question="$emit('removeQuestion', $event)"
      />
    </div>
  </section>
</template>
