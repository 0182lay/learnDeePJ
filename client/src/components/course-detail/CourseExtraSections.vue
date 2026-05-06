<script setup lang="ts">
import type { CourseDetail } from '../../types/course'

defineProps<{
  course: CourseDetail
  instructorName: string
}>()

const faqs = [
  {
    question: 'ຮຽນຄອສນີ້ແລ້ວໄດ້ຫຍັງ?',
    answer: 'ໄດ້ພື້ນຖານ, ແນວທາງປະຕິບັດ ແລະບົດຮຽນທີ່ຕິດຕາມ progress ໄດ້.',
  },
  {
    question: 'ຕ້ອງມີພື້ນຖານກ່ອນບໍ?',
    answer: 'ຖ້າເປັນລະດັບ beginner ສາມາດເລີ່ມໄດ້ເລີຍ.',
  },
  {
    question: 'ຈ່າຍເງິນແລ້ວເຂົ້າຮຽນໄດ້ທັນທີບໍ?',
    answer: 'ລາຍການ payment ຈະເປັນ pending ກ່ອນ ແລ້ວ admin ຈະອະນຸມັດໃຫ້ເປັນ paid.',
  },
]
</script>

<template>
  <section class="bg-[#fbfaf7] px-8 py-14 lg:px-20 2xl:px-28">
    <div class="mx-auto grid max-w-[1700px] gap-6 xl:grid-cols-[1fr_0.8fr]">
      <article class="card-soft rounded-3xl p-7">
        <p class="text-sm font-black uppercase tracking-wide text-[#f5a400]">Instructor</p>
        <div class="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div class="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[#142b63] text-2xl font-black text-white">
            {{ instructorName.slice(0, 1).toUpperCase() }}
          </div>

          <div class="min-w-0">
            <h2 class="text-2xl font-black text-[#0f1f4d]">ອ. {{ instructorName }}</h2>
            <p class="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
              ຜູ້ສອນຂອງຄອສ {{ course.title }}. ເນື້ອຫາຖືກຈັດເປັນບົດຮຽນເພື່ອໃຫ້ຜູ້ຮຽນຕິດຕາມໄດ້ງ່າຍ.
            </p>
          </div>
        </div>

        <div class="mt-7 grid gap-3 sm:grid-cols-3">
          <div class="rounded-2xl bg-slate-50 p-4">
            <p class="font-number text-2xl font-black text-[#142b63]">4.8</p>
            <p class="mt-1 text-xs font-bold text-slate-500">Rating</p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-4">
            <p class="font-number text-2xl font-black text-[#142b63]">1,250+</p>
            <p class="mt-1 text-xs font-bold text-slate-500">Students</p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-4">
            <p class="font-number text-2xl font-black text-[#142b63]">12</p>
            <p class="mt-1 text-xs font-bold text-slate-500">Courses</p>
          </div>
        </div>
      </article>

      <article class="card-soft rounded-3xl p-7">
        <p class="text-sm font-black uppercase tracking-wide text-[#f5a400]">Reviews</p>
        <h2 class="mt-3 text-2xl font-black text-[#0f1f4d]">ຄວາມເຫັນຈາກຜູ້ຮຽນ</h2>

        <div class="mt-6 space-y-4">
          <div class="rounded-2xl bg-slate-50 p-4">
            <div class="flex items-center justify-between">
              <p class="font-black text-[#0f1f4d]">ສົມໃຈ</p>
              <p class="text-sm font-black text-[#f5a400]">★★★★★</p>
            </div>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              ຄອສອະທິບາຍງ່າຍ ແລະບົດຮຽນຈັດລຳດັບດີ.
            </p>
          </div>

          <div class="rounded-2xl bg-slate-50 p-4">
            <div class="flex items-center justify-between">
              <p class="font-black text-[#0f1f4d]">ນາລີ</p>
              <p class="text-sm font-black text-[#f5a400]">★★★★☆</p>
            </div>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              UI ສວຍ ມີ progress ໃຫ້ຕິດຕາມການຮຽນ.
            </p>
          </div>
        </div>
      </article>

      <article class="card-soft rounded-3xl p-7 xl:col-span-2">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-sm font-black uppercase tracking-wide text-[#f5a400]">FAQ</p>
            <h2 class="mt-3 text-2xl font-black text-[#0f1f4d]">ຄຳຖາມທີ່ພົບເລື້ອຍ</h2>
          </div>

          <RouterLink
            to="/courses"
            class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#142b63] transition hover:border-[#142b63]"
          >
            ເບິ່ງຄອສອື່ນ
          </RouterLink>
        </div>

        <div class="mt-6 grid gap-4 lg:grid-cols-3">
          <details
            v-for="faq in faqs"
            :key="faq.question"
            class="rounded-2xl border border-slate-100 bg-slate-50 p-4 open:bg-white open:shadow-sm"
          >
            <summary class="cursor-pointer text-sm font-black text-[#0f1f4d]">
              {{ faq.question }}
            </summary>
            <p class="mt-3 text-sm leading-6 text-slate-500">{{ faq.answer }}</p>
          </details>
        </div>
      </article>
    </div>
  </section>
</template>
