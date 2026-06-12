<script setup lang="ts">
import { resolveAssetUrl } from '../../api/config'
import type { Course } from '../../types/course'

withDefaults(
  defineProps<{
    course: Course
    variant?: 'default' | 'courses'
    enrollmentState?: 'none' | 'active' | 'pending'
  }>(),
  {
    variant: 'default',
    enrollmentState: 'none',
  },
)

const resolveThumbnail = (url: string | null) => {
  return resolveAssetUrl(url)
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

  return numberPrice === 0 ? 'ຟຣີ' : `₭${numberPrice.toLocaleString('en-US')}`
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
    class="group h-full overflow-hidden rounded-xl border border-slate-200 bg-card shadow-[var(--card-shadow)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#294a78]/25 hover:shadow-[0_18px_38px_rgba(41,74,120,0.13)]"
  >
    <div class="relative aspect-video overflow-hidden bg-muted">
      <img
        v-if="resolveThumbnail(course.thumbnail_url)"
        :src="resolveThumbnail(course.thumbnail_url)"
        :alt="course.title"
        class="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-105"
      />

      <div v-else class="hero-gradient relative h-full w-full overflow-hidden">
        <div class="absolute bottom-0 right-0 h-28 w-40 bg-white/10"></div>
        <div class="absolute left-6 top-8 text-4xl font-black text-white/90">&lt;/&gt;</div>
        <p class="absolute bottom-5 left-6 text-lg font-black text-white">LearnDee</p>
      </div>

      <div class="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] flex-wrap gap-2">
        <span class="max-w-[13rem] truncate rounded-full bg-[#294a78] px-3 py-1 text-xs font-black text-white shadow-sm">
          {{ course.category?.name || 'ເຕັກໂນໂລຊີ' }}
        </span>

        <span
          class="rounded-full border border-slate-200 bg-card/80 px-3 py-1 text-xs font-black text-muted-foreground shadow-sm backdrop-blur"
        >
          {{ getLevelLabel(course.level) }}
        </span>
      </div>
    </div>

    <div class="space-y-3 p-4">
      <h3
        class="line-clamp-2 font-heading text-base font-semibold leading-snug text-card-foreground transition-colors duration-300 group-hover:text-[#294a78]"
      >
        {{ course.title }}
      </h3>

      <p class="truncate text-sm text-muted-foreground">
        ໂດຍ {{ getInstructorName(course) }}
      </p>

      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span class="inline-flex shrink-0 items-center gap-1">
          <svg class="h-3.5 w-3.5 fill-[#294a78] text-[#294a78]" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="m10 1.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.8L10 1.5Z"
            />
          </svg>
          <span>{{ formatRating(course) }}</span>
        </span>
        <span>·</span>
        <span class="inline-flex shrink-0 items-center gap-1">
          <span>👥</span>
          {{ course.review_count || 0 }}
        </span>
        <span>·</span>
        <span class="inline-flex shrink-0 items-center gap-1">
          <span>📖</span>
          36
        </span>
        <span>·</span>
        <span class="inline-flex shrink-0 items-center gap-1">
          <span>🕐</span>
          20 ຊມ.
        </span>
      </div>

      <div class="border-t border-slate-200 pt-1">
        <p
          v-if="enrollmentState === 'none'"
          class="font-heading text-lg font-semibold leading-none text-[#294a78]"
        >
          {{ formatPrice(course.price) }}
        </p>

        <div v-else class="flex items-center justify-between gap-3">
          <span
            class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black"
            :class="
              enrollmentState === 'pending'
                ? 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
                : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
            "
          >
            <span>{{ enrollmentState === 'pending' ? '⏳' : '✓' }}</span>
            {{ enrollmentState === 'pending' ? 'ລໍຖ້າຊຳລະເງິນ' : 'ລົງທະບຽນແລ້ວ' }}
          </span>

          <span
            class="text-xs font-black"
            :class="enrollmentState === 'pending' ? 'text-[#9a6500]' : 'text-emerald-700'"
          >
            {{ enrollmentState === 'pending' ? 'ກວດສອບ' : 'ເຂົ້າຮຽນ' }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>
