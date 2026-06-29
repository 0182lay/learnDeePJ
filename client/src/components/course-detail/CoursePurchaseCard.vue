<script setup lang="ts">
import {
  Award,
  MonitorSmartphone,
  Play,
  Clock,
  Infinity as InfinityIcon,
  FileText,
  HelpCircle,
  Share2,
  Heart,
} from '@lucide/vue'

const props = defineProps<{
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

const displayPrice = () => {
  const amount = Number(String(props.price || 0).replace(/,/g, ''))
  return amount === 0 ? 'ຟຣີ' : `₭${props.price}`
}

const getMockDuration = (lessonCount: number | undefined) => {
  const count = lessonCount || 0
  if (count === 40) return 25
  if (count === 16) return 7
  if (count === 24) return 11
  return Math.max(Math.round(count * 0.6), 1)
}
</script>

<template>
  <aside class="overflow-hidden rounded-2xl bg-card text-card-foreground shadow-[var(--card-shadow-hover)] border border-slate-100">
    <div class="relative aspect-video bg-muted overflow-hidden">
      <img
        v-if="thumbnailUrl"
        :src="thumbnailUrl"
        :alt="title"
        class="h-full w-full object-cover"
      />
      <div v-else class="hero-gradient h-full w-full"></div>
      <div class="absolute inset-0 bg-primary/20"></div>
      <button
        type="button"
        class="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#f5a400] text-lg text-slate-950 shadow-[var(--card-shadow-hover)] transition duration-300 hover:scale-105"
        aria-label="Preview course"
      >
        <Play class="h-5 w-5 fill-current" />
      </button>

      <div class="absolute bottom-3 left-3 rounded bg-slate-950/75 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur-sm">
        ຕົວຢ່າງຄອສ
      </div>
      <div class="absolute bottom-3 right-3 flex items-center gap-1 rounded bg-slate-950/75 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur-sm">
        <Clock class="h-3.5 w-3.5" />
        2:30
      </div>
    </div>

    <div class="space-y-4 p-5">
      <div>
        <p class="font-number text-3xl font-black text-[#f5a400]">{{ displayPrice() }}</p>
        <p class="mt-1 text-xs font-bold text-slate-400">ເຂົ້າຮຽນໄດ້ຕະຫຼອດ</p>
      </div>

      <div v-if="canAccessCourse || hasSubmittedSlip" class="rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-4">
        <div class="flex items-center gap-2 text-emerald-600 font-bold text-sm">
          <span class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-black">✓</span>
          ລົງທະບຽນແລ້ວ
        </div>
        <div class="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
          <div
            class="h-full rounded-full bg-[#f5a400] transition-all"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
        <p class="mt-2 text-center text-[10px] font-bold text-slate-500">{{ progressPercent }}% ສຳເລັດ</p>
      </div>

      <RouterLink
        v-if="canAccessCourse && firstLessonId"
        :to="`/courses/${courseId}/learn/${firstLessonId}`"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-[#294a78] px-5 py-3 text-center text-sm font-black text-white hover:bg-[#213d66] transition-colors"
      >
        <Play class="h-3.5 w-3.5 fill-current" />
        ຮຽນຕໍ່
      </RouterLink>

      <button
        v-else-if="isAlreadyEnrolled && requiresPayment && !isPaid && hasSubmittedSlip"
        type="button"
        disabled
        class="w-full cursor-not-allowed rounded-xl bg-slate-200 px-5 py-3 text-center text-sm font-black text-slate-500"
      >
        ລໍຖ້າອະນຸມັດ
      </button>

      <button
        v-else-if="isAlreadyEnrolled && requiresPayment && !isPaid"
        type="button"
        :disabled="isEnrolling || !isPublished"
        class="w-full rounded-xl bg-[#f5a400] px-5 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-[#d89100] disabled:cursor-not-allowed disabled:bg-slate-400"
        @click="$emit('enroll')"
      >
        {{ isEnrolling ? 'ກຳລັງດຳເນີນການ...' : 'ອັບໂຫຼດສະລິບ' }}
      </button>

      <button
        v-else
        type="button"
        :disabled="isEnrolling || !isPublished"
        class="w-full rounded-xl bg-[#294a78] px-5 py-3 text-center text-sm font-black text-white transition hover:bg-[#213d66] disabled:cursor-not-allowed disabled:bg-slate-400"
        @click="$emit('enroll')"
      >
        {{
          !isPublished
            ? 'ຄອສນີ້ຍັງບໍ່ເປີດສອນ'
            : isEnrolling
              ? 'ກຳລັງດຳເນີນການ...'
              : 'ລົງທະບຽນຮຽນ'
        }}
      </button>

      <p v-if="enrollMessage" class="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
        {{ enrollMessage }}
      </p>

      <div class="border-t border-slate-200/80 pt-4">
        <h3 class="font-black text-sm text-slate-900">ຄອສນີ້ປະກອບດ້ວຍ:</h3>

        <ul class="mt-3 space-y-2.5 text-xs font-semibold text-slate-600">
          <li class="flex items-center gap-3">
            <Play class="h-4 w-4 text-[#f5a400] shrink-0" />
            ວິດີໂອ {{ getMockDuration(lessonCount) }} ຊມ on-demand
          </li>
          <li class="flex items-center gap-3">
            <FileText class="h-4 w-4 text-[#f5a400] shrink-0" />
            ເອກະສານປະກອບການຮຽນ
          </li>
          <li class="flex items-center gap-3">
            <MonitorSmartphone class="h-4 w-4 text-[#f5a400] shrink-0" />
            ເຂົ້າຮຽນຜ່ານມືຖື ແລະ ທີວີ
          </li>
          <li class="flex items-center gap-3">
            <InfinityIcon class="h-4 w-4 text-[#f5a400] shrink-0" />
            ເຂົ້າເຖິງຕະຫຼອດຊີວິດ
          </li>
          <li class="flex items-center gap-3">
            <Award class="h-4 w-4 text-[#f5a400] shrink-0" />
            ໃບຢັ້ງຢືນຫຼັງຈົບຄອສ
          </li>
          <li class="flex items-center gap-3">
            <HelpCircle class="h-4 w-4 text-[#f5a400] shrink-0" />
            ສະໜັບສະໜູນ Q&amp;A ຈາກຜູ້ສອນ
          </li>
        </ul>
      </div>

      <div class="border-t border-slate-200/80 pt-4 flex items-center justify-center gap-4 text-xs font-bold text-slate-500">
        <button type="button" class="flex items-center gap-1.5 hover:text-[#294a78] transition">
          <Share2 class="h-4 w-4" />
          ແຊຣ໌
        </button>
        <span>·</span>
        <button type="button" class="flex items-center gap-1.5 hover:text-red-500 transition">
          <Heart class="h-4 w-4" />
          ມັກ
        </button>
      </div>
    </div>
  </aside>
</template>
