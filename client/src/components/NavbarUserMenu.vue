<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const isOpen = ref(false)

const displayName = computed(() => {
  const profile = authStore.user?.profile
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')

  if (fullName) {
    return fullName
  }

  const email = authStore.user?.email

  if (!email) {
    return 'Profile'
  }

  return email.split('@')[0] || email
})

const initials = computed(() => {
  return displayName.value.slice(0, 2).toUpperCase()
})

const avatarUrl = computed(() => authStore.user?.profile?.avatar_url || '')

const resolveFileUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `http://localhost:3003${url.startsWith('/') ? url : `/${url}`}`
}

const handleLogout = () => {
  isOpen.value = false
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-[#142b63]/30 hover:shadow-md"
      @click="isOpen = !isOpen"
    >
      <img
        v-if="avatarUrl"
        :src="resolveFileUrl(avatarUrl)"
        :alt="displayName"
        class="h-8 w-8 rounded-full object-cover"
      />
      <span v-else class="grid h-8 w-8 place-items-center rounded-full bg-[#142b63] text-[10px] font-black text-white">
        {{ initials }}
      </span>

      <span class="hidden max-w-[140px] truncate text-sm font-bold text-slate-700 sm:block">
        {{ displayName }}
      </span>

      <span class="hidden rounded-full bg-[#f5a400]/15 px-2.5 py-1 text-[10px] font-bold text-[#b87900] sm:block">
        {{ authStore.user?.role || 'student' }}
      </span>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 top-10 w-full min-w-[210px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,31,77,0.14)]"
    >
      <RouterLink
        to="/profile"
        class="flex items-center gap-3 border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
        @click="isOpen = false"
      >
        <span class="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-xs text-[#142b63]">♟</span>
        <span>ໂປຣໄຟລ໌</span>
      </RouterLink>

      <RouterLink
        to="/instructor-request"
        class="flex items-center gap-3 border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
        @click="isOpen = false"
      >
        <span class="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-xs text-[#142b63]">♙</span>
        <span>ຂໍເປັນຜູ້ສອນ</span>
      </RouterLink>

      <button
        type="button"
        class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-black text-red-500 transition hover:bg-red-50"
        @click="handleLogout"
      >
        <span class="grid h-6 w-6 place-items-center rounded-full bg-red-50 text-xs text-red-500">↪</span>
        <span>ອອກຈາກລະບົບ</span>
      </button>
    </div>
  </div>
</template>
