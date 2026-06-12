<script setup lang="ts">
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
</script>

<template>
  <aside class="overflow-hidden rounded-lg bg-card text-card-foreground shadow-[var(--card-shadow-hover)]">
    <div class="relative aspect-video bg-muted">
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
        class="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-secondary text-lg text-secondary-foreground shadow-[var(--card-shadow-hover)] transition duration-300 hover:scale-105"
        aria-label="Preview course"
      >
        ▶
      </button>
    </div>

    <div class="space-y-3 p-4">
    <div>
      <p class="font-heading text-3xl font-black text-secondary">{{ displayPrice() }}</p>
      <p class="mt-1 text-sm font-bold text-muted-foreground">ເຂົ້າຮຽນໄດ້ຕະຫຼອດ</p>
    </div>

    <div v-if="isAlreadyEnrolled" class="rounded-lg border border-accent/25 bg-accent/10 p-3">
      <p class="text-xs font-black uppercase tracking-wide text-muted-foreground">ສະຖານະຄອສ</p>
      <p
        class="mt-1 text-sm font-black"
        :class="requiresPayment && !isPaid ? 'text-[#9a6500]' : 'text-accent'"
      >
        {{ requiresPayment && !isPaid ? 'ລໍຖ້າອະນຸມັດ' : 'ພ້ອມຮຽນແລ້ວ' }}
      </p>
      <div class="mt-3 h-2 overflow-hidden rounded-full bg-primary/15">
        <div
          class="h-full rounded-full bg-secondary transition-all"
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>
      <p class="mt-2 text-center text-[10px] font-bold text-muted-foreground">{{ progressPercent }}% ສຳເລັດ</p>
    </div>

    <RouterLink
      v-if="canAccessCourse && firstLessonId"
      :to="`/courses/${courseId}/learn/${firstLessonId}`"
      class="flex w-full items-center justify-center gap-3 rounded-lg bg-primary px-5 py-3 text-center text-sm font-black text-white transition hover:bg-primary/90"
    >
      <span>▶</span>
      ເລີ່ມຮຽນ
    </RouterLink>

    <button
      v-else-if="isAlreadyEnrolled && requiresPayment && !isPaid && hasSubmittedSlip"
      type="button"
      disabled
      class="w-full cursor-not-allowed rounded-lg bg-slate-200 px-5 py-3 text-center text-sm font-black text-slate-500"
    >
      ລໍຖ້າອະນຸມັດ
    </button>

    <button
      v-else-if="isAlreadyEnrolled && requiresPayment && !isPaid"
      type="button"
      :disabled="isEnrolling || !isPublished"
      class="w-full rounded-lg bg-secondary px-5 py-3 text-center text-sm font-black text-secondary-foreground transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:bg-slate-400"
      @click="$emit('enroll')"
    >
      {{ isEnrolling ? 'ກຳລັງດຳເນີນການ...' : 'ອັບໂຫຼດສະລິບ' }}
    </button>

    <button
      v-else
      type="button"
      :disabled="isEnrolling || !isPublished"
      class="w-full rounded-lg bg-primary px-5 py-3 text-center text-sm font-black text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-400"
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

    <button
      type="button"
      class="w-full rounded-lg border border-slate-200 bg-card px-5 py-2.5 text-center text-sm font-black text-primary transition hover:border-primary"
    >
      ເພີ່ມໃສ່ Wishlist
    </button>

    <p v-if="enrollMessage" class="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
      {{ enrollMessage }}
    </p>

    <div class="border-t border-slate-200 pt-3">
      <h3 class="font-black text-card-foreground">ຄອສນີ້ປະກອບດ້ວຍ</h3>

      <ul class="mt-3 space-y-2 text-xs font-medium text-muted-foreground">
        <li class="flex items-center gap-3"><span>🎬</span>20 ຊົ່ວໂມງວິດີໂອ</li>
        <li class="flex items-center gap-3"><span>📄</span>{{ lessonCount }} ບົດຮຽນ / ບົດຄວາມ</li>
        <li class="flex items-center gap-3"><span>📱</span>ເຂົ້າຮຽນໄດ້ທັງມືຖື ແລະ ຄອມ</li>
        <li class="flex items-center gap-3"><span>🏆</span>ໃບຢັ້ງຢືນເມື່ອຮຽນຈົບ</li>
      </ul>
    </div>

    <div class="border-t border-slate-200 pt-3">
      <p class="text-sm font-black text-card-foreground">ແຊຣ໌ຄອສນີ້</p>
      <div class="mt-3 flex flex-wrap gap-2">
        <button type="button" class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-primary">
          Facebook
        </button>
        <button type="button" class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-primary">
          Copy link
        </button>
      </div>
    </div>
    </div>
  </aside>
</template>
