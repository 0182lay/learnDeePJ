<script setup lang="ts">
import { ref } from 'vue'
import { BookOpen, Clock, Star, Users } from '@lucide/vue'
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
  const baseName = fullName || course.instructor?.email || 'ຜູ້ສອນ'
  
  return baseName.startsWith('ອ.') ? baseName : `ອ. ${baseName}`
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

const formatCount = (count: number | undefined) => {
  return count || 0
}

const getMockDuration = (lessonCount: number | undefined) => {
  const count = lessonCount || 0
  if (count === 40) return 25
  if (count === 16) return 7
  if (count === 24) return 11
  return Math.max(Math.round(count * 0.6), 1)
}

const getLevelLabel = (level: string | null | undefined) => {
  const levelLabels: Record<string, string> = {
    beginner: 'ເລີ່ມຕົ້ນ',
    intermediate: 'ປານກາງ',
    advanced: 'ຂັ້ນສູງ',
  }

  return level ? levelLabels[level] || level : 'ເລີ່ມຕົ້ນ'
}

const cardRef = ref<HTMLElement | null>(null)
const transformStyle = ref('')

const handleMouseMove = (e: MouseEvent) => {
  if (!cardRef.value) return
  const el = cardRef.value
  const rect = el.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const xc = rect.width / 2
  const yc = rect.height / 2
  const dx = x - xc
  const dy = y - yc

  // 3D perspective rotation (max 6 degrees)
  const rotateX = -(dy / yc) * 6
  const rotateY = (dx / xc) * 6

  transformStyle.value = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.002, 1.002, 1.002)`
}

const handleMouseLeave = () => {
  transformStyle.value = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
}
</script>

<template>
  <article
    ref="cardRef"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    :style="{ transform: transformStyle, transition: transformStyle ? 'transform 0.08s ease-out' : 'transform 0.35s ease-out' }"
    class="group h-full overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--card-shadow)] transition-all duration-300 ease-out hover:border-primary/25 hover:shadow-[0_20px_40px_rgba(15,31,77,0.15)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
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
        <span class="max-w-[13rem] truncate rounded-full bg-[#f5a400] px-3 py-1 text-xs font-black text-slate-900 shadow-sm">
          {{ course.category?.name || 'ເຕັກໂນໂລຊີ' }}
        </span>

        <span
          class="rounded-full border border-border bg-card/85 px-3 py-1 text-xs font-black text-muted-foreground shadow-sm backdrop-blur"
        >
          {{ getLevelLabel(course.level) }}
        </span>
      </div>
    </div>

    <div class="space-y-3 p-4">
      <h3
        class="line-clamp-2 text-base font-semibold leading-snug text-card-foreground transition-colors duration-300 group-hover:text-[#f5a400]"
      >
        {{ course.title }}
      </h3>

      <p class="truncate text-sm text-muted-foreground font-medium">
        {{ getInstructorName(course) }}
      </p>

      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span class="inline-flex shrink-0 items-center gap-1">
          <Star class="h-3.5 w-3.5 fill-[#f5a400] text-[#f5a400]" />
          <span class="font-bold text-foreground/80">{{ formatRating(course) }}</span>
        </span>
        <span>·</span>
        <span class="inline-flex shrink-0 items-center gap-1">
          <Users class="h-3.5 w-3.5 text-slate-400" />
          <span>{{ formatCount(course.enrollment_count).toLocaleString('en-US') }}</span>
        </span>
        <span>·</span>
        <span class="inline-flex shrink-0 items-center gap-1">
          <BookOpen class="h-3.5 w-3.5 text-slate-400" />
          <span>{{ formatCount(course.lesson_count) }} ບົດ</span>
        </span>
        <span>·</span>
        <span class="inline-flex shrink-0 items-center gap-1">
          <Clock class="h-3.5 w-3.5 text-slate-400" />
          <span>{{ getMockDuration(course.lesson_count) }} ຊມ</span>
        </span>
      </div>

      <div class="border-t border-border pt-2">
        <p
          v-if="enrollmentState === 'none'"
          class="font-number text-xl font-bold leading-none text-[#f5a400]"
        >
          {{ formatPrice(course.price) }}
        </p>

        <div v-else class="flex items-center justify-between gap-3">
          <span
            class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black"
            :class="
              enrollmentState === 'pending'
                ? 'bg-muted text-muted-foreground ring-1 ring-border'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20'
            "
          >
            <span>{{ enrollmentState === 'pending' ? '⏳' : '✓' }}</span>
            {{ enrollmentState === 'pending' ? 'ລໍຖ້າຊຳລະເງິນ' : 'ລົງທະບຽນແລ້ວ' }}
          </span>

          <span
            class="text-xs font-black"
            :class="enrollmentState === 'pending' ? 'text-[#9a6500] dark:text-[#ffb52e]' : 'text-emerald-600 dark:text-emerald-400'"
          >
            {{ enrollmentState === 'pending' ? 'ກວດສອບ' : 'ເຂົ້າຮຽນ' }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>
