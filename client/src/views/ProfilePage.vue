<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { resolveAssetUrl } from '../api/config'
import { getMe, updateMyProfile, uploadMyAvatar } from '../api/userApi'
import { useAuthStore } from '../stores/authStore'
import type { AppUser } from '../types/user'

const authStore = useAuthStore()

const user = ref<AppUser | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const isUploadingAvatar = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const localAvatarPreview = ref('')

const form = ref({
  first_name: '',
  last_name: '',
  phone: '',
  bio: '',
  avatar_url: '',
})

const displayName = computed(() => {
  const fullName = [form.value.first_name, form.value.last_name].filter(Boolean).join(' ')
  return fullName || user.value?.email?.split('@')[0] || 'Profile'
})

const avatarPreview = computed(() => {
  return localAvatarPreview.value || form.value.avatar_url
})

const resolveFileUrl = (url: string) => {
  return resolveAssetUrl(url)
}

const syncAuthUserProfile = (updatedUser: AppUser) => {
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

const fillForm = (currentUser: AppUser) => {
  form.value = {
    first_name: currentUser.profile?.first_name || '',
    last_name: currentUser.profile?.last_name || '',
    phone: currentUser.profile?.phone || '',
    bio: currentUser.profile?.bio || '',
    avatar_url: currentUser.profile?.avatar_url || '',
  }
}

const loadProfile = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const currentUser = await getMe()
    user.value = currentUser
    fillForm(currentUser)
    syncAuthUserProfile(currentUser)
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ໂຫຼດຂໍ້ມູນໂປຣໄຟລ໌ບໍ່ສຳເລັດ'
  } finally {
    isLoading.value = false
  }
}

const handleSaveProfile = async () => {
  try {
    isSaving.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const updated = await updateMyProfile({
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      phone: form.value.phone,
      bio: form.value.bio,
      avatar_url: form.value.avatar_url,
    })

    user.value = updated
    fillForm(updated)
    syncAuthUserProfile(updated)
    successMessage.value = 'ບັນທຶກໂປຣໄຟລ໌ສຳເລັດ'
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ບັນທຶກໂປຣໄຟລ໌ບໍ່ສຳເລັດ'
  } finally {
    isSaving.value = false
  }
}

const handleAvatarFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'ກະລຸນາເລືອກໄຟລ໌ຮູບເທົ່ານັ້ນ'
    input.value = ''
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    errorMessage.value = 'ຮູບໂປຣໄຟລ໌ຕ້ອງບໍ່ເກີນ 2MB'
    input.value = ''
    return
  }

  try {
    isUploadingAvatar.value = true
    errorMessage.value = ''
    successMessage.value = ''
    localAvatarPreview.value = URL.createObjectURL(file)

    const uploaded = await uploadMyAvatar(file)
    form.value.avatar_url = uploaded.url
    successMessage.value = 'ອັບໂຫຼດຮູບສຳເລັດ ກົດບັນທຶກເພື່ອໃຊ້ຮູບນີ້'
  } catch (error) {
    console.log(error)

    if (axios.isAxiosError<{ message: string }>(error)) {
      errorMessage.value = error.response?.data?.message || 'ອັບໂຫຼດຮູບບໍ່ສຳເລັດ'
      return
    }

    errorMessage.value = 'ອັບໂຫຼດຮູບບໍ່ສຳເລັດ'
  } finally {
    isUploadingAvatar.value = false
    input.value = ''
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <main class="min-h-screen bg-[#f7f8fb]">
    <section class="mx-auto max-w-[1100px] px-6 py-8 lg:px-12">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <RouterLink to="/dashboard" class="text-sm font-bold text-slate-500 hover:text-[#142b63]">
            ← ກັບຄືນແດຊບອດ
          </RouterLink>
          <h1 class="mt-4 text-3xl font-black text-[#0f1f4d]">ໂປຣໄຟລ໌ຂອງຂ້ອຍ</h1>
          <p class="mt-2 text-sm font-medium text-slate-500">
            ຈັດການຂໍ້ມູນສ່ວນຕົວທີ່ໃຊ້ສະແດງໃນລະບົບ
          </p>
        </div>

        <RouterLink
          to="/instructor-request"
          class="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#142b63] shadow-sm transition hover:border-[#142b63]"
        >
          ຂໍເປັນຜູ້ສອນ
        </RouterLink>
      </div>

      <p v-if="isLoading" class="mt-6 rounded-2xl bg-white px-5 py-4 text-sm font-bold text-slate-500">
        ກຳລັງໂຫຼດໂປຣໄຟລ໌...
      </p>
      <p v-if="errorMessage" class="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
        {{ errorMessage }}
      </p>
      <p v-if="successMessage" class="mt-6 rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
        {{ successMessage }}
      </p>

      <section v-if="!isLoading" class="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <form class="card-soft p-6" @submit.prevent="handleSaveProfile">
          <div class="grid gap-5 md:grid-cols-2">
            <label>
              <span class="text-sm font-black text-[#0f1f4d]">ຊື່</span>
              <input
                v-model="form.first_name"
                type="text"
                class="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#142b63]"
              />
            </label>

            <label>
              <span class="text-sm font-black text-[#0f1f4d]">ນາມສະກຸນ</span>
              <input
                v-model="form.last_name"
                type="text"
                class="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#142b63]"
              />
            </label>

            <label class="md:col-span-2">
              <span class="text-sm font-black text-[#0f1f4d]">ເບີໂທ</span>
              <input
                v-model="form.phone"
                type="text"
                class="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#142b63]"
              />
            </label>

            <label class="md:col-span-2">
              <span class="text-sm font-black text-[#0f1f4d]">Bio</span>
              <textarea
                v-model="form.bio"
                rows="5"
                class="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#142b63]"
                placeholder="ຂຽນແນະນຳຕົວສັ້ນໆ..."
              ></textarea>
            </label>
          </div>

          <button
            type="submit"
            :disabled="isSaving"
            class="mt-6 rounded-2xl bg-[#142b63] px-6 py-3 text-sm font-black text-white transition hover:bg-[#0e214d] disabled:bg-slate-400"
          >
            {{ isSaving ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກໂປຣໄຟລ໌' }}
          </button>
        </form>

        <aside class="card-soft p-6">
          <h2 class="text-lg font-black text-[#0f1f4d]">Preview</h2>
          <div class="mt-5 rounded-2xl bg-slate-50 p-5 text-center">
            <img
              v-if="avatarPreview"
              :src="resolveFileUrl(avatarPreview)"
              alt="Avatar preview"
              class="mx-auto h-24 w-24 rounded-full object-cover"
            />
            <div v-else class="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[#142b63] text-2xl font-black text-white">
              {{ displayName.slice(0, 2).toUpperCase() }}
            </div>
            <p class="mt-4 font-black text-[#0f1f4d]">{{ displayName }}</p>
            <p class="mt-1 text-sm font-bold text-slate-500">{{ user?.role }}</p>
          </div>

          <label
            class="mt-5 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-black text-[#142b63] transition hover:border-[#142b63] hover:bg-slate-50"
          >
            {{ isUploadingAvatar ? 'ກຳລັງອັບໂຫຼດ...' : 'ອັບໂຫຼດຮູບໂປຣໄຟລ໌' }}
            <input type="file" accept="image/*" class="hidden" @change="handleAvatarFileChange" />
          </label>
          <p class="mt-2 text-center text-xs font-medium text-slate-500">PNG, JPG, WebP ບໍ່ເກີນ 2MB</p>
        </aside>
      </section>
    </section>
  </main>
</template>
