<script setup lang="ts">
import learndeeimg from '../../assets/images/learndeeimg.png'
</script>

<template>
  <section class="course-detail-hero relative overflow-hidden">
    <!-- Premium floating glassmorphic background blobs -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden opacity-45">
      <div class="absolute -top-20 -left-20 w-96 h-96 bg-sky-400/50 rounded-full mix-blend-screen filter blur-3xl animate-blob"></div>
      <div class="absolute top-24 -right-20 w-96 h-96 bg-amber-400/40 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-28 left-1/3 w-96 h-96 bg-purple-400/40 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>
    </div>

    <div
      class="relative mx-auto grid min-h-[460px] max-w-[1680px] items-center gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[0.94fr_1.06fr] lg:px-16 2xl:px-20"
    >
      <div>
        <h1 class="max-w-[680px] text-4xl font-black leading-[1.12] text-white md:text-[2.75rem]">
          ຮຽນທັກສະໃໝ່ໃຫ້ມ່ວນຂຶ້ນ ແລະ ຕໍ່ຍອດເປັນວຽກທີ່ໃຊ້ໄດ້ຈິງ
        </h1>

        <p class="mt-5 max-w-[620px] text-base leading-8 text-white/84">
          ເລືອກຄອສຈາກຜູ້ສອນຄຸນນະພາບ ພ້ອມບົດຮຽນ ວິດີໂອ ແບບທົດສອບ ແລະ ເສັ້ນທາງການຮຽນທີ່ຊ່ວຍໃຫ້ເຈົ້າເຫັນພັດທະນາການຂອງຕົນເອງເປັນຂັ້ນ
        </p>

        <div class="mt-7 flex flex-col gap-4 sm:flex-row">
          <RouterLink
            to="/register"
            class="interactive-motion shine-button inline-flex items-center justify-center gap-3 rounded-xl bg-[#f5a400] px-10 py-4 text-center font-extrabold text-slate-950 shadow-[0_16px_34px_rgba(245,164,0,0.2)] transition hover:bg-[#ffb52e]"
          >
            ເລີ່ມຮຽນເລີຍ <span aria-hidden="true">→</span>
          </RouterLink>

          <RouterLink
            to="/courses"
            class="interactive-motion inline-flex items-center justify-center gap-3 rounded-xl border border-white/35 px-10 py-4 text-center font-extrabold text-white transition hover:bg-white/10"
          >
            ເບິ່ງຄອສທັງໝົດ
          </RouterLink>
        </div>

        <label
          class="mt-7 flex max-w-[560px] items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-white shadow-sm backdrop-blur"
        >
          <span class="text-white/55">⌕</span>
          <input
            type="search"
            placeholder="ຄົ້ນຫາຄອສທີ່ຢາກຮຽນ..."
            class="w-full bg-transparent text-base font-medium text-white outline-none placeholder:text-white/50"
          />
        </label>
      </div>

      <div class="hidden justify-center lg:flex">
        <div class="relative flex min-h-[360px] w-full justify-center">
          <img
            :src="learndeeimg"
            alt="LearnDee"
            class="relative z-10 w-full max-w-[460px] object-contain drop-shadow-[0_24px_38px_rgba(0,0,0,0.22)]"
          />
        </div>
      </div>
    </div>
  </section>
</template>
