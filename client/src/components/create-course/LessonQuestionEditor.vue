<script setup lang="ts">
import type { DraftLesson } from '../../types/createCourse'

defineProps<{
  lesson: DraftLesson
}>()

defineEmits<{
  addQuestion: []
  removeQuestion: [id: number]
}>()
</script>

<template>
  <div class="border-t border-slate-200 p-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-lg font-black text-slate-950">ຄຳຖາມຂອງບົດຮຽນນີ້</h2>
        <p class="mt-1 text-sm text-slate-500">
          ຄຳຖາມຈະຖືກເກັບໄວ້ກັບບົດຮຽນທີ່ກຳລັງເລືອກຢູ່
        </p>
      </div>

      <button
        type="button"
        class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#142b63] transition hover:border-[#142b63]"
        @click="$emit('addQuestion')"
      >
        + ເພີ່ມຄຳຖາມ
      </button>
    </div>

    <div class="mt-5 space-y-4">
      <article
        v-for="(question, questionIndex) in lesson.questions"
        :key="question.id"
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <div class="flex items-center justify-between gap-4">
          <span class="rounded-full bg-[#f5a400] px-3 py-1 text-xs font-bold text-slate-950">
            ຄຳຖາມ {{ questionIndex + 1 }}
          </span>
          <button
            type="button"
            class="text-sm font-bold text-red-500 disabled:cursor-not-allowed disabled:text-red-300"
            :disabled="lesson.questions.length === 1"
            @click="$emit('removeQuestion', question.id)"
          >
            ລົບ
          </button>
        </div>

        <textarea
          v-model="question.question"
          rows="3"
          class="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#142b63]"
          placeholder="ພິມຄຳຖາມຂອງບົດຮຽນນີ້..."
        ></textarea>

        <div class="mt-4 space-y-3">
          <p class="text-xs font-bold text-slate-500">ຕົວເລືອກ (ເລືອກຄຳຕອບທີ່ຖືກ)</p>

          <label
            v-for="(_, optionIndex) in question.options"
            :key="optionIndex"
            class="flex items-center gap-3"
          >
            <input v-model="question.correctIndex" type="radio" :value="optionIndex" />
            <input
              v-model="question.options[optionIndex]"
              type="text"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#142b63]"
              :placeholder="`ຕົວເລືອກ ${String.fromCharCode(65 + optionIndex)}`"
            />
          </label>
        </div>
      </article>
    </div>
  </div>
</template>
