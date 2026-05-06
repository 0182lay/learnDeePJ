<script setup lang="ts">
import { ref } from 'vue'
import { login } from '../api/authApi'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import logoUrl from '../assets/images/logo.svg'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Step 1: Form state - เก็บค่าที่ผู้ใช้กรอก
const email = ref('')
const password = ref('')

const demoAccounts = [
  {
    role: 'student',
    label: 'ນັກຮຽນ',
    email: 'student@learnlao.com',
    password: '123456',
    note: 'ນັກຮຽນ → ເບິ່ງຄອສ, ຕິດຕາມການຮຽນ',
  },
  {
    role: 'teacher',
    label: 'ຜູ້ສອນ',
    email: 'teacher@learnlao.com',
    password: '123456',
    note: 'ຜູ້ສອນ → ສ້າງຄອສ, ແກ້ໄຂບົດຮຽນ',
  },
  {
    role: 'admin',
    label: 'Admin',
    email: 'admin@gmail.com',
    password: '123456',
    note: 'Admin → dashboard, payment, user approval',
  },
]

const selectedDemoRole = ref(demoAccounts[0]?.role || 'student')

// Step 2: UI state - ใช้แสดง loading และ error
const isLoading = ref(false)
const errorMessage = ref('')

const fillDemoAccount = (role: string) => {
  const account = demoAccounts.find((item) => item.role === role)

  if (!account) return

  selectedDemoRole.value = account.role
  email.value = account.email
  password.value = account.password
  errorMessage.value = ''
}

// Step 3: Submit login - ส่ง email/password ไป backend
const handleLogin = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const data = await login({
      email: email.value,
      password: password.value,
    })

    // Step 4: Login สำเร็จ เก็บ token/user แล้วไปหน้า courses
    authStore.setAuth(data.Token, data.User)
    const redirectPath = route.query.redirect as string | undefined
    router.push(redirectPath || '/courses')
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-white lg:grid lg:grid-cols-2">
    <section class="flex min-h-screen items-center justify-center px-6 py-10">
      <div class="w-full max-w-xl">
        <RouterLink to="/" class="mb-10 flex items-center gap-3">
          <img :src="logoUrl" alt="LearnDeepJ" class="h-10 w-auto" />

          <span class="text-2xl font-bold">
            <span class="text-[#142b63]">Learn</span>
            <span class="text-[#f5a400]">Dee</span>
          </span>
        </RouterLink>

        <h1 class="text-4xl font-bold text-slate-950">ຍິນດີຕ້ອນຮັບກັບຄືນ</h1>
        <p class="mt-3 text-slate-500">ເຂົ້າສູ່ລະບົບເພື່ອສືບຕໍ່ການຮຽນ</p>

        <form class="mt-10 space-y-5" @submit.prevent="handleLogin">
          <p v-if="errorMessage" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {{ errorMessage }}
          </p>

          <div class="rounded-2xl border border-[#f5a400]/35 bg-[#fffaf0] p-4">
            <div class="grid rounded-xl bg-slate-200/70 p-1 sm:grid-cols-3">
              <button
                v-for="account in demoAccounts"
                :key="account.role"
                type="button"
                class="rounded-lg px-4 py-2 text-sm font-black transition"
                :class="
                  selectedDemoRole === account.role
                    ? 'bg-white text-[#142b63] shadow-sm'
                    : 'text-slate-500 hover:text-[#142b63]'
                "
                @click="fillDemoAccount(account.role)"
              >
                {{ account.label }}
              </button>
            </div>

            <div class="mt-4">
              <p class="text-sm font-bold text-[#f5a400]">
                🎯 ບັນຊີທົດລອງ:
              </p>
              <p class="mt-1 text-sm font-bold text-[#f5a400]">
                {{ demoAccounts.find((account) => account.role === selectedDemoRole)?.note }}
              </p>

              <button
                type="button"
                class="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#142b63] transition hover:border-[#142b63]"
                @click="fillDemoAccount(selectedDemoRole)"
              >
                ໃສ່ຂໍ້ມູນທົດລອງ
              </button>
            </div>
          </div>

          <label class="block">
            <span class="text-sm font-medium text-slate-900">ອີເມວ</span>
            <input
              v-model="email"
              type="email"
              placeholder="student@example.com"
              class="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-[#172f63] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label class="block">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-slate-900">ລະຫັດຜ່ານ</span>
              <RouterLink to="/register" class="text-sm font-medium text-[#f5a400] hover:underline">
                ລືມລະຫັດຜ່ານ?
              </RouterLink>
            </div>

            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-[#172f63] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <button
            type="submit"
            :disabled="isLoading"
            class="h-12 w-full rounded-xl bg-[#172f63] font-semibold text-white transition hover:bg-[#0f244f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ isLoading ? 'ກຳລັງເຂົ້າສູ່ລະບົບ...' : 'ເຂົ້າສູ່ລະບົບ' }}
          </button>

          <p class="text-center text-sm text-slate-500">
            ຍັງບໍ່ມີບັນຊີ?
            <RouterLink to="/register" class="font-semibold text-[#f5a400] hover:underline">
              ສ້າງບັນຊີ
            </RouterLink>
          </p>
        </form>
      </div>
    </section>

    <section
      class="hidden bg-gradient-to-br from-[#172f63] to-[#34799a] lg:flex lg:items-center lg:justify-center"
    >
      <div class="max-w-lg px-8 text-center text-white">
        <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white p-6">
          <img :src="logoUrl" alt="LearnDeepJ" class="h-full w-full object-contain" />
        </div>

        <h2 class="mt-8 text-4xl font-bold">ຮຽນທຸກຢ່າງ ທຸກທີ່</h2>

        <p class="mt-5 text-lg leading-8 text-white/75">
          ເຂົ້າເຖິງຄອສຮຽນ ຕິດຕາມຄວາມຄືບໜ້າ ແລະ ສືບຕໍ່ການຮຽນຂອງທ່ານ
        </p>

        <div class="mt-12 grid grid-cols-3 gap-4">
          <div class="rounded-2xl bg-white/10 p-4">
            <div class="text-2xl">📚</div>
            <p class="mt-2 text-sm">350+ ຄອສ</p>
          </div>

          <div class="rounded-2xl bg-white/10 p-4">
            <div class="text-2xl">🧑‍🏫</div>
            <p class="mt-2 text-sm">120+ ຜູ້ສອນ</p>
          </div>

          <div class="rounded-2xl bg-white/10 p-4">
            <div class="text-2xl">🏆</div>
            <p class="mt-2 text-sm">ໃບຢັ້ງຢືນ</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
