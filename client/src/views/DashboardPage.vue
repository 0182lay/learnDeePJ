<script setup lang="ts">
import { computed } from 'vue'
import AdminDashboard from '../components/admin/AdminDashboard.vue'
import StudentDashboard from '../components/dashboard/StudentDashboard.vue'
import TeacherDashboard from '../components/dashboard/TeacherDashboard.vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()

const role = computed(() => authStore.user?.role || 'student')
</script>

<template>
  <AdminDashboard v-if="role === 'admin'" />
  <TeacherDashboard v-else-if="role === 'instructor'" />
  <StudentDashboard v-else />
</template>
