<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'

const route = useRoute()

const shouldShowNavbar = computed(() => {
  return !route.meta.hideNavbar
})
</script>

<template>
  <div>
    <AppNavbar v-if="shouldShowNavbar" />
    <RouterView />
  </div>
</template>
