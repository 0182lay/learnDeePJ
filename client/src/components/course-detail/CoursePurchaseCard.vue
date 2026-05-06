<script setup lang="ts">
defineProps<{
  thumbnailUrl: string
  title: string
  price: string
  lessonCount: number
  courseId: string
  firstLessonId: string
  progressPercent: number
  isAlreadyEnrolled: boolean
  canAccessCourse: boolean
  requiresPayment: boolean
  isPaid: boolean
  hasSubmittedSlip: boolean
  isEnrolling: boolean
  enrollMessage: string
  isPublished: boolean
}>()

defineEmits<{
  enroll: []
}>()
</script>

<template>
  <aside class="glass-card overflow-hidden rounded-[1.4rem]">
    <div class="relative h-56 bg-slate-200">
      <img
        v-if="thumbnailUrl"
        :src="thumbnailUrl"
        :alt="title"
        class="h-full w-full object-cover"
      />

      <div v-else class="h-full bg-[linear-gradient(135deg,#142b63_0%,#205b6d_100%)]"></div>

      <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"></div>
      <div class="absolute bottom-4 left-4 rounded-lg bg-black/55 px-3 py-1 text-xs font-bold text-white backdrop-blur">
        Preview
      </div>

      <button
        type="button"
        class="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#f5a400] text-2xl text-slate-950 shadow-lg shadow-[#f5a400]/30 transition hover:scale-105"
        aria-label="Preview course"
      >
        ▶
      </button>
    </div>

    <div class="space-y-5 p-6">
      <div>
        <p class="font-number text-4xl font-black text-[#f5a400]">₭{{ price }}</p>
        <p class="mt-1 text-sm font-bold text-slate-400">ເຂົ້າຮຽນໄດ້ຕະຫຼອດ</p>
      </div>

      <div
        v-if="isAlreadyEnrolled"
        class="rounded-2xl border p-4"
        :class="requiresPayment && !isPaid ? 'border-[#f5a400]/30 bg-[#f5a400]/10' : 'border-emerald-200 bg-emerald-50'"
      >
        <div class="flex items-center justify-between gap-3">
          <p
            class="text-sm font-black"
            :class="requiresPayment && !isPaid ? 'text-[#9a6500]' : 'text-emerald-700'"
          >
            {{ requiresPayment && !isPaid ? 'ລໍຖ້າແອດມິນອະນຸມັດ' : 'ລົງທະບຽນແລ້ວ' }}
          </p>
          <p class="text-sm font-black" :class="requiresPayment && !isPaid ? 'text-[#9a6500]' : 'text-emerald-700'">
            {{ progressPercent }}%
          </p>
        </div>
        <div class="mt-3 h-2 overflow-hidden rounded-full bg-white">
          <div
            class="h-full rounded-full bg-[#f5a400] transition-all"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
        <p class="mt-2 text-center text-xs font-bold text-slate-500">ຄວາມຄືບໜ້າການຮຽນ</p>
      </div>

      <RouterLink
        v-if="canAccessCourse && firstLessonId"
        :to="`/courses/${courseId}/learn/${firstLessonId}`"
        class="flex w-full items-center justify-center gap-3 rounded-xl bg-[#142b63] px-5 py-4 text-center font-black text-white transition hover:bg-[#0e214d]"
      >
        <span>▶</span>
        ເລີ່ມຮຽນ
      </RouterLink>

      <button
        v-else-if="isAlreadyEnrolled && requiresPayment && !isPaid && hasSubmittedSlip"
        type="button"
        disabled
        class="w-full cursor-not-allowed rounded-xl bg-slate-200 px-5 py-4 text-center font-black text-slate-500"
      >
        ລໍຖ້າອະນຸມັດ
      </button>

      <button
        v-else-if="isAlreadyEnrolled && requiresPayment && !isPaid"
        type="button"
        :disabled="isEnrolling || !isPublished"
        class="w-full rounded-xl bg-[#f5a400] px-5 py-4 text-center font-black text-slate-950 transition hover:bg-[#f7b733] disabled:cursor-not-allowed disabled:bg-slate-400"
        @click="$emit('enroll')"
      >
        {{ isEnrolling ? 'ກຳລັງດຳເນີນການ...' : 'ອັບໂຫຼດສະລີບ' }}
      </button>

      <button
        v-else
        type="button"
        :disabled="isEnrolling || !isPublished"
        class="w-full rounded-xl bg-[#142b63] px-5 py-4 text-center font-black text-white transition hover:bg-[#0e214d] disabled:cursor-not-allowed disabled:bg-slate-400"
        @click="$emit('enroll')"
      >
        {{
          !isPublished
            ? 'ຄອສນີ້ຍັງບໍ່ເປີດສອນ'
            : isEnrolling
              ? 'ກຳລັງດຳເນີນການ...'
              : requiresPayment
                ? 'ຊຳລະ / ລົງທະບຽນ'
                : 'ລົງທະບຽນຟຣີ'
        }}
      </button>


      <p v-if="enrollMessage" class="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {{ enrollMessage }}
      </p>

      <div class="border-t border-slate-200 pt-5">
        <h3 class="font-black text-slate-950">ຄອສນີ້ປະກອບດ້ວຍ</h3>

        <ul class="mt-4 space-y-3 text-sm font-medium text-slate-500">
          <li class="flex items-center gap-3"><span class="text-[#f5a400]">▷</span>{{ lessonCount }} ບົດຮຽນ</li>
          <li class="flex items-center gap-3"><span class="text-[#f5a400]">▣</span>ເອກະສານປະກອບການຮຽນ</li>
          <li class="flex items-center gap-3"><span class="text-[#f5a400]">∞</span>ເຂົ້າເຖິງໄດ້ຕະຫຼອດ</li>
          <li class="flex items-center gap-3"><span class="text-[#f5a400]">☆</span>ຕິດຕາມ progress ການຮຽນ</li>
        </ul>
      </div>
    </div>
  </aside>
</template>
