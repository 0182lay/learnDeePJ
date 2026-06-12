<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getCategories } from '../../api/categoryApi'
import type { Category } from '../../types/category'

const categories = ref<Category[]>([])

const categoryColors = [
  'bg-sky-50 text-sky-600',
  'bg-rose-50 text-rose-600',
  'bg-[#f5a400]/10 text-[#f5a400]',
  'bg-indigo-50 text-indigo-600',
  'bg-violet-50 text-violet-600',
  'bg-cyan-50 text-cyan-600',
  'bg-emerald-50 text-emerald-600',
  'bg-fuchsia-50 text-fuchsia-600',
]

const homeCategories = computed(() => {
  return categories.value.slice(0, 8).map((category, index) => ({
    ...category,
    icon: category.icon || '📚',
    color: categoryColors[index % categoryColors.length],
  }))
})

const fetchCategories = async () => {
  try {
    categories.value = await getCategories()
  } catch (error) {
    console.log(error)
    categories.value = []
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <section class="border-t border-slate-200 bg-[#f8fafc] py-12">
    <div class="mx-auto max-w-[1700px] px-8 lg:px-20 2xl:px-28">
      <div>
        <h2 class="text-2xl font-black text-[#294a78]">ໝວດໝູ່ຄອສຮຽນ</h2>
        <p class="mt-2 text-sm text-slate-500">
          ເລືອກຫົວຂໍ້ທີ່ສົນໃຈ ແລ້ວເລີ່ມຮຽນຈາກຄອສທີ່ເໝາະກັບເປົ້າໝາຍຂອງເຈົ້າ
        </p>
      </div>

      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RouterLink
          v-for="category in homeCategories"
          :key="category.category_id"
          :to="{ path: '/courses', query: { category: category.category_id } }"
          class="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#294a78]/20 hover:shadow-md"
        >
          <span
            class="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
            :class="category.color"
          >
            {{ category.icon }}
          </span>

          <span>
            <span class="block font-bold text-slate-900 group-hover:text-[#294a78]">
              {{ category.name }}
            </span>
            <span class="mt-1 block text-xs text-slate-500">
              {{ category.course_count ?? 0 }} ຄອສ
            </span>
          </span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
