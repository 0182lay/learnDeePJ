<script setup lang="ts">
defineProps<{
  lessonCount: number
  level: string | null
  categoryName: string
  isPublished: boolean
}>()
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <div class="rounded-2xl border border-white/15 bg-white/[0.08] p-5 text-white shadow-sm backdrop-blur">
      <p class="text-2xl text-[#f5a400]">▣</p>
      <p class="mt-4 font-number text-2xl font-black">{{ lessonCount }}</p>
      <p class="mt-1 text-sm font-medium text-white/65">ບົດຮຽນ</p>
    </div>

    <div class="rounded-2xl border border-white/15 bg-white/[0.08] p-5 text-white shadow-sm backdrop-blur">
      <p class="text-2xl text-[#f5a400]">◷</p>
      <p class="mt-4 truncate text-2xl font-black">{{ level || 'ເລີ່ມຕົ້ນ' }}</p>
      <p class="mt-1 text-sm font-medium text-white/65">ລະດັບ</p>
    </div>

    <div class="rounded-2xl border border-white/15 bg-white/[0.08] p-5 text-white shadow-sm backdrop-blur">
      <p class="text-2xl text-[#f5a400]">◇</p>
      <p class="mt-4 truncate text-2xl font-black">{{ categoryName }}</p>
      <p class="mt-1 text-sm font-medium text-white/65">ໝວດໝູ່</p>
    </div>

    <div class="rounded-2xl border border-white/15 bg-white/[0.08] p-5 text-white shadow-sm backdrop-blur">
      <p class="text-2xl text-[#f5a400]">✓</p>
      <p class="mt-4 text-2xl font-black">{{ isPublished ? 'Open' : 'Draft' }}</p>
      <p class="mt-1 text-sm font-medium text-white/65">ສະຖານະ</p>
    </div>
  </div>
</template>
