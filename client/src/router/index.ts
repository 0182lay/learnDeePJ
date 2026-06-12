import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import CoursesPage from '../views/CoursesPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import CourseDetailPage from '../views/CourseDetailPage.vue'
import DashboardPage from '../views/DashboardPage.vue'
import CreateCoursePage from '../views/CreateCoursePage.vue'
import EditCoursePage from '../views/EditCoursePage.vue'
import PaymentsPage from '../views/PaymentsPage.vue'
import LessonWatchPage from '../views/LessonWatchPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import InstructorRequestPage from '../views/InstructorRequestPage.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomePage,
    },
    {
      path: '/login',
      component: LoginPage,
      meta: { guestOnly: true, hideNavbar: true },
    },
    {
      path: '/register',
      component: RegisterPage,
      meta: { guestOnly: true, hideNavbar: true },
    },
    {
      path: '/courses',
      component: CoursesPage,
    },
    {
      path: '/courses/create',
      component: CreateCoursePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/courses/:courseId/edit',
      component: EditCoursePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/courses/:courseId',
      component: CourseDetailPage,
    },
    {
      path: '/courses/:courseId/learn/:lessonId',
      component: LessonWatchPage,
      meta: { requiresAuth: true, hideNavbar: true },
    },
    {
      path: '/dashboard',
      component: DashboardPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      component: ProfilePage,
      meta: { requiresAuth: true },
    },
    {
      path: '/instructor-request',
      component: InstructorRequestPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/my-learning',
      redirect: '/dashboard',
    },
    {
      path: '/payments',
      component: PaymentsPage,
      meta: { requiresAuth: true },
    },
  ],
})
router.beforeEach((to) => {
  const requiresAuth = to.matched.some((route) => route.meta.requiresAuth)
  const guestOnly = to.matched.some((route) => route.meta.guestOnly)
  const token = localStorage.getItem('token')

  if (requiresAuth && !token) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  if (guestOnly && token) {
    return '/courses'
  }
})

export default router
