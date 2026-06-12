<script setup lang="ts">
import LessonQuestionEditor from './LessonQuestionEditor.vue'
import { resolveAssetUrl } from '../../api/config'
import type { DraftLesson } from '../../types/createCourse'

const props = defineProps<{
  lesson: DraftLesson
  lessonsCount: number
}>()

const emit = defineEmits<{
  updateLesson: [patch: Partial<DraftLesson>]
  removeLesson: [id: number]
  videoChange: [event: Event]
  imageChange: [event: Event]
  documentChange: [event: Event]
  removeFile: [fileId: string]
  addQuestion: []
  removeQuestion: [id: number]
}>()

const updateLesson = (patch: Partial<DraftLesson>) => {
  emit('updateLesson', patch)
}

const getLessonTypeLabel = (type: string) => {
  if (type === 'exercise') return 'ແບບຝຶກຫັດ'
  if (type === 'image') return 'ຮູບພາບ'
  if (type === 'document') return 'ເອກະສານ'
  if (type === 'text') return 'ບົດຄວາມ'
  return 'ວິດີໂອ'
}
const getCurrentFile = (lesson: DraftLesson, type: 'video' | 'image' | 'document') => {
  return lesson.existingFiles.find((file) => file.file_type === type)
}

const getPublicFileUrl = (fileUrl: string) => {
  return resolveAssetUrl(fileUrl)
}

const formatFileSize = (size: number | null) => {
  if (!size) return ''
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
      <div>
        <h2 class="font-black text-slate-950">ແກ້ໄຂບົດຮຽນ</h2>
        <p class="mt-1 text-xs text-slate-500">ເລືອກປະເພດເນື້ອຫາແລ້ວຟອມຈະສະແດງສ່ວນທີ່ກ່ຽວຂ້ອງ</p>
      </div>

      <button
        type="button"
        class="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
        :disabled="lessonsCount === 1"
        @click="$emit('removeLesson', lesson.id)"
      >
        ລົບບົດຮຽນ
      </button>
    </div>

    <div class="grid gap-5 p-6 md:grid-cols-2">
      <label class="md:col-span-2">
        <span class="text-sm font-black text-slate-950">ຊື່ບົດຮຽນ</span>
        <input
          :value="props.lesson.title"
          type="text"
          class="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#142b63]"
          placeholder="ຕົວຢ່າງ: ແນະນຳ Vue"
          @input="updateLesson({ title: ($event.target as HTMLInputElement).value })"
        />
      </label>

      <label>
        <span class="text-sm font-black text-slate-950">ປະເພດເນື້ອຫາ</span>
        <select
          :value="props.lesson.type"
          class="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#142b63]"
          @change="updateLesson({ type: ($event.target as HTMLSelectElement).value })"
        >
          <option value="video">ວິດີໂອ</option>
          <option value="image">ຮູບພາບ</option>
          <option value="exercise">ແບບຝຶກຫັດ</option>
          <option value="document">ເອກະສານ</option>
          <option value="text">ບົດຄວາມ</option>
        </select>
      </label>

      <label>
        <span class="text-sm font-black text-slate-950">ໄລຍະເວລາ</span>
        <input
          :value="props.lesson.duration"
          type="text"
          class="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#142b63]"
          placeholder="ເຊັ່ນ: 15:30"
          @input="updateLesson({ duration: ($event.target as HTMLInputElement).value })"
        />
      </label>

      <label class="md:col-span-2">
        <span class="text-sm font-black text-slate-950">ລາຍລະອຽດ</span>
        <textarea
          :value="props.lesson.description"
          rows="4"
          class="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#142b63]"
          placeholder="ອະທິບາຍວ່າບົດຮຽນນີ້ຈະສອນຫຍັງ..."
          @input="updateLesson({ description: ($event.target as HTMLTextAreaElement).value })"
        ></textarea>
      </label>

      <label class="flex items-center gap-3 text-sm font-bold text-slate-600 md:col-span-2">
        <input
          :checked="props.lesson.isFreePreview"
          type="checkbox"
          class="h-4 w-4"
          @change="updateLesson({ isFreePreview: ($event.target as HTMLInputElement).checked })"
        />
        ເປີດໃຫ້ເບິ່ງຟຣີ
      </label>
    </div>

    <div v-if="lesson.type === 'video'" class="border-t border-slate-200 p-6">
      <label
        :key="lesson.id"
        class="flex min-h-48 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500 transition hover:border-[#142b63]"
      >
        <video
          v-if="lesson.videoPreviewUrl || getCurrentFile(lesson, 'video')"
          :src="
            lesson.videoPreviewUrl || getPublicFileUrl(getCurrentFile(lesson, 'video')!.file_url)
          "
          controls
          class="h-full max-h-72 w-full bg-black object-contain"
        ></video>

        <div v-else>
          <div
            class="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-slate-200 text-[#142b63]"
          >
            ▶
          </div>
          <p class="mt-3 font-bold text-slate-700">ອັບໂຫຼດວິດີໂອບົດຮຽນ</p>
          <p class="mt-1 text-xs">MP4, WebM, MOV • ບໍ່ເກີນ 2 ນາທີ</p>
        </div>

        <input type="file" accept="video/*" class="hidden" @change="$emit('videoChange', $event)" />
      </label>

      <p v-if="lesson.videoName" class="mt-3 text-sm font-bold text-slate-600">
        {{ lesson.videoName }} • {{ lesson.duration }}
      </p>

      <div
        v-if="getCurrentFile(lesson, 'video')"
        class="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
      >
        <div class="min-w-0">
          <p class="truncate font-bold text-slate-700">
            {{ getCurrentFile(lesson, 'video')?.original_name }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            ວິດີໂອເກົ່າ {{ formatFileSize(getCurrentFile(lesson, 'video')?.size_bytes || null) }}
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50"
          @click="$emit('removeFile', getCurrentFile(lesson, 'video')!.file_id)"
        >
          ລົບໄຟລ໌
        </button>
      </div>
    </div>

    <div v-else-if="lesson.type === 'image'" class="border-t border-slate-200 p-6">
      <label
        :key="lesson.id"
        class="flex min-h-48 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500 transition hover:border-[#142b63]"
      >
        <img
          v-if="lesson.imagePreviewUrl || getCurrentFile(lesson, 'image')"
          :src="
            lesson.imagePreviewUrl || getPublicFileUrl(getCurrentFile(lesson, 'image')!.file_url)
          "
          :alt="lesson.title"
          class="h-full max-h-72 w-full object-contain"
        />

        <div v-else>
          <div
            class="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-slate-200 text-[#142b63]"
          >
            ▧
          </div>
          <p class="mt-3 font-bold text-slate-700">ອັບໂຫຼດຮູບບົດຮຽນ</p>
          <p class="mt-1 text-xs">PNG, JPG, WebP</p>
        </div>

        <input type="file" accept="image/*" class="hidden" @change="$emit('imageChange', $event)" />
      </label>

      <p v-if="lesson.imageName" class="mt-3 text-sm font-bold text-slate-600">
        {{ lesson.imageName }}
      </p>

      <div
        v-if="getCurrentFile(lesson, 'image')"
        class="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
      >
        <div class="min-w-0">
          <p class="truncate font-bold text-slate-700">
            {{ getCurrentFile(lesson, 'image')?.original_name }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            ຮູບເກົ່າ {{ formatFileSize(getCurrentFile(lesson, 'image')?.size_bytes || null) }}
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50"
          @click="$emit('removeFile', getCurrentFile(lesson, 'image')!.file_id)"
        >
          ລົບໄຟລ໌
        </button>
      </div>
    </div>

    <div v-else-if="lesson.type === 'document'" class="border-t border-slate-200 p-6">
      <label
        :key="lesson.id"
        class="flex min-h-48 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500 transition hover:border-[#142b63]"
      >
        <div>
          <div
            class="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-slate-200 text-[#142b63]"
          >
            📄
          </div>
          <p class="mt-3 font-bold text-slate-700">
            {{ lesson.documentName || 'ອັບໂຫຼດເອກະສານບົດຮຽນ' }}
          </p>
          <p class="mt-1 text-xs">PDF, Word, PowerPoint, Excel, TXT, ZIP • ບໍ່ເກີນ 20MB</p>
        </div>

        <input
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
          class="hidden"
          @change="$emit('documentChange', $event)"
        />
      </label>

      <p v-if="lesson.documentName" class="mt-3 text-sm font-bold text-slate-600">
        {{ lesson.documentName }}
      </p>

      <div
        v-if="getCurrentFile(lesson, 'document')"
        class="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
      >
        <div class="min-w-0">
          <p class="truncate font-bold text-slate-700">
            {{ getCurrentFile(lesson, 'document')?.original_name }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            ເອກະສານເກົ່າ
            {{ formatFileSize(getCurrentFile(lesson, 'document')?.size_bytes || null) }}
          </p>
        </div>
        <div class="flex shrink-0 gap-2">
          <a
            :href="getPublicFileUrl(getCurrentFile(lesson, 'document')!.file_url)"
            target="_blank"
            class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-[#142b63] transition hover:bg-white"
          >
            ເປີດເບິ່ງ
          </a>
          <button
            type="button"
            class="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50"
            @click="$emit('removeFile', getCurrentFile(lesson, 'document')!.file_id)"
          >
            ລົບໄຟລ໌
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="lesson.type !== 'exercise'" class="border-t border-slate-200 p-6">
      <div
        class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500"
      >
        <p class="font-black text-slate-700">
          {{ getLessonTypeLabel(lesson.type) }}
        </p>
        <p class="mt-2 leading-6">ບົດຮຽນປະເພດນີ້ໃຊ້ຂໍ້ມູນຈາກຊື່ ແລະ ລາຍລະອຽດດ້ານເທິງ.</p>
      </div>
    </div>

    <LessonQuestionEditor
      v-if="lesson.type === 'exercise'"
      :lesson="lesson"
      @add-question="$emit('addQuestion')"
      @remove-question="$emit('removeQuestion', $event)"
    />
  </section>
</template>
