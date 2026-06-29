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
    class="fixed inset-x-0 top-0 z-50 border-b transition-all duration-300"
    :class="
      isScrolled
        ? 'border-border/30 bg-card/62 shadow-[0_16px_44px_rgba(15,31,77,0.08)] dark:shadow-[0_16px_44px_rgba(0,0,0,0.3)] backdrop-blur-2xl'
        : 'border-border/70 bg-card/95 shadow-[0_1px_0_rgba(15,31,77,0.03)] dark:shadow-[0_1px_0_rgba(0,0,0,0.2)] backdrop-blur-xl'
    "
  >
    <div
      class="mx-auto grid h-[64px] max-w-[1680px] grid-cols-[1fr_auto_1fr] items-center px-6 sm:px-8 lg:px-16 2xl:px-20"
    >
      <RouterLink to="/" class="interactive-motion flex items-center gap-3 justify-self-start rounded-2xl">
        <img :src="logoUrl" alt="LearnLao" class="h-9 w-auto" />

        <p class="text-[1.34rem] font-bold leading-6 tracking-wide text-[#0f1f4d] dark:text-white">
          LearnLao
        </p>
      </RouterLink>

      <nav class="hidden items-center gap-12 text-[0.95rem] font-medium text-muted-foreground md:flex">
        <RouterLink
          to="/"
          class="app-nav-link interactive-motion relative px-1 py-2 hover:text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:rounded-full after:bg-[#f5a400] after:opacity-0 after:transition"
        >
          ໜ້າຫຼັກ
        </RouterLink>
        <RouterLink
          to="/courses"
          class="app-nav-link interactive-motion relative px-1 py-2 hover:text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:rounded-full after:bg-[#f5a400] after:opacity-0 after:transition"
        >
          ຄອສຮຽນ
        </RouterLink>
        <RouterLink
          v-if="authStore.isLoggedIn"
          to="/dashboard"
          class="app-nav-link interactive-motion relative px-1 py-2 hover:text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:rounded-full after:bg-[#f5a400] after:opacity-0 after:transition"
        >
          Dashboard
        </RouterLink>
        <RouterLink
          v-if="authStore.user?.role === 'instructor' || authStore.user?.role === 'admin'"
          to="/courses/create"
          class="app-nav-link interactive-motion relative px-1 py-2 hover:text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:rounded-full after:bg-[#f5a400] after:opacity-0 after:transition"
        >
          ສ້າງຄອສ
        </RouterLink>
      </nav>

      <div class="justify-self-end flex items-center gap-4">
        <NavbarUserMenu v-if="authStore.isLoggedIn" />

        <div v-else class="flex items-center gap-3">
          <RouterLink
            to="/login"
            class="interactive-motion hidden rounded-full px-3 py-2 text-sm font-medium text-foreground hover:text-primary sm:block"
          >
            ເຂົ້າສູ່ລະບົບ
          </RouterLink>

          <RouterLink
            to="/register"
            class="interactive-motion rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(41,74,120,0.14)] hover:bg-primary/95 hover:shadow-[0_12px_26px_rgba(41,74,120,0.2)]"
          >
            ລົງທະບຽນ
          </RouterLink>
        </div>
      </div>
    </div>
  </header>
  <div aria-hidden="true" class="h-[64px]"></div>
</template>
