<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import logoUrl from '../assets/images/logolearndee.png'
import NavbarUserMenu from './NavbarUserMenu.vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 24
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b transition-all duration-300"
    :class="
      isScrolled
        ? 'border-white/35 bg-white/62 shadow-[0_16px_44px_rgba(15,31,77,0.10)] backdrop-blur-2xl'
        : 'border-slate-200/80 bg-white/95 shadow-[0_1px_0_rgba(15,31,77,0.04)] backdrop-blur-xl'
    "
  >
    <div
      class="mx-auto grid h-[64px] max-w-[1680px] grid-cols-[1fr_auto_1fr] items-center px-6 sm:px-8 lg:px-16 2xl:px-20"
    >
      <RouterLink to="/" class="interactive-motion flex items-center gap-3 justify-self-start rounded-2xl">
        <img :src="logoUrl" alt="LearnDee" class="h-9 w-auto" />

        <p class="text-[1.34rem] font-bold leading-6 tracking-wide">
          <span class="text-[#294a78]">Learn</span>
          <span class="text-[#f5a400]">Dee</span>
        </p>
      </RouterLink>

      <nav class="hidden items-center gap-12 text-[0.95rem] font-medium text-slate-400 md:flex">
        <RouterLink
          to="/"
          class="app-nav-link interactive-motion relative px-1 py-2 hover:text-[#294a78] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:rounded-full after:bg-[#f5a400] after:opacity-0 after:transition"
        >
          ໜ້າຫຼັກ
        </RouterLink>
        <RouterLink
          to="/courses"
          class="app-nav-link interactive-motion relative px-1 py-2 hover:text-[#294a78] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:rounded-full after:bg-[#f5a400] after:opacity-0 after:transition"
        >
          ຄອສຮຽນ
        </RouterLink>
        <RouterLink
          v-if="authStore.isLoggedIn"
          to="/dashboard"
          class="app-nav-link interactive-motion relative px-1 py-2 hover:text-[#294a78] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:rounded-full after:bg-[#f5a400] after:opacity-0 after:transition"
        >
          ແດຊບອດ
        </RouterLink>
        <RouterLink
          v-if="authStore.user?.role === 'instructor' || authStore.user?.role === 'admin'"
          to="/courses/create"
          class="app-nav-link interactive-motion relative px-1 py-2 hover:text-[#294a78] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:rounded-full after:bg-[#f5a400] after:opacity-0 after:transition"
        >
          ສ້າງຄອສ
        </RouterLink>
      </nav>

      <div class="justify-self-end">
        <NavbarUserMenu v-if="authStore.isLoggedIn" />

        <div v-else class="flex items-center gap-3">
          <RouterLink
            to="/login"
            class="interactive-motion hidden rounded-full px-3 py-2 text-sm font-medium text-slate-950 hover:text-[#294a78] sm:block"
          >
            ເຂົ້າສູ່ລະບົບ
          </RouterLink>

          <RouterLink
            to="/register"
            class="interactive-motion rounded-xl bg-[#294a78] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(41,74,120,0.14)] hover:bg-[#213d66] hover:shadow-[0_12px_26px_rgba(41,74,120,0.2)]"
          >
            ລົງທະບຽນ
          </RouterLink>
        </div>
      </div>
    </div>
  </header>
</template>
