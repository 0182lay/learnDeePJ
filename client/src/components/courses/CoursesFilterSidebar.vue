<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Category } from '../../types/category'

const props = defineProps<{
  categories: Category[]
  selectedCategory: string
  selectedLevel: string
  selectedPrice: string
}>()

const emit = defineEmits<{
  'update:selectedCategory': [value: string]
  'update:selectedLevel': [value: string]
  'update:selectedPrice': [value: string]
}>()

const categoryOptions = computed(() => {
  const totalCourses = props.categories.reduce((total, category) => {
    return total + (category.course_count ?? 0)
  }, 0)

  return [
    { label: 'ທັງໝົດ', value: 'all', count: totalCourses, icon: '📋' },
    ...props.categories.map((category) => ({
      label: category.name,
      value: category.category_id,
      count: category.course_count ?? 0,
      icon: category.icon || '📚',
    })),
  ]
})

const levels = [
  { label: 'ທັງໝົດ', value: 'all' },
  { label: 'ເລີ່ມຕົ້ນ', value: 'beginner' },
  { label: 'ປານກາງ', value: 'intermediate' },
  { label: 'ຂັ້ນສູງ', value: 'advanced' },
]

const prices = [
  { label: 'ທັງໝົດ', value: 'all' },
  { label: 'ຟຣີ', value: 'free' },
  { label: 'ເສຍເງິນ', value: 'paid' },
]

const isCollapsed = ref(false)
</script>

<template>
  <aside
    class="overflow-hidden border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,31,77,0.04),0_14px_30px_rgba(15,31,77,0.06)] transition-all duration-300"
    :class="isCollapsed ? 'w-[54px] rounded-[16px]' : 'w-full rounded-[14px] lg:w-[270px]'"
  >
    <button
      type="button"
      class="flex w-full items-center border-b border-slate-200/80 transition hover:bg-slate-50"
      :class="isCollapsed ? 'h-14 justify-center px-0' : 'justify-between px-5 py-4'"
      @click="isCollapsed = !isCollapsed"
    >
      <h2 v-if="!isCollapsed" class="text-base font-bold text-slate-950">ຕົວກອງ</h2>

      <span
        class="text-2xl font-semibold leading-none text-slate-950 transition"
        :class="isCollapsed ? '' : 'rotate-180'"
      >
        ›
      </span>
    </button>

    <div v-if="isCollapsed" class="flex flex-col items-center gap-3.5 px-2 py-4 text-slate-950">
      <button
        type="button"
        class="grid h-7 w-7 place-items-center rounded-lg transition hover:bg-slate-50"
        title="ໝວດໝູ່"
        @click="isCollapsed = false"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.6 13.6 13.6 20.6a2 2 0 0 1-2.8 0L3 12.8V4h8.8l8.8 8.8a2 2 0 0 1 0 2.8Z" />
          <path d="M7.5 7.5h.01" />
        </svg>
      </button>

      <button
        type="button"
        class="grid h-7 w-7 place-items-center rounded-lg transition hover:bg-slate-50"
        title="ລະດັບ"
        @click="isCollapsed = false"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m22 10-10-5-10 5 10 5 10-5Z" />
          <path d="M6 12.5v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4" />
        </svg>
      </button>

      <button
        type="button"
        class="grid h-7 w-7 place-items-center rounded-lg transition hover:bg-slate-50"
        title="ລາຄາ"
        @click="isCollapsed = false"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m12 2.8 2.8 5.7 6.3.9-4.5 4.4 1 6.2-5.6-3-5.6 3 1-6.2-4.5-4.4 6.3-.9L12 2.8Z" />
        </svg>
      </button>
    </div>

    <div v-else class="sidebar-scroll max-h-[470px] space-y-5 overflow-y-auto p-4 pr-2">
      <section>
        <p class="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M20.6 13.6 13.6 20.6a2 2 0 0 1-2.8 0L3 12.8V4h8.8l8.8 8.8a2 2 0 0 1 0 2.8Z" />
            <path d="M7.5 7.5h.01" />
          </svg>
          ໝວດໝູ່
        </p>

        <div class="space-y-1">
          <button
            v-for="category in categoryOptions"
            :key="category.value"
            type="button"
            class="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-[200] transition"
            :class="
              selectedCategory === category.value
                ? 'bg-[#142b63] text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-[#142b63]'
            "
            @click="emit('update:selectedCategory', category.value)"
          >
            <span class="flex min-w-0 items-center gap-2.5">
              <span class="text-[15px] leading-none">{{ category.icon }}</span>
              <span class="truncate">{{ category.label }}</span>
            </span>

            <span class="text-xs font-bold opacity-70">{{ category.count }}</span>
          </button>
        </div>
      </section>

      <section>
        <p class="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m22 10-10-5-10 5 10 5 10-5Z" />
            <path d="M6 12.5v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4" />
          </svg>
          ລະດັບ
        </p>

        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="level in levels"
            :key="level.value"
            type="button"
            class="rounded-full border px-3 py-2 text-xs font-semibold transition"
            :class="
              selectedLevel === level.value
                ? 'border-[#142b63] bg-[#142b63] text-white'
                : 'border-slate-200 bg-white text-slate-500 hover:border-[#142b63]'
            "
            @click="emit('update:selectedLevel', level.value)"
          >
            {{ level.label }}
          </button>
        </div>
      </section>

      <section>
        <p class="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="m12 2.8 2.8 5.7 6.3.9-4.5 4.4 1 6.2-5.6-3-5.6 3 1-6.2-4.5-4.4 6.3-.9L12 2.8Z"
            />
          </svg>
          ລາຄາ
        </p>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="price in prices"
            :key="price.value"
            type="button"
            class="rounded-full border px-3.5 py-2 text-xs font-semibold transition"
            :class="
              selectedPrice === price.value
                ? 'border-[#142b63] bg-[#142b63] text-white'
                : 'border-slate-200 bg-white text-slate-500 hover:border-[#142b63]'
            "
            @click="emit('update:selectedPrice', price.value)"
          >
            {{ price.label }}
          </button>
        </div>
      </section>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-scroll {
  scrollbar-gutter: stable;
  scrollbar-width: auto;
  scrollbar-color: #8a8a8a transparent;
}

.sidebar-scroll::-webkit-scrollbar {
  width: 12px;
}

.sidebar-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
  background: #8a8a8a;
  border-radius: 999px;
  border: 3px solid #ffffff;
}

.sidebar-scroll::-webkit-scrollbar-thumb:hover {
  background: #707070;
}

.sidebar-scroll::-webkit-scrollbar-button:single-button {
  display: block;
  height: 12px;
  background: transparent;
}

.sidebar-scroll::-webkit-scrollbar-button:single-button:vertical:decrement {
  background:
    linear-gradient(135deg, transparent 50%, #9a9a9a 50%) 3px 5px / 6px 6px no-repeat,
    linear-gradient(225deg, transparent 50%, #9a9a9a 50%) 7px 5px / 6px 6px no-repeat;
}

.sidebar-scroll::-webkit-scrollbar-button:single-button:vertical:increment {
  background:
    linear-gradient(45deg, transparent 50%, #9a9a9a 50%) 3px 2px / 6px 6px no-repeat,
    linear-gradient(315deg, transparent 50%, #9a9a9a 50%) 7px 2px / 6px 6px no-repeat;
}
</style>
