<script setup lang="ts">
import logoUrl from '../../assets/images/logo.svg'
</script>

<template>
  <footer class="border-t border-slate-200 bg-white px-8 py-7 lg:px-20 2xl:px-28">
    <div class="mx-auto max-w-[1700px]">
      <div class="grid gap-7 md:grid-cols-4">
        <div>
          <RouterLink to="/" class="flex items-center gap-2.5">
            <img :src="logoUrl" alt="LearnDeepJ" class="h-8 w-auto" />
            <span class="text-xl font-black">
              <span class="text-[#142b63]">Learn</span>
              <span class="text-[#f5a400]">Dee</span>
            </span>
          </RouterLink>

          <p class="mt-3 max-w-xs text-sm leading-6 text-slate-500">
            ແພລດຟອມການຮຽນອອນລາຍ ອັນດັບ 1 ຂອງລາວ
          </p>
        </div>

        <div>
          <h3 class="text-sm font-black text-slate-950">ຄອສຮຽນ</h3>
          <ul class="mt-3 space-y-2.5 text-sm text-slate-500">
            <li><RouterLink to="/courses" class="hover:text-[#142b63]">ໜ້າທັງໝົດ</RouterLink></li>
            <li><RouterLink to="/courses" class="hover:text-[#142b63]">ຍອດນິຍົມ</RouterLink></li>
            <li><RouterLink to="/courses" class="hover:text-[#142b63]">ໃໝ່ລ່າສຸດ</RouterLink></li>
            <li><RouterLink to="/courses" class="hover:text-[#142b63]">ຟຣີ</RouterLink></li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-black text-slate-950">ກ່ຽວກັບ</h3>
          <ul class="mt-3 space-y-2.5 text-sm text-slate-500">
            <li><a href="#" class="hover:text-[#142b63]">ກ່ຽວກັບເຮົາ</a></li>
            <li><a href="#" class="hover:text-[#142b63]">ຕິດຕໍ່</a></li>
            <li><a href="#" class="hover:text-[#142b63]">ນະໂຍບາຍ</a></li>
            <li><a href="#" class="hover:text-[#142b63]">ຂໍ້ມູນໃຊ້</a></li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-black text-slate-950">ສະໜັບສະໜູນ</h3>
          <ul class="mt-3 space-y-2.5 text-sm text-slate-500">
            <li><a href="#" class="hover:text-[#142b63]">ຊ່ວຍເຫຼືອ</a></li>
            <li><a href="#" class="hover:text-[#142b63]">FAQ</a></li>
            <li><RouterLink to="/register" class="hover:text-[#142b63]">ເປັນຜູ້ສອນ</RouterLink></li>
            <li><a href="#" class="hover:text-[#142b63]">ຮ່ວມງານ</a></li>
          </ul>
        </div>
      </div>

      <div class="mt-7 border-t border-slate-200 pt-5 text-center text-xs text-slate-500">
        © 2026 LearnDeepJ. ສະຫງວນລິຂະສິດ.
      </div>
    </div>
  </footer>
</template>
