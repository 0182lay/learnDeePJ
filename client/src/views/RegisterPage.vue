<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/authApi'
import logoUrl from '../assets/images/logolearndee.png'

const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const firstName = ref('')
const lastName = ref('')

const errorMessage = ref('')
const isLoading = ref(false)

const validatePassword = () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'ລະຫັດຜ່ານບໍ່ກົງກັນ'
    return false
  }

  return true
}

const handleRegister = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    if (!validatePassword()) {
      return
    }

    await register({
      email: email.value,
      password: password.value,
      first_name: firstName.value,
      last_name: lastName.value,
    })

    router.push('/login')
  } catch (error: unknown) {
    console.log(error)

    if (axios.isAxiosError<{ message: string }>(error)) {
      const message = error.response?.data?.message

      if (message === 'EMAIL_ALREADY_EXISTS') {
        errorMessage.value = 'ອີເມວນີ້ມີຢູ່ໃນລະບົບແລ້ວ'
        return
      }

      errorMessage.value = message || 'ສ້າງບັນຊີບໍ່ສຳເລັດ'
      return
    }

    errorMessage.value = 'ສ້າງບັນຊີບໍ່ສຳເລັດ'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-white lg:grid lg:grid-cols-[48%_52%]">
    <section
      class="hidden bg-gradient-to-br from-[#172f63] to-[#34799a] lg:flex lg:items-center lg:justify-center"
    >
      <div class="max-w-[520px] px-8 text-center text-white">
        <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-white/18 p-6">
          <img :src="logoUrl" alt="LearnDee" class="h-full w-full object-contain" />
        </div>

        <h2 class="mt-7 text-3xl font-bold leading-tight">ເລີ່ມຕົ້ນການເດີນທາງ</h2>

        <p class="mt-4 text-base leading-8 text-white/75">
          ລົງທະບຽນ ແລະ ເລີ່ມຮຽນຮູ້ທັກສະໃໝ່ໆ ກັບ LearnDee
        </p>

        <div class="mx-auto mt-10 grid max-w-md grid-cols-3 gap-5">
          <div>
            <p class="font-number text-3xl font-black text-[#f5a400]">350+</p>
            <p class="mt-1 text-xs text-white/68">ຄອສ</p>
          </div>

          <div>
            <p class="font-number text-3xl font-black text-[#f5a400]">120+</p>
            <p class="mt-1 text-xs text-white/68">ຜູ້ສອນ</p>
          </div>

          <div>
            <p class="font-number text-3xl font-black text-[#f5a400]">98%</p>
            <p class="mt-1 text-xs text-white/68">ພໍໃຈ</p>
          </div>
        </div>
      </div>
    </section>

    <section class="flex min-h-screen items-center justify-center px-6 py-8 sm:px-10 lg:px-14">
      <div class="w-full max-w-[560px]">
        <RouterLink to="/" class="mb-9 flex items-center gap-3">
          <img :src="logoUrl" alt="LearnDee" class="h-9 w-auto" />

          <span class="text-xl font-bold tracking-wide">
            <span class="text-[#142b63]">LearnDee</span>
          </span>
        </RouterLink>

        <h1 class="text-3xl font-bold leading-tight text-slate-950">ລົງທະບຽນໃໝ່</h1>
        <p class="mt-2 text-sm leading-6 text-slate-500">ລົງທະບຽນເພື່ອເລີ່ມຮຽນຮູ້</p>

        <form class="mt-8 space-y-4" @submit.prevent="handleRegister">
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="text-sm font-semibold text-slate-900">ຊື່</span>
              <input
                v-model="firstName"
                type="text"
                placeholder="ຊື່"
                class="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-blue-50/60 px-4 text-sm text-slate-900 outline-none transition focus:border-[#172f63] focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label class="block">
              <span class="text-sm font-semibold text-slate-900">ນາມສະກຸນ</span>
              <input
                v-model="lastName"
                type="text"
                placeholder="ນາມສະກຸນ"
                class="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-blue-50/60 px-4 text-sm text-slate-900 outline-none transition focus:border-[#172f63] focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>

          <label class="block">
            <span class="text-sm font-semibold text-slate-900">ອີເມວ</span>
            <input
              v-model="email"
              type="email"
              placeholder="name@example.com"
              class="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-blue-50/60 px-4 text-sm text-slate-900 outline-none transition focus:border-[#172f63] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label class="block">
            <span class="text-sm font-semibold text-slate-900">ລະຫັດຜ່ານ</span>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-blue-50/60 px-4 text-sm text-slate-900 outline-none transition focus:border-[#172f63] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label class="block">
            <span class="text-sm font-semibold text-slate-900">ຢືນຢັນລະຫັດຜ່ານ</span>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="••••••••"
              class="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-blue-50/60 px-4 text-sm text-slate-900 outline-none transition focus:border-[#172f63] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <p v-if="errorMessage" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            :disabled="isLoading"
            class="h-12 w-full rounded-xl bg-[#172f63] text-sm font-bold text-white transition hover:bg-[#0f244f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ isLoading ? 'ກຳລັງສ້າງບັນຊີ...' : 'ສ້າງບັນຊີ' }}
          </button>

          <p class="pt-4 text-center text-sm text-slate-500">
            ມີບັນຊີແລ້ວ?
            <RouterLink to="/login" class="font-semibold text-[#f5a400] hover:underline">
              ເຂົ້າສູ່ລະບົບ
            </RouterLink>
          </p>
        </form>
      </div>
    </section>
  </main>
</template>
