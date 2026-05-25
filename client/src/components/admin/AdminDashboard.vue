<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type CategoryPayload,
} from '../../api/categoryApi'
import { deleteCourse, getMyCourses } from '../../api/courseApi'
import { deletePayment, getMyPayments, updatePaymentStatus } from '../../api/paymentApi'
import { getUsers, updateUser } from '../../api/userApi'
import { useAuthStore } from '../../stores/authStore'
import type { Category } from '../../types/category'
import type { Course } from '../../types/course'
import type { MyPayment, PaymentStatus } from '../../types/payment'
import type { AppUser } from '../../types/user'

type AdminTab =
  | 'overview'
  | 'users'
  | 'courses'
  | 'categories'
  | 'instructors'
  | 'payments'
  | 'reports'

type ReportType =
  | 'summary'
  | 'monthlyRevenue'
  | 'popularCourses'
  | 'instructorRevenue'
  | 'learnerJourney'

const authStore = useAuthStore()

const activeTab = ref<AdminTab>('overview')
const users = ref<AppUser[]>([])
const courses = ref<Course[]>([])
const categories = ref<Category[]>([])
const payments = ref<MyPayment[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const updatingId = ref('')
const categoryForm = ref<CategoryPayload>({ name: '', description: '', icon: '📚' })
const editingCategoryId = ref('')
const selectedReportType = ref<ReportType>('summary')

const displayName = computed(() => {
  const profile = authStore.user?.profile
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')

  return fullName || authStore.user?.email?.split('@')[0] || 'Admin'
})

const avatarText = computed(() => displayName.value.slice(0, 2).toUpperCase())
const avatarUrl = computed(() => authStore.user?.profile?.avatar_url || '')

const resolveFileUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `http://localhost:3003${url.startsWith('/') ? url : `/${url}`}`
}

const activeUsersCount = computed(() => {
  return users.value.filter((user) => user.is_active).length
})

const instructors = computed(() => {
  return users.value.filter((user) => user.role === 'instructor')
})

const pendingInstructors = computed(() => {
  return instructors.value.filter((user) => !user.is_active)
})

const completedPayments = computed(() => {
  return payments.value.filter((payment) => payment.status === 'completed')
})

const pendingPayments = computed(() => {
  return payments.value.filter((payment) => payment.status === 'pending')
})

const studentsCount = computed(() => {
  return users.value.filter((user) => user.role === 'student').length
})

const totalRevenue = computed(() => {
  return completedPayments.value.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
})

const selectedReportLabel = computed(() => {
  return reportTypes.find((report) => report.key === selectedReportType.value)?.label || 'ສະຫຼຸບລວມ'
})

const publishedCoursesCount = computed(() => {
  return courses.value.filter((course) => course.is_published).length
})

const reportRows = computed(() => {
  if (selectedReportType.value === 'monthlyRevenue') {
    return [
      { metric: 'ລາຍໄດ້ລວມ', current: formatShortMoney(totalRevenue.value), growth: '+28.4%', status: 'ດີ', tone: 'positive' },
      { metric: 'ລາຍການຊຳລະສຳເລັດ', current: completedPayments.value.length, growth: '+12.5%', status: 'ດີ', tone: 'positive' },
      { metric: 'ລາຍການລໍຖ້າ', current: pendingPayments.value.length, growth: '+3.5%', status: 'ກວດ', tone: 'neutral' },
      { metric: 'ມູນຄ່າສະເລ່ຍ', current: formatMoney(completedPayments.value.length ? totalRevenue.value / completedPayments.value.length : 0), growth: '+8.2%', status: 'ດີ', tone: 'positive' },
    ]
  }

  if (selectedReportType.value === 'popularCourses') {
    return courses.value.slice(0, 6).map((course, index) => ({
      metric: course.title,
      current: course.review_count || index + 1,
      growth: index < 4 ? `+${12 - index * 1.7}%` : '-2.4%',
      status: course.is_published ? 'ເຜີຍແຜ່' : 'ຮ່າງ',
      tone: index < 4 ? 'positive' : 'negative',
    }))
  }

  if (selectedReportType.value === 'instructorRevenue') {
    return [
      { metric: 'ຜູ້ສອນທັງໝົດ', current: instructors.value.length, growth: '+8.2%', status: 'ດີ', tone: 'positive' },
      { metric: 'ຜູ້ສອນລໍຖ້າ', current: pendingInstructors.value.length, growth: '-15%', status: 'ຕິດຕາມ', tone: 'negative' },
      { metric: 'ລາຍໄດ້ຜູ້ສອນ', current: formatShortMoney(Math.round(totalRevenue.value * 0.7)), growth: '+18.5%', status: 'ດີ', tone: 'positive' },
      { metric: 'ຄອສຕໍ່ຜູ້ສອນ', current: instructors.value.length ? Math.round(courses.value.length / instructors.value.length) : 0, growth: '+4.1%', status: 'ດີ', tone: 'positive' },
    ]
  }

  if (selectedReportType.value === 'learnerJourney') {
    return [
      { metric: 'ຜູ້ໃຊ້ນັກຮຽນ', current: studentsCount.value, growth: '+12.5%', status: 'ດີ', tone: 'positive' },
      { metric: 'ນັກຮຽນໃໝ່', current: Math.max(0, studentsCount.value - 3), growth: '+15.2%', status: 'ດີ', tone: 'positive' },
      { metric: 'ອັດຕາການຈົບສະເລ່ຍ', current: '73%', growth: '+3.5%', status: 'ດີ', tone: 'positive' },
      { metric: 'ບົດຮຽນທີ່ເປີດເບິ່ງ', current: courses.value.length * 6, growth: '+9.8%', status: 'ດີ', tone: 'positive' },
    ]
  }

  return [
    { metric: 'ຜູ້ໃຊ້ທັງໝົດ', current: activeUsersCount.value, growth: '+12.5%', status: 'ດີ', tone: 'positive' },
    { metric: 'ຄອສທັງໝົດ', current: courses.value.length, growth: '+8.2%', status: 'ດີ', tone: 'positive' },
    { metric: 'ລາຍໄດ້ລວມ 6 ເດືອນ', current: formatShortMoney(totalRevenue.value), growth: '+28.4%', status: 'ດີຫຼາຍ', tone: 'positive' },
    { metric: 'ນັກຮຽນໃໝ່', current: studentsCount.value, growth: '+15.2%', status: 'ດີ', tone: 'positive' },
    { metric: 'ອັດຕາຮຽນຈົບສະເລ່ຍ', current: '73%', growth: '+3.5%', status: 'ດີ', tone: 'positive' },
    { metric: 'ຜູ້ສອນລໍຖ້າ', current: pendingInstructors.value.length, growth: '-15%', status: 'ຕິດຕາມ', tone: 'negative' },
  ]
})

const recentActivities = computed(() => {
  const paymentActivities = payments.value.slice(0, 4).map((payment) => ({
    id: `payment-${payment.payment_id}`,
    title: payment.status === 'completed' ? 'ຊຳລະເງິນສຳເລັດ' : 'payment ໃໝ່ລໍຖ້າ',
    detail: `${formatMoney(payment.amount)} - ${payment.course.title}`,
    time: formatDate(payment.created_at),
  }))

  const courseActivities = courses.value.slice(0, 3).map((course) => ({
    id: `course-${course.course_id}`,
    title: course.is_published ? 'ຄອສກຳລັງເປີດສອນ' : 'ຄອສແບບຮ່າງ',
    detail: course.title,
    time: course.created_at ? formatDate(course.created_at) : '-',
  }))

  return [...paymentActivities, ...courseActivities].slice(0, 5)
})

const tabs: { key: AdminTab; label: string }[] = [
  { key: 'overview', label: 'ພາບລວມ' },
  { key: 'users', label: 'Users' },
  { key: 'courses', label: 'ຄອສທັ້ງໝົດ' },
  { key: 'categories', label: 'Categories' },
  { key: 'instructors', label: 'ຜູ້ສອນລໍຖ້າອະນຸມັດ' },
  { key: 'payments', label: 'ປະຫວັດການຊຳລະເງິນ' },
  { key: 'reports', label: 'ລາຍງານ' },
]

const reportTypes: { key: ReportType; label: string }[] = [
  { key: 'summary', label: 'ສະຫຼຸບລວມ' },
  { key: 'monthlyRevenue', label: 'ລາຍໄດ້ລາຍເດືອນ' },
  { key: 'popularCourses', label: 'ຄອສຍອດນິຍົມ' },
  { key: 'instructorRevenue', label: 'ລາຍໄດ້ຜູ້ສອນ' },
  { key: 'learnerJourney', label: 'ເສັ້ນທາງນັກຮຽນ' },
]

const statusLabel: Record<PaymentStatus, string> = {
  pending: 'ລໍຖ້າ',
  completed: 'ສຳເລັດ',
  failed: 'ປະຕິເສດ',
  refunded: 'ຄືນເງິນ',
}

const statusClass: Record<PaymentStatus, string> = {
  pending: 'bg-[#f5a400]/10 text-[#a46b00]',
  completed: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-600',
  refunded: 'bg-slate-100 text-slate-600',
}

const formatMoney = (amount: string | number) => {
  return `₭${Number(amount || 0).toLocaleString('en-US')}`
}

const formatShortMoney = (amount: number) => {
  if (amount >= 1_000_000) {
    return `₭${Math.round(amount / 1_000_000)}M`
  }

  return formatMoney(amount)
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('lo-LA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

const getUserName = (user: AppUser | undefined) => {
  if (!user) return 'User'

  const fullName = [user.profile?.first_name, user.profile?.last_name].filter(Boolean).join(' ')
  return fullName || user.email
}

const getPaymentStudentName = (payment: MyPayment) => {
  const fullName = [payment.student?.profile?.first_name, payment.student?.profile?.last_name]
    .filter(Boolean)
    .join(' ')

  return fullName || payment.student?.email || 'Student'
}

const getInstructorName = (course: Course) => {
  const fullName = [course.instructor?.profile?.first_name, course.instructor?.profile?.last_name]
    .filter(Boolean)
    .join(' ')

  return fullName || course.instructor?.email || 'Instructor'
}

const csvCell = (value: string | number | boolean | null | undefined) => {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

const csvSection = (title: string, rows: (string | number | boolean | null | undefined)[][]) => {
  return [[title], ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
}

const exportReportCsv = () => {
  const sections = [
    csvSection('SYSTEM SUMMARY', [
      ['Metric', 'Value'],
      ['Active users', activeUsersCount.value],
      ['Students', studentsCount.value],
      ['Instructors', instructors.value.length],
      ['Courses', courses.value.length],
      ['Categories', categories.value.length],
      ['Completed payments', completedPayments.value.length],
      ['Pending payments', pendingPayments.value.length],
      ['Total revenue', formatMoney(totalRevenue.value)],
    ]),
    csvSection('COURSE REPORT', [
      ['Course', 'Instructor', 'Category', 'Price', 'Status'],
      ...courses.value.map((course) => [
        course.title,
        getInstructorName(course),
        course.category?.name || '-',
        formatMoney(course.price),
        course.is_published ? 'Published' : 'Draft',
      ]),
    ]),
    csvSection('PAYMENT REPORT', [
      ['Student', 'Course', 'Amount', 'Status', 'Date'],
      ...payments.value.map((payment) => [
        getPaymentStudentName(payment),
        payment.course.title,
        formatMoney(payment.amount),
        payment.status,
        formatDate(payment.created_at),
      ]),
    ]),
  ]

  const csv = sections.join('\n\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `learndee-admin-report-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const printReport = () => {
  document.body.classList.add('printing-admin-report')
  window.print()

  window.setTimeout(() => {
    document.body.classList.remove('printing-admin-report')
  }, 300)
}

const fetchAdminData = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const [userList, courseList, categoryList, paymentList] = await Promise.all([
      getUsers(),
      getMyCourses(),
      getCategories(),
      getMyPayments(),
    ])

    users.value = userList
    courses.value = courseList
    categories.value = categoryList
    payments.value = paymentList
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ໂຫຼດຂໍ້ມູນ Admin ບໍ່ສຳເລັດ'
  } finally {
    isLoading.value = false
  }
}

const handlePaymentStatus = async (paymentId: string, status: PaymentStatus) => {
  try {
    updatingId.value = paymentId
    successMessage.value = ''
    errorMessage.value = ''

    const updated = await updatePaymentStatus(paymentId, status)
    const index = payments.value.findIndex((payment) => payment.payment_id === paymentId)

    if (index >= 0) {
      payments.value[index] = updated
    }

    successMessage.value = 'ອັບເດດ payment ແລ້ວ'
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ອັບເດດ payment ບໍ່ສຳເລັດ'
  } finally {
    updatingId.value = ''
  }
}

const handleDeletePayment = async (payment: MyPayment) => {
  const confirmed = window.confirm(`ຢືນຢັນລົບປະຫວັດການຊຳລະເງິນຂອງ "${payment.course.title}" ແທ້ບໍ?`)

  if (!confirmed) return

  try {
    updatingId.value = payment.payment_id
    successMessage.value = ''
    errorMessage.value = ''

    await deletePayment(payment.payment_id)
    payments.value = payments.value.filter((item) => item.payment_id !== payment.payment_id)
    successMessage.value = 'ລົບ payment ແລ້ວ'
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ລົບ payment ບໍ່ສຳເລັດ'
  } finally {
    updatingId.value = ''
  }
}

const handleDeleteCourse = async (course: Course) => {
  const confirmed = window.confirm(`ຢືນຢັນລົບຄອສ "${course.title}" ແທ້ບໍ?`)

  if (!confirmed) return

  try {
    updatingId.value = course.course_id
    successMessage.value = ''
    errorMessage.value = ''

    await deleteCourse(course.course_id)
    courses.value = courses.value.filter((item) => item.course_id !== course.course_id)
    successMessage.value = 'ລົບຄອສແລ້ວ'
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ລົບຄອສບໍ່ສຳເລັດ'
  } finally {
    updatingId.value = ''
  }
}

const handleToggleUserActive = async (user: AppUser) => {
  if (user.user_id === authStore.user?.id) {
    errorMessage.value = 'You cannot ban your own admin account.'
    return
  }

  try {
    updatingId.value = user.user_id
    successMessage.value = ''
    errorMessage.value = ''

    const updated = await updateUser(user.user_id, { is_active: !user.is_active })
    const index = users.value.findIndex((item) => item.user_id === user.user_id)

    if (index >= 0) {
      users.value[index] = updated
    }

    successMessage.value = updated.is_active ? 'User enabled.' : 'User banned.'
  } catch (error) {
    console.log(error)
    errorMessage.value = 'Update user status failed.'
  } finally {
    updatingId.value = ''
  }
}

const resetCategoryForm = () => {
  categoryForm.value = { name: '', description: '', icon: '📚' }
  editingCategoryId.value = ''
}

const startEditCategory = (category: Category) => {
  editingCategoryId.value = category.category_id
  categoryForm.value = {
    name: category.name,
    description: category.description || '',
    icon: category.icon || '📚',
  }
}

const handleSaveCategory = async () => {
  const name = categoryForm.value.name.trim()

  if (!name) {
    errorMessage.value = 'Category name is required.'
    return
  }

  try {
    updatingId.value = editingCategoryId.value || 'category-create'
    successMessage.value = ''
    errorMessage.value = ''

    if (editingCategoryId.value) {
      const updated = await updateCategory(editingCategoryId.value, {
        name,
        description: categoryForm.value.description?.trim(),
        icon: categoryForm.value.icon?.trim() || '📚',
      })
      const index = categories.value.findIndex((category) => {
        return category.category_id === updated.category_id
      })

      if (index >= 0) {
        categories.value[index] = updated
      }

      successMessage.value = 'Category updated.'
    } else {
      const created = await createCategory({
        name,
        description: categoryForm.value.description?.trim(),
        icon: categoryForm.value.icon?.trim() || '📚',
      })
      categories.value.unshift(created)
      successMessage.value = 'Category created.'
    }

    resetCategoryForm()
  } catch (error) {
    console.log(error)
    errorMessage.value = 'Save category failed. Check duplicate name or server error.'
  } finally {
    updatingId.value = ''
  }
}

const handleDeleteCategory = async (category: Category) => {
  const confirmed = window.confirm(`Delete category "${category.name}"?`)

  if (!confirmed) return

  try {
    updatingId.value = category.category_id
    successMessage.value = ''
    errorMessage.value = ''

    await deleteCategory(category.category_id)
    categories.value = categories.value.filter((item) => item.category_id !== category.category_id)
    successMessage.value = 'Category deleted.'

    if (editingCategoryId.value === category.category_id) {
      resetCategoryForm()
    }
  } catch (error) {
    console.log(error)
    errorMessage.value = 'Delete category failed. This category may still have courses.'
  } finally {
    updatingId.value = ''
  }
}

const handleApproveInstructor = async (user: AppUser) => {
  try {
    updatingId.value = user.user_id
    successMessage.value = ''
    errorMessage.value = ''

    const updated = await updateUser(user.user_id, { is_active: true, role: 'instructor' })
    const index = users.value.findIndex((item) => item.user_id === user.user_id)

    if (index >= 0) {
      users.value[index] = updated
    }

    successMessage.value = 'ອະນຸມັດຜູ້ສອນແລ້ວ'
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ອະນຸມັດຜູ້ສອນບໍ່ສຳເລັດ'
  } finally {
    updatingId.value = ''
  }
}

const handleRejectInstructor = async (user: AppUser) => {
  try {
    updatingId.value = user.user_id
    successMessage.value = ''
    errorMessage.value = ''

    const updated = await updateUser(user.user_id, { is_active: true, role: 'student' })
    const index = users.value.findIndex((item) => item.user_id === user.user_id)

    if (index >= 0) {
      users.value[index] = updated
    }

    successMessage.value = 'ປະຕິເສດຄຳຂໍເປັນຜູ້ສອນແລ້ວ'
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ປະຕິເສດບໍ່ສຳເລັດ'
  } finally {
    updatingId.value = ''
  }
}

onMounted(() => {
  fetchAdminData()
})
</script>

<template>
  <section class="mx-auto max-w-[1700px] px-8 py-8 lg:px-20 2xl:px-28">
    <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div class="flex items-center gap-4">
        <img
          v-if="avatarUrl"
          :src="resolveFileUrl(avatarUrl)"
          :alt="displayName"
          class="h-14 w-14 rounded-full object-cover ring-4 ring-white shadow-sm"
        />
        <div
          v-else
          class="grid h-14 w-14 place-items-center rounded-full bg-[#142b63] text-base font-black text-white"
        >
          {{ avatarText }}
        </div>

        <div>
          <h1 class="text-3xl font-black text-[#0f1f4d]">ແຜງຄວບຄຸມ Admin</h1>
          <p class="mt-2 text-sm font-medium text-slate-500">
            ຍິນດີຕ້ອນຮັບ, {{ displayName }} - ຈັດການລະບົບ LearnDee
          </p>
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <RouterLink
          to="/payments"
          class="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#142b63] shadow-sm transition hover:border-[#142b63]"
        >
          ຈັດການ payment
        </RouterLink>

        <RouterLink
          to="/courses/create"
          class="rounded-xl bg-[#142b63] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0e214d]"
        >
          + ສ້າງຄອສໃໝ່
        </RouterLink>
      </div>
    </div>

    <p
      v-if="errorMessage"
      class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600"
    >
      {{ errorMessage }}
    </p>

    <p
      v-if="successMessage"
      class="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700"
    >
      {{ successMessage }}
    </p>

    <p
      v-if="isLoading"
      class="mt-8 rounded-2xl bg-white px-5 py-8 text-center text-sm font-bold text-slate-500"
    >
      Loading admin dashboard...
    </p>

    <template v-else>
      <div class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <article class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div class="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-xl">👥</div>
          <p class="mt-4 text-3xl font-black text-[#0f1f4d]">{{ activeUsersCount }}</p>
          <p class="mt-2 text-sm font-bold text-slate-500">ຜູ້ໃຊ້ທີ່ active</p>
        </article>

        <article class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div class="grid h-10 w-10 place-items-center rounded-xl bg-[#f5a400]/10 text-xl">📖</div>
          <p class="mt-4 text-3xl font-black text-[#0f1f4d]">{{ courses.length }}</p>
          <p class="mt-2 text-sm font-bold text-slate-500">ຄອສທັ້ງໝົດ</p>
        </article>

        <article class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div class="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-xl">💵</div>
          <p class="mt-4 text-3xl font-black text-[#0f1f4d]">
            {{ formatShortMoney(totalRevenue) }}
          </p>
          <p class="mt-2 text-sm font-bold text-slate-500">ລາຍຮັບທີ່ອະນຸມັດ</p>
        </article>

        <article class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div class="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-xl">🛡️</div>
          <p class="mt-4 text-3xl font-black text-[#0f1f4d]">{{ pendingPayments.length }}</p>
          <p class="mt-2 text-sm font-bold text-slate-500">payment ລໍຖ້າ</p>
        </article>
      </div>

      <div class="mt-8 inline-flex rounded-2xl bg-slate-200 p-1">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="rounded-xl px-4 py-2 text-sm font-bold transition"
          :class="
            activeTab === tab.key
              ? 'bg-white text-[#142b63] shadow-sm'
              : 'text-slate-500 hover:text-[#142b63]'
          "
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <section v-if="activeTab === 'overview'" class="mt-6 grid gap-6 xl:grid-cols-2">
        <article class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-xl font-black text-[#0f1f4d]">ຜູ້ສອນລໍຖ້າອະນຸມັດ</h2>
            <span class="rounded-full bg-red-500 px-3 py-1 text-sm font-black text-white">
              {{ pendingInstructors.length }}
            </span>
          </div>

          <p
            v-if="pendingInstructors.length === 0"
            class="rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500"
          >
            ຍັງບໍ່ມີຜູ້ສອນລໍຖ້າອະນຸມັດ
          </p>

          <div v-else class="space-y-3">
            <div
              v-for="user in pendingInstructors.slice(0, 3)"
              :key="user.user_id"
              class="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3"
            >
              <div class="flex min-w-0 items-center gap-3">
                <div
                  class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-200 text-sm font-black text-[#142b63]"
                >
                  {{ getUserName(user).slice(0, 1).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="truncate font-black text-[#0f1f4d]">{{ getUserName(user) }}</p>
                  <p class="truncate text-sm text-slate-500">{{ user.email }}</p>
                </div>
              </div>

              <div class="flex shrink-0 gap-2">
                <button
                  type="button"
                  :disabled="updatingId === user.user_id"
                  class="rounded-full px-3 py-2 text-sm font-black text-emerald-600 hover:bg-emerald-50 disabled:text-slate-300"
                  @click="handleApproveInstructor(user)"
                >
                  ✓
                </button>
                <button
                  type="button"
                  :disabled="updatingId === user.user_id"
                  class="rounded-full px-3 py-2 text-sm font-black text-red-500 hover:bg-red-50 disabled:text-slate-300"
                  @click="handleRejectInstructor(user)"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </article>

        <article class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 class="mb-5 text-xl font-black text-[#0f1f4d]">ກິດຈະກຳລ່າສຸດ</h2>

          <div class="space-y-5">
            <div v-for="activity in recentActivities" :key="activity.id" class="flex gap-4">
              <div
                class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500"
              >
                ◷
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-black text-[#0f1f4d]">{{ activity.title }}</p>
                <p class="mt-1 truncate text-sm text-slate-500">{{ activity.detail }}</p>
              </div>
              <p class="shrink-0 text-sm text-slate-500">{{ activity.time }}</p>
            </div>
          </div>
        </article>
      </section>

      <section
        v-else-if="activeTab === 'users'"
        class="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
      >
        <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-xl font-black text-[#0f1f4d]">Users</h2>
            <p class="mt-1 text-sm font-bold text-slate-500">
              {{ users.length }} total · {{ studentsCount }} students · {{ instructors.length }} instructors
            </p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr class="border-b border-slate-100 text-xs uppercase text-slate-400">
                <th class="py-3 pr-4">User</th>
                <th class="py-3 pr-4">Role</th>
                <th class="py-3 pr-4">Status</th>
                <th class="py-3 pr-4">Joined</th>
                <th class="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.user_id" class="border-b border-slate-50">
                <td class="py-4 pr-4">
                  <p class="font-black text-[#0f1f4d]">{{ getUserName(user) }}</p>
                  <p class="mt-1 text-xs font-medium text-slate-500">{{ user.email }}</p>
                </td>
                <td class="py-4 pr-4">
                  <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-[#142b63]">
                    {{ user.role }}
                  </span>
                </td>
                <td class="py-4 pr-4">
                  <span
                    class="rounded-full px-3 py-1 text-xs font-black"
                    :class="user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'"
                  >
                    {{ user.is_active ? 'Active' : 'Banned / inactive' }}
                  </span>
                </td>
                <td class="py-4 pr-4 text-slate-500">{{ formatDate(user.created_at) }}</td>
                <td class="py-4 text-right">
                  <button
                    type="button"
                    :disabled="updatingId === user.user_id || user.user_id === authStore.user?.id"
                    class="rounded-xl border px-4 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                    :class="
                      user.is_active
                        ? 'border-red-200 text-red-500 hover:bg-red-50'
                        : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                    "
                    @click="handleToggleUserActive(user)"
                  >
                    {{ user.is_active ? 'Ban' : 'Unban' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section
        v-else-if="activeTab === 'courses'"
        class="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
      >
        <div class="mb-5 flex items-center justify-between">
          <h2 class="text-xl font-black text-[#0f1f4d]">ຄອສທັ້ງໝົດ</h2>
          <p class="text-sm font-bold text-slate-500">{{ courses.length }} ຄອສ</p>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <article
            v-for="course in courses"
            :key="course.course_id"
            class="rounded-xl border border-slate-100 bg-slate-50 p-4"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="font-black text-[#0f1f4d]">{{ course.title }}</h3>
                <p class="mt-1 text-sm text-slate-500">ຜູ້ສອນ: {{ getInstructorName(course) }}</p>
                <p class="mt-2 text-sm font-black text-[#f5a400]">
                  {{ formatMoney(course.price) }}
                </p>
              </div>

              <span
                class="rounded-full px-3 py-1 text-xs font-black"
                :class="
                  course.is_published
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-200 text-slate-500'
                "
              >
                {{ course.is_published ? 'Published' : 'Draft' }}
              </span>
            </div>

            <div class="mt-4 flex gap-3">
              <RouterLink
                :to="`/courses/${course.course_id}`"
                class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#142b63]"
              >
                ເບິ່ງ
              </RouterLink>
              <RouterLink
                :to="`/courses/${course.course_id}/edit`"
                class="rounded-xl bg-[#142b63] px-4 py-2 text-sm font-bold text-white"
              >
                ແກ້ໄຂ
              </RouterLink>
              <button
                type="button"
                :disabled="updatingId === course.course_id"
                class="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50 disabled:text-slate-400"
                @click="handleDeleteCourse(course)"
              >
                ລົບ
              </button>
            </div>
          </article>
        </div>
      </section>

      <section
        v-else-if="activeTab === 'categories'"
        class="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]"
      >
        <article class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-black text-[#0f1f4d]">
            {{ editingCategoryId ? 'Edit category' : 'Create category' }}
          </h2>

          <div class="mt-5 space-y-4">
            <label class="block">
              <span class="text-sm font-black text-slate-600">Icon</span>
              <input
                v-model="categoryForm.icon"
                type="text"
                maxlength="4"
                class="mt-2 w-24 rounded-xl border border-slate-200 px-4 py-3 text-center text-xl font-bold outline-none transition focus:border-[#142b63]"
                placeholder="📚"
              />
              <span class="mt-1 block text-xs font-bold text-slate-400">
                Use one emoji, for example 🌐 🎨 💼
              </span>
            </label>

            <label class="block">
              <span class="text-sm font-black text-slate-600">Name</span>
              <input
                v-model="categoryForm.name"
                type="text"
                class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none transition focus:border-[#142b63]"
                placeholder="Programming"
              />
            </label>

            <label class="block">
              <span class="text-sm font-black text-slate-600">Description</span>
              <textarea
                v-model="categoryForm.description"
                rows="4"
                class="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none transition focus:border-[#142b63]"
                placeholder="Short category description"
              ></textarea>
            </label>

            <div class="flex gap-3">
              <button
                type="button"
                :disabled="updatingId === 'category-create' || updatingId === editingCategoryId"
                class="rounded-xl bg-[#142b63] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0e214d] disabled:bg-slate-400"
                @click="handleSaveCategory"
              >
                {{ editingCategoryId ? 'Save changes' : 'Create' }}
              </button>

              <button
                v-if="editingCategoryId"
                type="button"
                class="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-[#142b63] transition hover:border-[#142b63]"
                @click="resetCategoryForm"
              >
                Cancel
              </button>
            </div>
          </div>
        </article>

        <article class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-xl font-black text-[#0f1f4d]">Categories</h2>
            <p class="text-sm font-bold text-slate-500">{{ categories.length }} items</p>
          </div>

          <div class="space-y-3">
            <p
              v-if="categories.length === 0"
              class="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500"
            >
              No categories yet.
            </p>

            <div
              v-for="category in categories"
              :key="category.category_id"
              class="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div class="flex min-w-0 items-start gap-3">
                <span
                  class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-xl shadow-sm"
                >
                  {{ category.icon || '📚' }}
                </span>

                <div class="min-w-0">
                  <h3 class="font-black text-[#0f1f4d]">{{ category.name }}</h3>
                  <p class="mt-1 line-clamp-2 text-sm text-slate-500">
                    {{ category.description || 'No description' }}
                  </p>
                  <p class="mt-1 text-xs font-bold text-slate-400">
                    {{ category.course_count ?? 0 }} courses
                  </p>
                </div>
              </div>

              <div class="flex shrink-0 gap-3">
                <button
                  type="button"
                  class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-[#142b63] transition hover:border-[#142b63]"
                  @click="startEditCategory(category)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  :disabled="updatingId === category.category_id"
                  class="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-black text-red-500 transition hover:bg-red-50 disabled:text-slate-400"
                  @click="handleDeleteCategory(category)"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section
        v-else-if="activeTab === 'instructors'"
        class="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
      >
        <div class="mb-5 flex items-center justify-between">
          <h2 class="text-xl font-black text-[#0f1f4d]">ຜູ້ສອນລໍຖ້າອະນຸມັດ</h2>
          <p class="text-sm font-bold text-slate-500">{{ pendingInstructors.length }} ຄົນ</p>
        </div>

        <p
          v-if="pendingInstructors.length === 0"
          class="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500"
        >
          ຍັງບໍ່ມີຄຳຂໍຜູ້ສອນ
        </p>

        <div v-else class="space-y-3">
          <div
            v-for="user in pendingInstructors"
            :key="user.user_id"
            class="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 class="font-black text-[#0f1f4d]">{{ getUserName(user) }}</h3>
              <p class="mt-1 text-sm text-slate-500">{{ user.email }}</p>
              <p class="mt-1 text-xs font-bold text-slate-400">ສະຖານະ: inactive instructor</p>
            </div>

            <div class="flex gap-3">
              <button
                type="button"
                :disabled="updatingId === user.user_id"
                class="rounded-xl bg-[#142b63] px-4 py-2 text-sm font-bold text-white disabled:bg-slate-400"
                @click="handleApproveInstructor(user)"
              >
                ອະນຸມັດ
              </button>
              <button
                type="button"
                :disabled="updatingId === user.user_id"
                class="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-500 disabled:text-slate-400"
                @click="handleRejectInstructor(user)"
              >
                ປະຕິເສດ
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        v-else-if="activeTab === 'payments'"
        class="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
      >
        <div class="mb-5 flex items-center justify-between">
          <h2 class="text-xl font-black text-[#0f1f4d]">ປະຫວັດການຊຳລະເງິນ</h2>
          <p class="text-sm font-bold text-slate-500">{{ payments.length }} ລາຍການ</p>
        </div>

        <div class="space-y-3">
          <article
            v-for="payment in payments"
            :key="payment.payment_id"
            class="grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 lg:grid-cols-[1fr_auto_auto]"
          >
            <div>
              <h3 class="font-black text-[#0f1f4d]">{{ payment.course.title }}</h3>
              <p class="mt-1 text-sm text-slate-500">
                ນັກຮຽນ: {{ getPaymentStudentName(payment) }}
              </p>
            </div>

            <div class="text-sm">
              <p class="font-black text-[#f5a400]">{{ formatMoney(payment.amount) }}</p>
              <p class="mt-1 text-slate-500">{{ formatDate(payment.created_at) }}</p>
              <a
                v-if="payment.slip_url"
                :href="resolveFileUrl(payment.slip_url)"
                target="_blank"
                rel="noreferrer"
                class="mt-2 inline-flex text-xs font-black text-[#142b63] underline"
              >
                View slip
              </a>
            </div>

            <div class="flex items-center gap-3">
              <span
                class="rounded-full px-3 py-1 text-xs font-black"
                :class="statusClass[payment.status]"
              >
                {{ statusLabel[payment.status] }}
              </span>

              <template v-if="payment.status === 'pending'">
                <button
                  type="button"
                  :disabled="updatingId === payment.payment_id"
                  class="rounded-xl bg-[#142b63] px-3 py-2 text-sm font-bold text-white disabled:bg-slate-400"
                  @click="handlePaymentStatus(payment.payment_id, 'completed')"
                >
                  ອະນຸມັດ
                </button>
                <button
                  type="button"
                  :disabled="updatingId === payment.payment_id"
                  class="rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-500 disabled:text-slate-400"
                  @click="handlePaymentStatus(payment.payment_id, 'failed')"
                >
                  ປະຕິເສດ
                </button>
              </template>

              <button
                type="button"
                :disabled="updatingId === payment.payment_id"
                class="rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50 disabled:text-slate-400"
                @click="handleDeletePayment(payment)"
              >
                ລົບ
              </button>
            </div>
          </article>
        </div>
      </section>

      <section v-else id="admin-report-print" class="mt-6 space-y-7">
        <div class="report-actions flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <label class="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
            <svg class="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
              <path d="M14 3v5h5M8 13h8M8 17h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            ປະເພດລາຍງານ:
            <select
              v-model="selectedReportType"
              class="min-w-[230px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none transition focus:border-[#142b63] focus:ring-2 focus:ring-[#142b63]/15"
            >
              <option v-for="report in reportTypes" :key="report.key" :value="report.key">
                {{ report.label }}
              </option>
            </select>
          </label>

          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0f172a] shadow-sm transition hover:border-[#142b63]"
              @click="exportReportCsv"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3v11m0 0 4-4m-4 4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              Export CSV
            </button>

            <button
              type="button"
              class="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0f172a] shadow-sm transition hover:border-[#142b63]"
              @click="printReport"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4a2 2 0 0 1-2 2h-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M7 14h10v7H7z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
              </svg>
              ພິມ
            </button>
          </div>
        </div>

        <article class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div class="grid grid-cols-[1.5fr_0.7fr_0.6fr_0.6fr] border-b border-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-500">
            <p>ຕົວຊີ້ວັດ</p>
            <p>ຄ່າປັດຈຸບັນ</p>
            <p>ເຕີບໂຕ</p>
            <p>ສະຖານະ</p>
          </div>

          <div>
            <div
              v-for="row in reportRows"
              :key="`${selectedReportType}-${row.metric}`"
              class="grid grid-cols-[1.5fr_0.7fr_0.6fr_0.6fr] items-center border-b border-slate-200 px-5 py-5 last:border-b-0"
            >
              <p class="font-bold text-slate-950">{{ row.metric }}</p>
              <p class="font-number text-base font-bold text-slate-950">{{ row.current }}</p>
              <p
                class="text-sm font-medium"
                :class="row.tone === 'negative' ? 'text-red-500' : row.tone === 'neutral' ? 'text-slate-500' : 'text-emerald-600'"
              >
                {{ row.tone === 'negative' ? '↘' : '↗' }} {{ row.growth }}
              </p>
              <p>
                <span
                  class="inline-flex rounded-full border px-3 py-1 text-xs font-bold"
                  :class="
                    row.tone === 'negative'
                      ? 'border-red-100 bg-red-50 text-red-600'
                      : row.tone === 'neutral'
                        ? 'border-slate-200 bg-white text-slate-600'
                        : 'border-slate-200 bg-white text-slate-950'
                  "
                >
                  {{ row.status }}
                </span>
              </p>
            </div>
          </div>
        </article>

      </section>
    </template>
  </section>
</template>

<style scoped>
@media print {
  @page {
    size: A4;
    margin: 12mm;
  }

  :global(body.printing-admin-report *) {
    visibility: hidden !important;
  }

  :global(body.printing-admin-report #admin-report-print),
  :global(body.printing-admin-report #admin-report-print *) {
    visibility: visible !important;
  }

  .report-actions {
    display: none !important;
  }

  .report-scroll {
    overflow: visible !important;
  }

  .report-scroll table {
    min-width: 0 !important;
    width: 100% !important;
  }

  #admin-report-print {
    position: absolute;
    inset: 0;
    margin: 0 !important;
    width: 100%;
  }

  #admin-report-print article {
    box-shadow: none !important;
    break-inside: avoid;
  }

  #admin-report-print table {
    font-size: 11px;
  }

  #admin-report-print th,
  #admin-report-print td {
    padding: 7px 8px !important;
  }
}
</style>
