<script setup lang="ts">
import { ref } from 'vue'
import { login } from '../api/authApi'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import logoUrl from '../assets/images/logolearndee.png'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const demoAccounts = [
  {
    role: 'student',
    label: 'ນັກຮຽນ',
    email: 'student@learnlao.com',
    password: '123456',
    note: 'ນັກຮຽນ → ເບິ່ງຄອສ, ຕິດຕາມຄວາມຄືບໜ້າ',
  },
  {
    role: 'teacher',
    label: 'ຜູ້ສອນ',
    email: 'teacher@learnlao.com',
    password: '123456',
    note: 'ຜູ້ສອນ → ສ້າງຄອສ, ຈັດການບົດຮຽນ',
  },
  {
    role: 'admin',
    label: 'ແອດມິນ',
    email: 'admin@gmail.com',
    password: '123456',
    note: 'ແອດມິນ → ກວດການຊຳລະເງິນ ແລະ ອະນຸມັດຜູ້ໃຊ້',
  },
]

const selectedDemoRole = ref(demoAccounts[0]?.role || 'student')
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

const handleLogin = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const data = await login({
      email: email.value,
      password: password.value,
    })

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
  <main class="min-h-screen bg-white lg:grid lg:grid-cols-[52%_48%]">
    <section class="flex min-h-screen items-center justify-center px-6 py-8 sm:px-10 lg:px-12">
      <div class="w-full max-w-[560px]">
        <RouterLink to="/" class="mb-9 flex items-center gap-3">
          <img :src="logoUrl" alt="LearnDee" class="h-9 w-auto" />

          <span class="text-xl font-bold tracking-wide">
            <span class="text-[#142b63]">LearnDee</span>
          </span>
        </RouterLink>

        <h1 class="text-3xl font-bold leading-tight text-slate-950">ຍິນດີຕ້ອນຮັບກັບຄືນ</h1>
        <p class="mt-2 text-sm leading-6 text-slate-500">ເຂົ້າສູ່ລະບົບເພື່ອສືບຕໍ່ການຮຽນ</p>

        <form class="mt-8 space-y-4" @submit.prevent="handleLogin">
          <p v-if="errorMessage" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {{ errorMessage }}
          </p>

          <div class="rounded-xl border border-[#f5a400]/35 bg-[#fffaf0] p-3.5">
            <div class="grid rounded-xl bg-slate-200/70 p-1 sm:grid-cols-3">
              <button
                v-for="account in demoAccounts"
                :key="account.role"
                type="button"
                class="h-9 rounded-lg px-3 text-sm font-semibold transition"
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

            <div class="mt-3">
              <p class="text-xs font-semibold text-slate-500">🎯 ບັນຊີທົດລອງ:</p>
              <p class="mt-1 text-sm font-semibold leading-6 text-[#e99a00]">
                {{ demoAccounts.find((account) => account.role === selectedDemoRole)?.note }}
              </p>

              <button
                type="button"
                class="mt-3 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-[#142b63] transition hover:border-[#142b63]"
                @click="fillDemoAccount(selectedDemoRole)"
              >
                ໃສ່ຂໍ້ມູນທົດລອງ
              </button>
            </div>
          </div>

          <label class="block">
            <span class="text-sm font-semibold text-slate-900">ອີເມວ</span>
            <input
              v-model="email"
              type="email"
              placeholder="student@example.com"
              class="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-blue-50/60 px-4 text-sm text-slate-900 outline-none transition focus:border-[#172f63] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label class="block">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-slate-900">ລະຫັດຜ່ານ</span>
              <RouterLink to="/register" class="text-xs font-semibold text-[#f5a400] hover:underline">
                ລືມລະຫັດຜ່ານ?
              </RouterLink>
            </div>

            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-blue-50/60 px-4 text-sm text-slate-900 outline-none transition focus:border-[#172f63] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <button
            type="submit"
            :disabled="isLoading"
            class="h-12 w-full rounded-xl bg-[#172f63] text-sm font-bold text-white transition hover:bg-[#0f244f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ isLoading ? 'ກຳລັງເຂົ້າສູ່ລະບົບ...' : 'ເຂົ້າສູ່ລະບົບ' }}
          </button>

          <p class="pt-4 text-center text-sm text-slate-500">
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
      <div class="max-w-[520px] px-8 text-center text-white">
        <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-white/18 p-6">
          <img :src="logoUrl" alt="LearnDee" class="h-full w-full object-contain" />
        </div>

        <h2 class="mt-7 text-3xl font-bold leading-tight">ຮຽນໄດ້ທຸກຢ່າງ ທຸກທີ່</h2>

        <p class="mt-4 text-base leading-8 text-white/75">
          ເຂົ້າເຖິງ 350+ ຄອສຮຽນຄຸນນະພາບສູງ ຈາກຜູ້ຮູ້ຈິງ ພ້ອມໃບຢັ້ງຢືນ
        </p>

        <div class="mx-auto mt-10 grid max-w-md grid-cols-3 gap-5">
          <div>
            <p class="font-number text-3xl font-black text-[#f5a400]">12,500+</p>
            <p class="mt-1 text-xs text-white/68">ນັກຮຽນ</p>
          </div>

          <div>
            <p class="font-number text-3xl font-black text-[#f5a400]">350+</p>
            <p class="mt-1 text-xs text-white/68">ຄອສ</p>
          </div>

          <div>
            <p class="font-number text-3xl font-black text-[#f5a400]">98%</p>
            <p class="mt-1 text-xs text-white/68">ພໍໃຈ</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
