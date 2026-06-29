<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'

const route = useRoute()

const shouldShowNavbar = computed(() => {
  return !route.meta.hideNavbar
})

// Visual Page-Loading progress indicator for transitions
const isLoading = ref(false)
const progressWidth = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

watch(
  () => route.path,
  () => {
    isLoading.value = true
    progressWidth.value = 15

    if (timer) clearInterval(timer)

    timer = setInterval(() => {
      if (progressWidth.value < 85) {
        progressWidth.value += Math.floor(Math.random() * 10) + 5
      } else {
        if (timer) clearInterval(timer)
      }
    }, 80)

    // Complete the loading animation
    setTimeout(() => {
      if (timer) clearInterval(timer)
      progressWidth.value = 100
      setTimeout(() => {
        isLoading.value = false
        progressWidth.value = 0
      }, 200)
    }, 400)
  }
)
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300">
    <!-- Visual Top Progress Loading Bar -->
    <div
      v-if="isLoading"
      class="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[#294a78] via-[#f5a400] to-[#294a78] transition-all duration-200 ease-out"
      :style="{ width: progressWidth + '%', zIndex: 99999 }"
    ></div>

    <AppNavbar v-if="shouldShowNavbar" />
    
    <RouterView v-slot="{ Component }">
      <transition name="fade-slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </div>
</template>
