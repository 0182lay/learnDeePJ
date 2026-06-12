<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  courseTitle: string
  price: string
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  close: []
  success: [slip: File]
}>()

const selectedSlip = ref<File | null>(null)
const previewUrl = ref('')
const localError = ref('')

const numericPrice = computed(() => {
  const amount = Number(String(props.price || 0).replace(/,/g, ''))
  return Number.isNaN(amount) ? 0 : amount
})

const paymentPayload = computed(() => {
  return JSON.stringify({
    merchant: 'LearnDeePJ',
    course: props.courseTitle,
    amount: numericPrice.value,
    currency: 'LAK',
  })
})

const qrCodeUrl = computed(() => {
  const size = 220
  const data = encodeURIComponent(paymentPayload.value)

  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=12&data=${data}`
})

const formatMoney = (amount: number) => {
  return `₭${amount.toLocaleString('en-US')}`
}

const resetForm = () => {
  selectedSlip.value = null
  localError.value = ''

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  previewUrl.value = ''
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  localError.value = ''

  if (!file) {
    resetForm()
    return
  }

  if (!file.type.startsWith('image/')) {
    localError.value = 'ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ'
    input.value = ''
    resetForm()
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    localError.value = 'ຂະໜາດສະລີບຕ້ອງບໍ່ເກີນ 5MB'
    input.value = ''
    resetForm()
    return
  }

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  selectedSlip.value = file
  previewUrl.value = URL.createObjectURL(file)
}

const handleSubmit = () => {
  if (!selectedSlip.value) {
    localError.value = 'ກະລຸນາແນບສະລີບກ່ອນສົ່ງ'
    return
  }

  emit('success', selectedSlip.value)
}

const handleClose = () => {
  if (props.isSubmitting) return
  emit('close')
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      resetForm()
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
      @click.self="handleClose"
    >
      <section class="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-[0_30px_90px_rgba(15,31,77,0.35)]">
        <div class="hero-gradient px-6 py-4 text-white">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-black uppercase tracking-wide text-[#f5a400]">
                ຊຳລະເງິນດ້ວຍສະລິບ
              </p>
              <h2 class="mt-1 text-2xl font-black">ອັບໂຫຼດສະລີບ</h2>
              <p class="mt-1 line-clamp-1 text-sm text-white/70">{{ courseTitle }}</p>
            </div>

            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-lg font-black text-white transition hover:bg-white/20"
              :disabled="isSubmitting"
              @click="handleClose"
            >
              x
            </button>
          </div>
        </div>

        <div class="space-y-4 p-5">
          <div class="rounded-2xl bg-slate-50 p-4">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-black text-[#0f1f4d]">ຈຳນວນທີ່ຕ້ອງຊຳລະ</p>
                <p class="mt-1 text-xs font-bold text-slate-500">
                  ໂອນເງິນແລ້ວແນບສະລີບໃຫ້ແອດມິນກວດ
                </p>
              </div>
              <p class="font-number text-2xl font-black text-[#f5a400]">
                {{ formatMoney(numericPrice) }}
              </p>
            </div>
          </div>

          <div class="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[220px_1fr] sm:items-center">
            <div class="rounded-2xl bg-white p-3 ring-1 ring-slate-100">
              <img
                :src="qrCodeUrl"
                alt="QR ສຳລັບຊຳລະເງິນ"
                class="mx-auto h-[196px] w-[196px]"
              />
            </div>
            <div>
              <p class="text-xs font-black uppercase tracking-wide text-[#f5a400]">ສະແກນ QR</p>
              <h3 class="mt-1 text-lg font-black text-[#0f1f4d]">ຊຳລະເງິນຜ່ານ QR</h3>
              <p class="mt-2 text-sm font-bold leading-6 text-slate-500">
                ສະແກນ QR ເພື່ອຊຳລະຄ່າຄອສ ແລ້ວອັບໂຫຼດສະລິບດ້ານລຸ່ມໃຫ້ແອດມິນກວດ.
              </p>
            </div>
          </div>

          <label
            class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-5 text-center transition hover:border-[#f5a400] hover:bg-[#f5a400]/5"
          >
            <input type="file" accept="image/*" class="hidden" @change="handleFileChange" />
            <span class="grid h-11 w-11 place-items-center rounded-2xl bg-[#f5a400]/10 text-2xl text-[#f5a400]">
              ↑
            </span>
            <span class="mt-3 max-w-full truncate text-sm font-black text-[#0f1f4d]">
              {{ selectedSlip ? selectedSlip.name : 'ເລືອກຮູບສະລີບ' }}
            </span>
            <span class="mt-1 text-xs font-bold text-slate-500">PNG, JPG, WEBP ບໍ່ເກີນ 5MB</span>
          </label>

          <div v-if="previewUrl" class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <img
              :src="previewUrl"
              alt="ຕົວຢ່າງສະລິບຊຳລະເງິນ"
              class="mx-auto h-56 max-w-full object-contain"
            />
          </div>

          <p v-if="localError" class="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {{ localError }}
          </p>

          <div class="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 transition hover:border-[#142b63] hover:text-[#142b63]"
              :disabled="isSubmitting"
              @click="handleClose"
            >
              ຍົກເລີກ
            </button>

            <button
              type="button"
              class="flex-1 rounded-xl bg-[#142b63] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0e214d] disabled:cursor-not-allowed disabled:bg-slate-400"
              :disabled="isSubmitting"
              @click="handleSubmit"
            >
              {{ isSubmitting ? 'ກຳລັງສົ່ງສະລີບ...' : 'ສົ່ງສະລີບໃຫ້ແອດມິນກວດ' }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>
