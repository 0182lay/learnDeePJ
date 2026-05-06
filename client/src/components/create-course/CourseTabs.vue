<script setup lang="ts">
import type { CreateCourseTab } from '../../types/createCourse'

const activeTab = defineModel<CreateCourseTab>({ required: true })
</script>

<template>
  <div class="mt-7 inline-flex rounded-xl bg-slate-200/70 p-1">
    <button
      type="button"
      class="rounded-lg px-4 py-2 text-sm font-bold transition"
      :class="activeTab === 'info' ? 'bg-white text-[#142b63] shadow-sm' : 'text-slate-500'"
      @click="activeTab = 'info'"
    >
      ຂໍ້ມູນຄອສ
    </button>

    <button
      type="button"
      class="rounded-lg px-4 py-2 text-sm font-bold transition"
      :class="activeTab === 'lessons' ? 'bg-white text-[#142b63] shadow-sm' : 'text-slate-500'"
      @click="activeTab = 'lessons'"
    >
      ບົດຮຽນ & ວິດີໂອ
    </button>
  </div>
</template>
