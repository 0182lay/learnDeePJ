<script setup lang="ts">
import type { Course } from '../../types/course'

defineProps<{
  course: Course
}>()

const resolveThumbnail = (url: string | null) => {
  if (!url) {
    return ''
  }

  if (url.startsWith('http')) {
    return url
  }

  return `http://localhost:3003${url.startsWith('/') ? url : `/${url}`}`
}

const getInstructorName = (course: Course) => {
  const profile = course.instructor?.profile
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')

  return fullName || course.instructor?.email || 'ຜູ້ສອນ'
}

const formatPrice = (price: string) => {
  const numberPrice = Number(String(price).replace(/,/g, ''))

  if (Number.isNaN(numberPrice)) {
    return price
  }

  return new Intl.NumberFormat('en-US').format(numberPrice)
}
</script>

<template>
  <article
    class="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
  >
    <div class="relative h-52 overflow-hidden bg-slate-200">
      <img
        v-if="resolveThumbnail(course.thumbnail_url)"
        :src="resolveThumbnail(course.thumbnail_url)"
        :alt="course.title"
        class="h-full w-full object-cover"
      />

      <div v-else class="relative h-full w-full overflow-hidden bg-[#142b63]">
        <div class="absolute inset-0 bg-[linear-gradient(135deg,#142b63_0%,#205b6d_100%)]"></div>
        <div class="absolute -left-10 top-8 h-28 w-28 rounded-full bg-[#f5a400]/70 blur-2xl"></div>
        <div class="absolute bottom-0 right-0 h-28 w-40 bg-white/10"></div>
        <div class="absolute left-6 top-8 text-4xl font-black text-white/90">&lt;/&gt;</div>
        <p class="absolute bottom-5 left-6 text-lg font-black text-white">LearnDeepJ</p>
      </div>

      <div class="absolute left-4 top-4 flex gap-2">
        <span class="rounded-full bg-[#f5a400] px-3 py-1 text-xs font-[600] text-slate-950">
          {{ course.category?.name || 'ເທັກໂນໂລຊີ' }}
        </span>

        <span class="rounded-full bg-white/90 px-3 py-1 text-xs font-[600] text-slate-700">
          {{ course.level || 'ເລີ່ມຕົ້ນ' }}
        </span>
      </div>
    </div>

    <div class="px-4 pb-4 pt-4">
      <h3 class="line-clamp-2 text-lg font-black leading-6 text-[#0f1f4d]">
        {{ course.title }}
      </h3>

      <p class="mt-2 text-sm text-slate-500">ອ. {{ getInstructorName(course) }}</p>

      <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span class="font-bold text-[#f5a400]">★ <span class="text-slate-600">4.7</span></span>
        <span>ຄົນ 670</span>
        <span>36 ບົດ</span>
        <span>20 ຊມ</span>
      </div>

      <div class="mt-2 border-t border-slate-200 pt-2">
        <p class="font-number text-[1.1rem] font-black text-[#f5a400]">
          ₭{{ formatPrice(course.price) }}
        </p>
      </div>
    </div>
  </article>
</template>
