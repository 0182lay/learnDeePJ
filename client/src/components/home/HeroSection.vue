<script setup lang="ts">
import learndeeimg from '../../assets/images/learndeeimg.png'
</script>

<template>
  <section class="bg-[linear-gradient(110deg,#162a5f_0%,#183866_50%,#205b6d_100%)]">
    <div
      class="mx-auto grid min-h-[380px] max-w-[1700px] items-center gap-8 px-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-20 2xl:px-28"
    >
      <div>
        <p class="text-sm font-extrabold uppercase tracking-wide text-[#ffd51e]">
          Online Learning Platform
        </p>

        <h1 class="mt-5 max-w-3xl text-4xl font-black leading-[1.12] text-white md:text-5xl">
          ຮຽນທັກສະໃໝ່ ໄດ້ທຸກທີ່ ທຸກເວລາ
        </h1>

        <p class="mt-5 max-w-2xl text-base leading-8 text-white/85 md:text-lg">
          LearnDeepJ ແມ່ນແພລດຟອມຮຽນອອນລາຍສຳລັບຄົນທີ່ຢາກພັດທະນາທັກສະ ເລືອກຄອສ, ຮຽນບົດຮຽນ, ເຮັດ quiz
          ແລະຕິດຕາມຄວາມຄືບໜ້າໄດ້.
        </p>

        <div class="mt-7 flex flex-col gap-4 sm:flex-row">
          <RouterLink
            to="/register"
            class="rounded-xl bg-[#f5a400] px-10 py-4 text-center font-extrabold text-slate-950 transition hover:bg-[#f5a400]/85"
          >
            ເລີ່ມຮຽນ <span aria-hidden="true"> →</span>
          </RouterLink>

          <RouterLink
            to="/courses"
            class="rounded-xl border border-white/30 px-10 py-4 text-center font-extrabold text-white transition hover:bg-white/10"
          >
            ເບິ່ງຄອສ
          </RouterLink>
        </div>
      </div>

      <div class="hidden justify-center lg:flex">
        <div class="relative flex justify-center">
          <img :src="learndeeimg" alt="LearnDee" class="w-full max-w-[520px] object-contain" />
        </div>
      </div>
    </div>
  </section>
</template>
