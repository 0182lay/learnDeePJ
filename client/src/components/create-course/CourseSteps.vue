<script setup lang="ts">
defineProps<{
  lessonsCount: number
}>()
</script>

<template>
  <div class="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex flex-col gap-5 md:flex-row md:items-center">
      <div class="flex items-center gap-3">
        <span class="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-sm font-black text-[#142b63]">
          1
        </span>
        <span class="text-sm font-bold text-slate-700">ຂໍ້ມູນຄອສ</span>
      </div>

      <div class="hidden h-px flex-1 bg-slate-200 md:block"></div>

      <div class="flex items-center gap-3">
        <span class="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-sm font-black text-slate-500">
          2
        </span>
        <span class="text-sm font-bold text-slate-500">ບົດຮຽນ ({{ lessonsCount }})</span>
      </div>
    </div>
  </div>
</template>
