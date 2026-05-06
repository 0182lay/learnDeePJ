<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type PaymentStep = 'select' | 'processing' | 'success'
type PaymentMethod = 'qr' | 'card' | 'mobile'

const props = defineProps<{
  open: boolean
  courseTitle: string
  price: string
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  close: []
  success: [method: PaymentMethod]
}>()

const step = ref<PaymentStep>('select')
const selectedMethod = ref<PaymentMethod>('qr')

const methods: { id: PaymentMethod; label: string; desc: string; icon: string }[] = [
  { id: 'qr', label: 'QR Code', desc: 'ສະແກນ QR ເພື່ອຊຳລະ', icon: '▦' },
  { id: 'card', label: 'Card', desc: 'Visa / Mastercard', icon: '▭' },
  { id: 'mobile', label: 'Mobile Banking', desc: 'BCEL One, JDB, LDB', icon: '▣' },
]

const numericPrice = computed(() => {
  const amount = Number(String(props.price || 0).replace(/,/g, ''))
  return Number.isNaN(amount) ? 0 : amount
})

const commission = computed(() => Math.round(numericPrice.value * 0.2))
const teacherEarning = computed(() => numericPrice.value - commission.value)

const formatMoney = (amount: number) => {
  return `₭${amount.toLocaleString('en-US')}`
}

const handlePay = (method: PaymentMethod) => {
  selectedMethod.value = method
  step.value = 'processing'

  window.setTimeout(() => {
    step.value = 'success'
  }, 900)
}

const handleSuccess = () => {
  emit('success', selectedMethod.value)
}

const handleClose = () => {
  if (props.isSubmitting) return

  emit('close')
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      step.value = 'select'
      selectedMethod.value = 'qr'
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] grid place-items-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
      @click.self="handleClose"
    >
      <section class="animate-pop w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_30px_90px_rgba(15,31,77,0.35)]">
        <div class="hero-gradient px-6 py-5 text-white">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-black uppercase tracking-wide text-[#f5a400]">
                Secure checkout
              </p>
              <h2 class="mt-2 text-2xl font-black">
                {{ step === 'success' ? 'ຊຳລະເງິນສຳເລັດ' : 'ຊຳລະເງິນ' }}
              </h2>
              <p class="mt-1 line-clamp-1 text-sm text-white/70">{{ courseTitle }}</p>
            </div>

            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-lg font-black text-white transition hover:bg-white/20"
              :disabled="isSubmitting"
              @click="handleClose"
            >
              ×
            </button>
          </div>
        </div>

        <div class="p-6">
          <div v-if="step === 'select'" class="space-y-5">
            <div class="rounded-2xl bg-slate-50 p-4">
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-slate-500">ລາຄາຄອສ</span>
                <span class="font-number text-2xl font-black text-[#f5a400]">
                  {{ formatMoney(numericPrice) }}
                </span>
              </div>

              <div class="mt-3 space-y-1 border-t border-slate-200 pt-3 text-xs font-bold text-slate-500">
                <div class="flex justify-between">
                  <span>ຄ່າລະບົບ 20%</span>
                  <span>{{ formatMoney(commission) }}</span>
                </div>
                <div class="flex justify-between text-emerald-600">
                  <span>ຜູ້ສອນໄດ້ຮັບ</span>
                  <span>{{ formatMoney(teacherEarning) }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <p class="text-sm font-black text-[#0f1f4d]">ເລືອກວິທີຊຳລະ</p>

              <button
                v-for="method in methods"
                :key="method.id"
                type="button"
                class="flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-[#f5a400] hover:bg-[#f5a400]/5"
                @click="handlePay(method.id)"
              >
                <span class="grid h-11 w-11 place-items-center rounded-xl bg-[#f5a400]/10 text-xl font-black text-[#f5a400]">
                  {{ method.icon }}
                </span>
                <span class="flex-1">
                  <span class="block text-sm font-black text-[#0f1f4d]">{{ method.label }}</span>
                  <span class="block text-xs font-bold text-slate-500">{{ method.desc }}</span>
                </span>
                <span class="text-lg font-black text-slate-300">›</span>
              </button>
            </div>
          </div>

          <div v-else-if="step === 'processing'" class="py-7 text-center">
            <div
              v-if="selectedMethod === 'qr'"
              class="mx-auto grid h-48 w-48 grid-cols-7 gap-1 rounded-2xl bg-slate-950 p-5"
            >
              <span
                v-for="index in 49"
                :key="index"
                class="rounded-[3px]"
                :class="index % 3 === 0 || index % 5 === 0 || index < 9 ? 'bg-white' : 'bg-slate-950'"
              ></span>
            </div>

            <div
              v-else
              class="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[#f5a400]/15 text-4xl text-[#f5a400]"
            >
              {{ selectedMethod === 'card' ? '▭' : '▣' }}
            </div>

            <div class="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#f5a400]"></div>
            <p class="mt-4 text-sm font-bold text-slate-500">
              ກຳລັງກວດສອບການຊຳລະ...
            </p>
          </div>

          <div v-else class="py-7 text-center">
            <div class="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-4xl text-emerald-600">
              ✓
            </div>
            <h3 class="mt-5 text-xl font-black text-[#0f1f4d]">ສ້າງ payment ສຳເລັດ</h3>
            <p class="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
              ລາຍການຊຳລະຈະຢູ່ສະຖານະ pending ເພື່ອໃຫ້ admin ກວດສອບ
            </p>

            <button
              type="button"
              :disabled="isSubmitting"
              class="mt-6 w-full rounded-2xl bg-[#142b63] px-5 py-4 text-sm font-black text-white transition hover:bg-[#0e214d] disabled:cursor-not-allowed disabled:bg-slate-400"
              @click="handleSuccess"
            >
              {{ isSubmitting ? 'ກຳລັງບັນທຶກ...' : 'ຢືນຢັນການຊຳລະ' }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>
