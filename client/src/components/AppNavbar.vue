<script setup lang="ts">
import logoUrl from '../assets/images/logo.svg'
import NavbarUserMenu from './NavbarUserMenu.vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-slate-100 bg-white">
    <div
      class="mx-auto grid h-[50px] max-w-[1700px] grid-cols-[1fr_auto_1fr] items-center px-8 lg:px-20 2xl:px-28"
    >
      <RouterLink to="/" class="flex items-center gap-3 justify-self-start">
        <img :src="logoUrl" alt="LearnDeepJ" class="h-8 w-auto" />

        <p class="text-xl font-extrabold leading-5">
          <span class="text-[#142b63]">Learn</span>
          <span class="text-[#f5a400]">Dee</span>
        </p>
      </RouterLink>

      <nav class="hidden items-center gap-12 text-sm font-bold text-slate-500 md:flex">
        <RouterLink to="/" class="transition hover:text-[#142b63]">ໜ້າຫຼັກ</RouterLink>
        <RouterLink to="/courses" class="transition hover:text-[#142b63]">ຄອສຮຽນ</RouterLink>
        <RouterLink
          v-if="authStore.isLoggedIn"
          to="/dashboard"
          class="transition hover:text-[#142b63]"
        >
          Dashboard
        </RouterLink>
        <RouterLink
          v-if="authStore.user?.role === 'instructor' || authStore.user?.role === 'admin'"
          to="/courses/create"
          class="transition hover:text-[#142b63]"
        >
          ສ້າງຄອສ
        </RouterLink>
      </nav>

      <div class="justify-self-end">
        <NavbarUserMenu v-if="authStore.isLoggedIn" />

        <div v-else class="flex items-center gap-3">
          <RouterLink to="/login" class="hidden text-sm font-bold text-[#142b63] sm:block">
            ເຂົ້າສູ່ລະບົບ
          </RouterLink>

          <RouterLink
            to="/register"
            class="rounded-xl bg-[#142b63] px-6 py-2 text-sm font-bold text-white transition hover:bg-[#0e214d]"
          >
            ລົງທະບຽນ
          </RouterLink>
        </div>
      </div>
    </div>
  </header>
</template>
