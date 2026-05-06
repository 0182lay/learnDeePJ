<script setup lang="ts">
const categories = [
  { name: 'ການພັດທະນາເວັບ', count: '45 ຄອສ', icon: '🌐', color: 'bg-sky-50 text-sky-600' },
  { name: 'ການອອກແບບ', count: '32 ຄອສ', icon: '🎨', color: 'bg-rose-50 text-rose-600' },
  { name: 'ທຸລະກິດ', count: '28 ຄອສ', icon: '💼', color: 'bg-[#f5a400]/10 text-[#f5a400]' },
  { name: 'ການຕະຫຼາດ', count: '21 ຄອສ', icon: '📈', color: 'bg-indigo-50 text-indigo-600' },
  { name: 'ພາສາ', count: '18 ຄອສ', icon: '🗣️', color: 'bg-violet-50 text-violet-600' },
  { name: 'ເທັກໂນໂລຊີ', count: '37 ຄອສ', icon: '💻', color: 'bg-cyan-50 text-cyan-600' },
  { name: 'ການເງິນ', count: '15 ຄອສ', icon: '💰', color: 'bg-[#f5a400]/10 text-[#f5a400]' },
  { name: 'ສຸຂະພາບ', count: '12 ຄອສ', icon: '⚕️', color: 'bg-fuchsia-50 text-fuchsia-600' },
]
</script>

<template>
  <section class="border-t border-slate-200 bg-[#f8fafc] py-12">
    <div class="mx-auto max-w-[1700px] px-8 lg:px-20 2xl:px-28">
      <div>
        <h2 class="text-2xl font-black text-[#142b63]">ໝວດໝູ່ຄອສຮຽນ</h2>
        <p class="mt-2 text-sm text-slate-500">ເລືອກຫົວຂໍ້ທີ່ສົນໃຈແລ້ວເລີ່ມຮຽນໄດ້ທັນທີ</p>
      </div>

      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RouterLink
          v-for="category in categories"
          :key="category.name"
          to="/courses"
          class="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#142b63]/20 hover:shadow-md"
        >
          <span
            class="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
            :class="category.color"
          >
            {{ category.icon }}
          </span>

          <span>
            <span class="block font-bold text-slate-900 group-hover:text-[#142b63]">
              {{ category.name }}
            </span>
            <span class="mt-1 block text-xs text-slate-500">{{ category.count }}</span>
          </span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
