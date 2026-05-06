<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { getMe, requestInstructor } from '../api/userApi'
import { useAuthStore } from '../stores/authStore'
import type { AppUser } from '../types/user'

const authStore = useAuthStore()

const user = ref<AppUser | null>(null)
const isLoading = ref(false)
const isRequesting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const instructorStatus = computed(() => {
  if (!user.value) return 'loading'
  if (user.value.role === 'instructor' && user.value.is_active) return 'approved'
  if (user.value.role === 'instructor' && !user.value.is_active) return 'pending'
  if (user.value.role === 'admin') return 'admin'
  return 'student'
})

const syncAuthUser = (updatedUser: AppUser) => {
  if (!authStore.user) return

  const authRole =
    updatedUser.role === 'instructor' && !updatedUser.is_active ? 'student' : updatedUser.role

  authStore.setUser({
    ...authStore.user,
    email: updatedUser.email,
    role: authRole,
    is_active: updatedUser.is_active,
    profile: updatedUser.profile,
  })
}

const loadUser = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const currentUser = await getMe()
    user.value = currentUser
    syncAuthUser(currentUser)
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ໂຫຼດສະຖານະຄຳຂໍບໍ່ສຳເລັດ'
  } finally {
    isLoading.value = false
  }
}

const handleRequestInstructor = async () => {
  try {
    isRequesting.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const updated = await requestInstructor()
    user.value = updated
    syncAuthUser(updated)
    successMessage.value = 'ສົ່ງຄຳຂໍເປັນຜູ້ສອນແລ້ວ ລໍຖ້າ admin ອະນຸມັດ'
  } catch (error) {
    console.log(error)

    if (axios.isAxiosError<{ message: string }>(error)) {
      if (error.response?.data?.message === 'ALREADY_INSTRUCTOR') {
        errorMessage.value = 'ບັນຊີນີ້ເປັນຜູ້ສອນແລ້ວ'
        return
      }
    }

    errorMessage.value = 'ສົ່ງຄຳຂໍເປັນຜູ້ສອນບໍ່ສຳເລັດ'
  } finally {
    isRequesting.value = false
  }
}

onMounted(() => {
  loadUser()
})
</script>

<template>
  <main class="min-h-screen bg-[#f7f8fb]">
    <section class="mx-auto max-w-[900px] px-6 py-8 lg:px-12">
      <RouterLink to="/profile" class="text-sm font-bold text-slate-500 hover:text-[#142b63]">
        ← ກັບຄືນໂປຣໄຟລ໌
      </RouterLink>

      <section class="card-soft mt-6 p-7">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 class="text-3xl font-black text-[#0f1f4d]">ຂໍເປັນຜູ້ສອນ</h1>
            <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              ສົ່ງຄຳຂໍໃຫ້ admin ກວດສອບ. ຫຼັງຈາກອະນຸມັດແລ້ວ ເຈົ້າຈະເຫັນເມນູສ້າງຄອສ ແລະ dashboard ຂອງຜູ້ສອນ.
            </p>
          </div>

          <span
            class="shrink-0 rounded-full px-4 py-2 text-sm font-black"
            :class="
              instructorStatus === 'approved'
                ? 'bg-emerald-50 text-emerald-700'
                : instructorStatus === 'pending'
                  ? 'bg-[#f5a400]/10 text-[#9a6500]'
                  : 'bg-slate-100 text-slate-600'
            "
          >
            {{
              instructorStatus === 'approved'
                ? 'ອະນຸມັດແລ້ວ'
                : instructorStatus === 'pending'
                  ? 'ລໍຖ້າອະນຸມັດ'
                  : instructorStatus === 'admin'
                    ? 'Admin'
                    : 'ຍັງບໍ່ໄດ້ຂໍ'
            }}
          </span>
        </div>

        <p v-if="isLoading" class="mt-6 rounded-2xl bg-slate-50 px-5 py-4 text-sm font-bold text-slate-500">
          Loading request status...
        </p>
        <p v-if="errorMessage" class="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
          {{ errorMessage }}
        </p>
        <p v-if="successMessage" class="mt-6 rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
          {{ successMessage }}
        </p>

        <div class="mt-6 rounded-2xl border border-[#f5a400]/30 bg-[#f5a400]/5 p-5">
          <h2 class="font-black text-[#0f1f4d]">ຫຼັງຈາກກົດຂໍ</h2>
          <ul class="mt-3 space-y-2 text-sm leading-7 text-slate-600">
            <li>• ຄຳຂໍຈະໄປຢູ່ໜ້າ Admin Dashboard</li>
            <li>• ກ່ອນ admin ອະນຸມັດ ເຈົ້າຍັງໃຊ້ງານແບບ student</li>
            <li>• ຫຼັງອະນຸມັດ ໃຫ້ login ໃໝ່ເພື່ອໂຫຼດ role ໃໝ່</li>
          </ul>
        </div>

        <button
          v-if="instructorStatus === 'student'"
          type="button"
          :disabled="isRequesting"
          class="mt-6 rounded-2xl bg-[#142b63] px-6 py-3 text-sm font-black text-white transition hover:bg-[#0e214d] disabled:bg-slate-400"
          @click="handleRequestInstructor"
        >
          {{ isRequesting ? 'ກຳລັງສົ່ງຄຳຂໍ...' : 'ສົ່ງຄຳຂໍເປັນຜູ້ສອນ' }}
        </button>
      </section>
    </section>
  </main>
</template>
