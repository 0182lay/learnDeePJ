<script setup lang="ts">
import type { Course } from '../../types/course'

withDefaults(
  defineProps<{
    course: Course
    variant?: 'default' | 'courses'
  }>(),
  {
    variant: 'default',
  },
)

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

const formatRating = (course: Course) => {
  return course.review_count ? (course.average_rating || 0).toFixed(1) : '0.0'
}

const getLevelLabel = (level: string | null | undefined) => {
  const levelLabels: Record<string, string> = {
    beginner: 'ເລີ່ມຕົ້ນ',
    intermediate: 'ປານກາງ',
    advanced: 'ຂັ້ນສູງ',
  }

  return level ? levelLabels[level] || level : 'ເລີ່ມຕົ້ນ'
}
</script>

<template>
  <article
    class="group h-full overflow-hidden rounded-[14px] border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,31,77,0.04),0_14px_30px_rgba(15,31,77,0.06)] transition duration-300 ease-out hover:-translate-y-1 hover:border-slate-300/90 hover:shadow-[0_10px_24px_rgba(15,31,77,0.08),0_24px_48px_rgba(15,31,77,0.08)]"
  >
    <div
      class="relative overflow-hidden bg-slate-200"
      :class="variant === 'courses' ? 'h-[200px]' : 'h-[230px]'"
    >
      <img
        v-if="resolveThumbnail(course.thumbnail_url)"
        :src="resolveThumbnail(course.thumbnail_url)"
        :alt="course.title"
        class="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
      />

      <div v-else class="relative h-full w-full overflow-hidden bg-[#142b63]">
        <div class="absolute inset-0 bg-[linear-gradient(135deg,#142b63_0%,#334155_100%)]"></div>
        <div class="absolute -left-10 top-8 h-28 w-28 rounded-full bg-white/16 blur-2xl"></div>
        <div class="absolute bottom-0 right-0 h-28 w-40 bg-white/10"></div>
        <div class="absolute left-6 top-8 text-4xl font-black text-white/90">&lt;/&gt;</div>
        <p class="absolute bottom-5 left-6 text-lg font-black text-white">LearnDeepJ</p>
      </div>

      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-white/5 opacity-0 transition duration-500 group-hover:opacity-100"
      ></div>
      <div
        class="pointer-events-none absolute -left-24 top-0 h-full w-16 -skew-x-12 bg-white/20 opacity-0 blur-sm transition-all duration-700 ease-out group-hover:left-[115%] group-hover:opacity-100"
      ></div>

      <div class="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] flex-wrap gap-2">
        <span
          class="max-w-[13rem] truncate rounded-full bg-[#f5a400] px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-sm"
        >
          {{ course.category?.name || 'ເທັກໂນໂລຊີ' }}
        </span>

        <span
          class="rounded-full bg-slate-50/95 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-300/80 backdrop-blur"
        >
          {{ getLevelLabel(course.level) }}
        </span>
      </div>
    </div>

    <div class="px-5 pb-4 pt-4">
      <h3
        class="line-clamp-2 font-[600] text-slate-950 transition-colors duration-200 group-hover:text-[#e99a00] group-active:text-[#e99a00]"
        :class="variant === 'courses' ? 'text-[1rem] leading-6' : 'text-lg leading-6'"
      >
        {{ course.title }}
      </h3>

      <p
        class="mt-2 truncate font-medium text-slate-500"
        :class="variant === 'courses' ? 'text-[13px]' : 'text-sm'"
      >
        ອ. {{ getInstructorName(course) }}
      </p>

      <div
        class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-normal text-[#536179]"
        :class="variant === 'courses' ? 'text-[13px]' : 'text-sm'"
      >
        <span class="inline-flex shrink-0 items-center gap-1 font-normal">
          <svg class="h-4 w-4 fill-[#f5a400] text-[#f5a400]" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="m10 1.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.8L10 1.5Z"
            />
          </svg>
          <span class="text-[#536179]">{{ formatRating(course) }}</span>
        </span>
        <span class="inline-flex shrink-0 items-center gap-1">
          <svg
            class="h-[13px] w-[13px] text-[#64748b]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.45"
            aria-hidden="true"
          >
            <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
            <circle cx="12" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {{ course.review_count || 0 }}
        </span>
        <span class="inline-flex shrink-0 items-center gap-1.5">
          <svg
            class="h-[13px] w-[13px] text-[#64748b]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            aria-hidden="true"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
          </svg>
          36 ບົດ
        </span>
        <span class="inline-flex shrink-0 items-center gap-1.5">
          <svg
            class="h-[13px] w-[13px] text-[#64748b]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          20 ຊມ
        </span>
      </div>

      <div class="mt-3 border-t border-slate-200/80 pt-3">
        <p
          class="font-number font-[700] leading-none text-[#e99a00]"
          :class="variant === 'courses' ? 'text-[1rem]' : 'text-[1.08rem]'"
        >
          ₭{{ formatPrice(course.price) }}
        </p>
      </div>
    </div>
  </article>
</template>
