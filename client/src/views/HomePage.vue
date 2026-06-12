<script setup lang="ts">
import HeroSection from '../components/home/HeroSection.vue'
import StatsSection from '../components/home/StatsSection.vue'
import CategorySection from '../components/home/CategorySection.vue'
import FeaturedCoursesSection from '../components/home/FeaturedCoursesSection.vue'
import HomeCtaSection from '../components/home/HomeCtaSection.vue'
import HomeFooter from '../components/home/HomeFooter.vue'
</script>

<template>
  <main class="min-h-screen bg-[#f7f7f6]">
    <HeroSection />
    <StatsSection />
    <CategorySection />
    <FeaturedCoursesSection />
    <HomeCtaSection />
    <HomeFooter />
  </main>
</template>
