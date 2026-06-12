<script setup lang="ts">
import logoUrl from '../../assets/images/logolearndee.png'
</script>

<template>
  <footer class="border-t border-slate-200 bg-white px-8 py-7 lg:px-20 2xl:px-28">
    <div class="mx-auto max-w-[1700px]">
      <div class="grid gap-7 md:grid-cols-4">
        <div>
          <RouterLink to="/" class="flex items-center gap-2.5">
            <img :src="logoUrl" alt="LearnDee" class="h-8 w-auto" />
            <span class="text-xl font-black">
              <span class="text-[#294a78]">Learn</span>
              <span class="text-[#f5a400]">Dee</span>
            </span>
          </RouterLink>

          <p class="mt-3 max-w-xs text-sm leading-6 text-slate-500">
            ແພລດຟອມຮຽນອອນລາຍທີ່ຊ່ວຍໃຫ້ເຈົ້າພັດທະນາທັກສະໄດ້ຢ່າງເປັນລະບົບ
          </p>
        </div>

        <div>
          <h3 class="text-sm font-black text-slate-950">ຄອສຮຽນ</h3>
          <ul class="mt-3 space-y-2.5 text-sm text-slate-500">
            <li><RouterLink to="/courses" class="hover:text-[#294a78]">ທັງໝົດ</RouterLink></li>
            <li><RouterLink to="/courses" class="hover:text-[#294a78]">ຍອດນິຍົມ</RouterLink></li>
            <li><RouterLink to="/courses" class="hover:text-[#294a78]">ມາໃໝ່</RouterLink></li>
            <li><RouterLink to="/courses" class="hover:text-[#294a78]">ຟຣີ</RouterLink></li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-black text-slate-950">ກ່ຽວກັບ</h3>
          <ul class="mt-3 space-y-2.5 text-sm text-slate-500">
            <li><a href="#" class="hover:text-[#294a78]">ກ່ຽວກັບພວກເຮົາ</a></li>
            <li><a href="#" class="hover:text-[#294a78]">ຕິດຕໍ່</a></li>
            <li><a href="#" class="hover:text-[#294a78]">ນະໂຍບາຍ</a></li>
            <li><a href="#" class="hover:text-[#294a78]">ເງື່ອນໄຂການໃຊ້ງານ</a></li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-black text-slate-950">ສະໜັບສະໜູນ</h3>
          <ul class="mt-3 space-y-2.5 text-sm text-slate-500">
            <li><a href="#" class="hover:text-[#294a78]">ຊ່ວຍເຫຼືອ</a></li>
            <li><a href="#" class="hover:text-[#294a78]">FAQ</a></li>
            <li><RouterLink to="/register" class="hover:text-[#294a78]">ສະໝັກສະມາຊິກ</RouterLink></li>
            <li><a href="#" class="hover:text-[#294a78]">ຮ່ວມງານກັບພວກເຮົາ</a></li>
          </ul>
        </div>
      </div>

      <div class="mt-7 border-t border-slate-200 pt-5 text-center text-xs text-slate-500">
        © 2026 LearnDee. ສະຫງວນລິຂະສິດ.
      </div>
    </div>
  </footer>
</template>
