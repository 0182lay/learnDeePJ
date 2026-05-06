<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/authApi'
import logoUrl from '../assets/images/logo.svg'
const router = useRouter()

// Step 1: Form state - ເກັບຄ່າທີ user ກອກຟອມ
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const firstName = ref('')
const lastName = ref('')

// Step 2: UI state - ເກັບສະຖານະຂອງຫນ້າ ເຊັ່ນ loading ແລະ error
const errorMessage = ref('')
const isLoading = ref(false)

// Step 3: Validate confirm password ກ່ອນຍິງ API
const validatePassword = () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'ລະຫັດຜ່ານບໍ່ກົງກັນ'
    return false
  }

  return true
}

// Step 4: Submit register - ຖ້າ validation ຜ່ານຄ່ອຍສົ່ງຂໍ່ມູນໄປ backend
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

    // Step 5: Register ສຳເລັດແລ້ວພາໄປ login
    router.push('/login')
  } catch (error: unknown) {
    console.log(error)
    // Step 6: Handle API error - เช่น email ซ้ำ backend จะตอบ 409
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
  <main class="min-h-screen bg-white lg:grid lg:grid-cols-2">
    <section
      class="hidden bg-gradient-to-br from-[#172f63] to-[#34799a] lg:flex lg:items-center lg:justify-center"
    >
      <div class="max-w-md px-8 text-center text-white">
        <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white p-5">
          <img :src="logoUrl" alt="LearnDee" class="h-full w-full object-contain" />
        </div>

        <h2 class="mt-8 text-4xl font-bold">ເລີ່ມຕົ້ນການເດີນທາງ</h2>

        <p class="mt-5 text-lg leading-8 text-white/75">
          ລົງທະບຽນ ແລະ ເລີ່ມຮຽນຮູ້ທັກສະໃໝ່ໆ ກັບ LearnDeepJ
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

    <section class="flex min-h-screen items-center justify-center px-6 py-10">
      <div class="w-full max-w-xl">
        <RouterLink to="/" class="mb-10 flex items-center gap-3">
          <img :src="logoUrl" alt="LearnDee" class="h-10 w-auto" />
          <span class="text-2xl font-bold">
            <span class="text-[#142b63]">Learn</span>
            <span class="text-[#f5a400]">Dee</span>
          </span>
        </RouterLink>

        <h1 class="text-4xl font-bold text-slate-950">ລົງທະບຽນໃໝ່</h1>

        <p class="mt-3 text-slate-500">ລົງທະບຽນເພື່ອເລີ່ມຮຽນຮູ້</p>

        <form class="mt-8 space-y-5" @submit.prevent="handleRegister">
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="text-sm font-medium text-slate-900">ຊື່</span>
              <input
                v-model="firstName"
                type="text"
                placeholder="ຊື່"
                class="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-[#172f63] focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label class="block">
              <span class="text-sm font-medium text-slate-900">ນາມສະກຸນ</span>
              <input
                v-model="lastName"
                type="text"
                placeholder="ນາມສະກຸນ"
                class="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-[#172f63] focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>

          <label class="block">
            <span class="text-sm font-medium text-slate-900">ອີເມວ</span>
            <input
              v-model="email"
              type="email"
              placeholder="name@example.com"
              class="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-[#172f63] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-900">ລະຫັດຜ່ານ</span>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-[#172f63] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label class="block">
            <span class="text-sm font-medium text-slate-900">ຢືນຢັນລະຫັດຜ່ານ</span>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="••••••••"
              class="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-[#172f63] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <p v-if="errorMessage" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            :disabled="isLoading"
            class="h-12 w-full rounded-xl bg-[#172f63] font-semibold text-white transition hover:bg-[#0f244f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ isLoading ? 'ກຳລັງສ້າງບັນຊີ...' : 'ສ້າງບັນຊີ' }}
          </button>

          <p class="text-center text-sm text-slate-500">
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
