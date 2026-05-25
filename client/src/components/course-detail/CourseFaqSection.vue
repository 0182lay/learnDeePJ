<script setup lang="ts">
const faqs = [
  {
    question: 'ຮຽນຄອສນີ້ໄດ້ດົນເທົ່າໃດ?',
    answer: 'ຫຼັງຈາກລົງທະບຽນແລ້ວ ສາມາດກັບເຂົ້າມາຮຽນໄດ້ຕາມທີ່ລະບົບກຳນົດ.',
  },
  {
    question: 'ຕ້ອງມີພື້ນຖານກ່ອນບໍ?',
    answer: 'ຖ້າຄອສເປັນລະດັບ beginner ສາມາດເລີ່ມຮຽນໄດ້ເລີຍ.',
  },
  {
    question: 'ຈ່າຍເງິນແລ້ວເຂົ້າຮຽນໄດ້ທັນທີບໍ?',
    answer: 'ຫຼັງສົ່ງສະລີບ ສະຖານະຈະເປັນ pending ກ່ອນ ແລ້ວ admin ຈະອະນຸມັດໃຫ້ເຂົ້າຮຽນ.',
  },
  {
    question: 'ມີໃບປະກາດບໍ?',
    answer: 'ມີ ເມື່ອຮຽນຈົບບົດຮຽນ ແລະ ຜ່ານ quiz ຕາມເງື່ອນໄຂ.',
  },
]
</script>

<template>
  <section class="bg-white px-8 py-10 lg:px-20 2xl:px-28">
    <div class="mx-auto max-w-[1700px]">
      <div class="mb-6">
        <p class="text-sm font-black uppercase tracking-wide text-[#f5a400]">FAQ</p>
        <h2 class="mt-3 text-2xl font-black text-[#0f1f4d]">ຄຳຖາມທີ່ພົບເລື້ອຍ</h2>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <details
          v-for="faq in faqs"
          :key="faq.question"
          class="rounded-2xl border border-slate-200 bg-slate-50 p-5 open:bg-white open:shadow-sm"
        >
          <summary class="cursor-pointer text-sm font-black text-[#0f1f4d]">
            {{ faq.question }}
          </summary>
          <p class="mt-3 text-sm leading-7 text-slate-500">{{ faq.answer }}</p>
        </details>
      </div>
    </div>
  </section>
</template>
