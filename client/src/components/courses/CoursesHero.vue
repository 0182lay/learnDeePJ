<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <section class="bg-[linear-gradient(110deg,#162a5f_0%,#254b79_55%,#2f7187_100%)]">
    <div class="mx-auto max-w-[1700px] px-8 py-16 text-center lg:px-20 2xl:px-28">
      <div
        class="mx-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-[#f5a400] ring-1 ring-white/10"
      >
        ✦ ຄົ້ນຫາ 350+ ຄອສຮຽນ
      </div>

      <h1 class="mt-5 text-4xl font-black leading-tight text-white md:text-5xl">
        ຄົ້ນຫາຄອສຮຽນ <span class="text-[#f5a400]">ທີ່ເໝາະກັບເຈົ້າ</span>
      </h1>

      <p class="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
        ພັດທະນາທັກສະ ສ້າງອະນາຄົດ ກັບຜູ້ສອນທີ່ມີປະສົບການຫຼາຍສາຂາ
      </p>

      <label
        class="mx-auto mt-8 flex max-w-xl items-center gap-3 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-left text-white shadow-sm"
      >
        <span class="text-white/60">⌕</span>
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
