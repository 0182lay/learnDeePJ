<script setup lang="ts">
import logoUrl from '../assets/images/logo.svg'
import NavbarUserMenu from './NavbarUserMenu.vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_0_rgba(15,31,77,0.03)] backdrop-blur">
    <div
      class="mx-auto grid h-[64px] max-w-[1700px] grid-cols-[1fr_auto_1fr] items-center px-6 sm:px-8 lg:px-20 2xl:px-28"
    >
      <RouterLink to="/" class="flex items-center gap-3 justify-self-start">
        <img :src="logoUrl" alt="LearnDeepJ" class="h-8 w-auto" />

        <p class="text-xl font-extrabold leading-5">
          <span class="text-[#142b63]">Learn</span>
          <span class="text-[#f5a400]">Dee</span>
        </p>
      </RouterLink>

      <nav class="hidden items-center gap-10 text-sm font-bold text-slate-500 md:flex">
        <RouterLink to="/" class="rounded-full px-2 py-1 transition hover:bg-slate-50 hover:text-[#142b63]">ໜ້າຫຼັກ</RouterLink>
        <RouterLink to="/courses" class="rounded-full px-2 py-1 transition hover:bg-slate-50 hover:text-[#142b63]">ຄອສຮຽນ</RouterLink>
        <RouterLink
          v-if="authStore.isLoggedIn"
          to="/dashboard"
          class="rounded-full px-2 py-1 transition hover:bg-slate-50 hover:text-[#142b63]"
        >
          Dashboard
        </RouterLink>
        <RouterLink
          v-if="authStore.user?.role === 'instructor' || authStore.user?.role === 'admin'"
          to="/courses/create"
          class="rounded-full px-2 py-1 transition hover:bg-slate-50 hover:text-[#142b63]"
        >
          ສ້າງຄອສ
        </RouterLink>
      </nav>

      <div class="justify-self-end">
        <NavbarUserMenu v-if="authStore.isLoggedIn" />

        <div v-else class="flex items-center gap-3">
          <RouterLink to="/login" class="hidden rounded-full px-3 py-2 text-sm font-bold text-[#142b63] transition hover:bg-slate-50 sm:block">
            ເຂົ້າສູ່ລະບົບ
          </RouterLink>

          <RouterLink
            to="/register"
            class="rounded-full bg-[#142b63] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0e214d] hover:shadow-md"
          >
            ລົງທະບຽນ
          </RouterLink>
        </div>
      </div>
    </div>
  </header>
</template>
