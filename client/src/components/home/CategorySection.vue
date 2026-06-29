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
  <section class="border-t border-border bg-muted/30 py-12">
    <div class="mx-auto max-w-[1680px] px-6 sm:px-8 lg:px-16 2xl:px-20">
      <div>
        <h2 class="text-2xl font-black text-primary">ໝວດໝູ່ຄອສຮຽນ</h2>
        <p class="mt-2 text-sm text-muted-foreground">
          ເລືອກຫົວຂໍ້ທີ່ສົນໃຈ ແລ້ວເລີ່ມຮຽນຈາກຄອສທີ່ເໝາະກັບເປົ້າໝາຍຂອງເຈົ້າ
        </p>
      </div>

      <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RouterLink
          v-for="category in homeCategories"
          :key="category.category_id"
          :to="{ path: '/courses', query: { category: category.category_id } }"
          class="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-primary/30 hover:shadow-md dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
        >
          <span
            class="flex h-10 w-10 items-center justify-center rounded-lg text-lg transition-transform duration-300 group-hover:scale-110"
            :class="category.color"
          >
            {{ category.icon }}
          </span>

          <span>
            <span class="block font-bold text-foreground group-hover:text-primary">
              {{ category.name }}
            </span>
            <span class="mt-1 block text-xs text-muted-foreground">
              {{ category.course_count ?? 0 }} ຄອສ
            </span>
          </span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
