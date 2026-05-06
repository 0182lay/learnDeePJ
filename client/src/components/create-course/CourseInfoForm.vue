<script setup lang="ts">
import type { Category } from '../../types/category'
import type { CourseForm } from '../../types/createCourse'

defineProps<{
  categories: Category[]
  coverPreview: string
  isUploadingCover: boolean
}>()

const form = defineModel<CourseForm>('form', { required: true })

defineEmits<{
  submit: []
  coverFileChange: [event: Event]
}>()
</script>

<template>
  <form class="mt-7 grid gap-7 lg:grid-cols-[1fr_520px]" @submit.prevent="$emit('submit')">
    <section class="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      <div class="grid gap-6 md:grid-cols-2">
        <label class="md:col-span-2">
          <span class="text-sm font-black text-slate-950">ຊື່ຄອສ</span>
          <input
            v-model="form.title"
            required
            type="text"
            class="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#142b63]"
            placeholder="ເຊັ່ນ: ພື້ນຖານ Vue.js ສຳລັບຜູ້ເລີ່ມຕົ້ນ"
          />
        </label>

        <label class="md:col-span-2">
          <span class="text-sm font-black text-slate-950">ລາຍລະອຽດ</span>
          <textarea
            v-model="form.description"
            rows="6"
            class="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#142b63]"
            placeholder="ອະທິບາຍວ່າຄອສນີ້ຈະສອນຫຍັງ..."
          ></textarea>
        </label>

        <label>
          <span class="text-sm font-black text-slate-950">ໝວດໝູ່</span>
          <select
            v-model="form.category_id"
            required
            class="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#142b63]"
          >
            <option value="" disabled>ເລືອກໝວດໝູ່</option>
            <option
              v-for="category in categories"
              :key="category.category_id"
              :value="category.category_id"
            >
              {{ category.name }}
            </option>
          </select>
        </label>

        <label>
          <span class="text-sm font-black text-slate-950">ລະດັບ</span>
          <select
            v-model="form.level"
            class="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#142b63]"
          >
            <option value="beginner">ເລີ່ມຕົ້ນ</option>
            <option value="intermediate">ປານກາງ</option>
            <option value="advanced">ຂັ້ນສູງ</option>
          </select>
        </label>

        <label class="md:col-span-2">
          <span class="text-sm font-black text-slate-950">ລາຄາ (₭)</span>
          <input
            v-model="form.price"
            required
            type="text"
            class="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#142b63]"
            placeholder="0 = ຟຣີ"
          />
          <span class="mt-2 block text-xs font-medium text-slate-500">ໃສ່ 0 ສຳລັບຄອສຟຣີ</span>
        </label>
      </div>
    </section>

    <aside class="space-y-5">
      <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-base font-black text-slate-950">ຮູບປົກ</h2>
        <label
          class="mt-5 flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 transition hover:border-[#142b63]"
        >
          <img
            v-if="coverPreview"
            :src="coverPreview"
            alt="Course cover preview"
            class="h-full w-full object-cover"
          />
          <div v-else class="text-center text-slate-500">
            <div class="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white text-2xl shadow-sm">
              ▧
            </div>
            <p class="mt-4 text-sm font-bold">ອັບໂຫຼດຮູບປົກ</p>
            <p class="mt-1 text-xs">PNG, JPG (16:9) ສູງສຸດ 5MB</p>
          </div>

          <input type="file" accept="image/*" class="hidden" @change="$emit('coverFileChange', $event)" />
        </label>

        <p v-if="isUploadingCover" class="mt-3 text-sm font-medium text-slate-500">
          ກຳລັງອັບໂຫຼດ...
        </p>
        <p v-else-if="form.thumbnail_url" class="mt-3 break-all text-xs font-medium text-slate-500">
          {{ form.thumbnail_url }}
        </p>
      </section>

      <section class="rounded-2xl bg-[#f5a400]/10 p-5">
        <h2 class="text-sm font-black text-slate-950">ຄຳແນະນຳ</h2>
        <ul class="mt-3 space-y-2 text-sm leading-6 text-slate-600">
          <li>• ໃຊ້ຊື່ຄອສທີ່ຊັດເຈນ ແລະ ເຂົ້າໃຈງ່າຍ</li>
          <li>• ອະທິບາຍວ່າຜູ້ຮຽນຈະໄດ້ຫຍັງ</li>
          <li>• ເລືອກຮູບປົກທີ່ກ່ຽວກັບຄອສ</li>
          <li>• ຕັ້ງລາຄາໃຫ້ເໝາະສົມ</li>
        </ul>
      </section>
    </aside>
  </form>
</template>
