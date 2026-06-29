<script setup lang="ts">
import { BookOpen, TrendingUp, Users } from '@lucide/vue'

withDefaults(
  defineProps<{
    courseCount?: number
    studentCount?: number
    lessonCount?: number
  }>(),
  {
    courseCount: 0,
    studentCount: 0,
    lessonCount: 0,
  },
)
</script>

<template>
  <section class="border-b border-slate-200 bg-white">
    <div
      class="mx-auto flex max-w-[1700px] flex-wrap items-center justify-center gap-8 px-8 py-4 text-sm font-bold text-slate-600 lg:px-20 2xl:px-28"
    >
      <span class="inline-flex items-center gap-2">
        <TrendingUp class="h-4 w-4 text-[#f5a400]" /> {{ courseCount }} ຄອສທັງໝົດ
      </span>
      <span class="inline-flex items-center gap-2">
        <Users class="h-4 w-4 text-emerald-500" /> {{ studentCount }} ນັກຮຽນ
      </span>
      <span class="inline-flex items-center gap-2">
        <BookOpen class="h-4 w-4 text-[#f5a400]" /> {{ lessonCount }} ບົດຮຽນ
      </span>
    </div>
  </section>
</template>
