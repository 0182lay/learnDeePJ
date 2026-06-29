<script setup lang="ts">
import { Search, Sparkles } from '@lucide/vue'

defineProps<{
  modelValue: string
  courseCount: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <section class="course-detail-hero">
    <div class="mx-auto max-w-[1700px] px-8 py-16 text-center lg:px-20 2xl:px-28">
      <div
        class="mx-auto inline-flex items-center gap-2 rounded-lg bg-white/12 px-4 py-2 text-sm font-bold text-[#ffd15a] ring-1 ring-white/15 shadow-sm backdrop-blur"
      >
        <Sparkles class="h-4 w-4" /> ຄົ້ນຫາ {{ courseCount }} ຄອສຮຽນ
      </div>

      <h1 class="mt-5 text-4xl font-black leading-tight text-white md:text-5xl">
        ຄົ້ນຫາຄອສຮຽນ <span class="text-[#f5a400]">ທີ່ເໝາະກັບເຈົ້າ</span>
      </h1>

      <p class="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
        ພັດທະນາທັກສະ ສ້າງອະນາຄົດ ກັບຜູ້ສອນທີ່ມີປະສົບການຫຼາຍສາຂາ
      </p>

      <label
        class="mx-auto mt-8 flex max-w-2xl items-center gap-3 rounded-lg border border-white/25 bg-white/14 px-5 py-4 text-left text-white shadow-[0_18px_44px_rgba(0,0,0,0.12)] backdrop-blur transition focus-within:border-[#f5a400]/70 focus-within:bg-white/18"
      >
        <Search class="h-4 w-4 text-white/60" />
        <input
          :value="modelValue"
          type="search"
          placeholder="ຄົ້ນຫາຄອສຮຽນ, ຫົວຂໍ້, ຜູ້ສອນ..."
          class="w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/50"
          @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
      </label>
    </div>
  </section>
</template>
