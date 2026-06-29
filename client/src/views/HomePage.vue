<script setup lang="ts">
import HeroSection from '../components/home/HeroSection.vue'
import CategorySection from '../components/home/CategorySection.vue'
import FeaturedCoursesSection from '../components/home/FeaturedCoursesSection.vue'
import HomeCtaSection from '../components/home/HomeCtaSection.vue'
import HomeFooter from '../components/home/HomeFooter.vue'
</script>

<template>
  <main class="min-h-screen bg-background">
    <HeroSection />
    <CategorySection v-scroll-reveal />
    <FeaturedCoursesSection v-scroll-reveal />
    <HomeCtaSection v-scroll-reveal />
    <HomeFooter />
  </main>
</template>
