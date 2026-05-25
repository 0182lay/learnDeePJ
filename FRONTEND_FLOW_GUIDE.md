# ຄູ່ມືເບິ່ງ Flow ຂອງ Frontend

<style>
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap");

body,
body * {
  font-family: "Noto Sans Lao", "Phetsarath OT", "Saysettha OT", sans-serif;
}
</style>

ໄຟລ໌ນີ້ເຮັດໄວ້ໃຫ້ອ່ານເພື່ອເຂົ້າໃຈໂຄດ frontend ຂອງໂປຣເຈັກ LearnDeepJ ແບບມືໃໝ່. ບໍ່ຈຳເປັນຕ້ອງຈື່ທຸກບັນທັດ ໃຫ້ເຂົ້າໃຈວ່າເວລາ user ກົດຫຍັງບາງຢ່າງ ຂໍ້ມູນມັນໄຫຼໄປທາງໃດ.

## ແນວຄິດຫຼັກ

ເວລາອ່ານໄຟລ໌ `.vue` ໃຫ້ແບ່ງເປັນ 3 ສ່ວນ:

```vue
<template>
  ໜ້າຕາເວັບ, ປຸ່ມ, form, ຕາຕະລາງ, card, loop, ເງື່ອນໄຂການສະແດງຜົນ
</template>

<script setup lang="ts">
  logic ຂອງໜ້ານັ້ນ, state, function, API call, router
</script>

<style>
  CSS ຕົກແຕ່ງໜ້າ
</style>
```

ຖ້າໄຟລ໌ຍາວຫຼາຍ ໃຫ້ເລີ່ມອ່ານທີ່ `<script setup>` ກ່ອນ ເພາະບ່ອນນີ້ຈະບອກວ່າ:

- ໜ້ານີ້ເກັບຂໍ້ມູນຫຍັງ
- ກົດປຸ່ມແລ້ວເອີ້ນ function ໃດ
- ໂຫຼດຂໍ້ມູນຈາກ API ໃດ
- ຖ້າສຳເລັດແລ້ວປ່ຽນໜ້າບໍ່
- ຖ້າຜິດພາດແລ້ວສະແດງ error ແນວໃດ

## ຄຳສຳຄັນໃນ Vue ທີ່ຄວນຮູ້

### `ref`

`ref` ໃຊ້ເກັບຄ່າທີ່ປ່ຽນໄດ້ ເຊັ່ນ string, number, boolean, array ຫຼື object ກໍໄດ້.

ຕົວຢ່າງ:

```ts
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
```

ແປແບບງ່າຍ:

```text
email ແມ່ນ state ທີ່ເອົາໄວ້ເກັບ email ຈາກ input
password ແມ່ນ state ທີ່ເອົາໄວ້ເກັບ password
loading ແມ່ນ state ທີ່ບອກວ່າກຳລັງໂຫຼດຢູ່ບໍ່
error ແມ່ນ state ທີ່ເກັບຂໍ້ຄວາມ error
```

ເວລາໃຊ້ໃນ `<script setup>` ຕ້ອງເຂົ້າເຖິງຄ່າດ້ວຍ `.value`

```ts
email.value = 'test@example.com'
loading.value = true
```

ແຕ່ເວລາໃຊ້ໃນ `<template>` ບໍ່ຕ້ອງໃສ່ `.value`

```vue
<input v-model="email" />
<p v-if="error">{{ error }}</p>
```

ຈື່ງ່າຍໆ:

```text
ໃນ script ໃຊ້ .value
ໃນ template ບໍ່ຕ້ອງໃຊ້ .value
```

### `reactive`

`reactive` ໃຊ້ເກັບ object ທີ່ມີຫຼາຍ field ແລະຢາກແກ້ຄ່າຂ້າງໃນໂດຍກົງ.

ຕົວຢ່າງ:

```ts
const form = reactive({
  email: '',
  password: '',
  first_name: '',
  last_name: '',
})
```

ເວລາແກ້ຄ່າ ບໍ່ຕ້ອງໃຊ້ `.value`

```ts
form.email = 'test@example.com'
form.password = '1234'
```

ເໝາະກັບຂໍ້ມູນແບບ form ເພາະລວມຫຼາຍຊ່ອງໄວ້ໃນ object ດຽວ.

ທຽບງ່າຍໆ:

```ts
const email = ref('')
const password = ref('')
```

ກັບ:

```ts
const form = reactive({
  email: '',
  password: '',
})
```

ທັງສອງແບບໃຊ້ໄດ້ ແຕ່ຖ້າຂໍ້ມູນເປັນຊຸດດຽວກັນ ເຊັ່ນ form login/register ໃຊ້ `reactive` ຈະອ່ານງ່າຍກວ່າ.

### `computed`

`computed` ແມ່ນຄ່າທີ່ຄຳນວນຈາກ state ອື່ນ ແລ້ວຈະປ່ຽນເອງເມື່ອ state ຕົ້ນທາງປ່ຽນ.

ຕົວຢ່າງ:

```ts
const firstName = ref('John')
const lastName = ref('Doe')

const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
})
```

ຖ້າ `firstName` ຫຼື `lastName` ປ່ຽນ `fullName` ຈະປ່ຽນຕາມອັດຕະໂນມັດ.

ຕົວຢ່າງທີ່ເຈີບ່ອຍໃນໂປຣເຈັກ:

```ts
const filteredCourses = computed(() => {
  return courses.value.filter((course) => course.category_id === selectedCategory.value)
})
```

ແປວ່າ:

```text
ເອົາ courses ທັງໝົດມາກອງຕາມ category ທີ່ເລືອກ
ຖ້າ courses ປ່ຽນ ຫຼື selectedCategory ປ່ຽນ
filteredCourses ຈະຄຳນວນໃໝ່ເອງ
```

ໃຊ້ `computed` ເມື່ອຂໍ້ມູນນັ້ນບໍ່ຄວນເກັບຊ້ຳ ແຕ່ຄຳນວນໄດ້ຈາກ state ທີ່ມີຢູ່.

### `watch`

`watch` ໃຊ້ເຝົ້າເບິ່ງຄ່າບາງຕົວ. ຖ້າຄ່ານັ້ນປ່ຽນ ໃຫ້ເຮັດຫຍັງບາງຢ່າງ.

ຕົວຢ່າງ:

```ts
watch(searchText, () => {
  loadCourses()
})
```

ແປວ່າ:

```text
ຖ້າ searchText ປ່ຽນ ໃຫ້ເອີ້ນ loadCourses ໃໝ່
```

ອີກຕົວຢ່າງ:

```ts
watch(selectedCategory, (newValue) => {
  console.log('category changed:', newValue)
})
```

ແປວ່າ:

```text
ຖ້າ user ປ່ຽນ category ໃຫ້ເຮັດວຽກໃນ function ນີ້
```

ໃຊ້ `watch` ເມື່ອຢາກໃຫ້ເກີດ side effect ເຊັ່ນ:

- ເອີ້ນ API ໃໝ່
- sync ຄ່າໄປທີ່ URL
- reset form ບາງຢ່າງ
- ບັນທຶກຄ່າລົງ localStorage

ຖ້າແຄ່ຄຳນວນຄ່າໃໝ່ ໃຊ້ `computed` ຈະເໝາະກວ່າ.

### `onMounted`

`onMounted` ແມ່ນ function ທີ່ຈະເຮັດວຽກຕອນ component ຖືກເປີດຂຶ້ນມາບົນໜ້າຈໍຄັ້ງທຳອິດ.

ຕົວຢ່າງ:

```ts
onMounted(async () => {
  courses.value = await getCourses()
})
```

ແປວ່າ:

```text
ພໍເຂົ້າໜ້ານີ້ ໃຫ້ໂຫຼດ courses ຈາກ API ທັນທີ
```

ເຈີບ່ອຍໃນໜ້າທີ່ຕ້ອງໂຫຼດຂໍ້ມູນຕອນເປີດໜ້າ ເຊັ່ນ:

- ໜ້າ Home ໂຫຼດຄອສແນະນຳ
- ໜ້າ Courses ໂຫຼດຄອສທັງໝົດ
- ໜ້າ Course Detail ໂຫຼດຂໍ້ມູນຄອສຕາມ ID
- ໜ້າ Dashboard ໂຫຼດຂໍ້ມູນ user/enrollment/payment

## ສະຫຼຸບວ່າຄວນໃຊ້ຫຍັງ

| ຄຳ | ໃຊ້ຕອນໃດ | ຈື່ງ່າຍໆ |
| --- | --- | --- |
| `ref` | ເກັບຄ່າດ່ຽວໆ ຫຼື state ທົ່ວໄປ | ກ່ອງເກັບຄ່າ |
| `reactive` | ເກັບ object ຫຼາຍ field ເຊັ່ນ form | object ທີ່ແກ້ຄ່າຂ້າງໃນໄດ້ |
| `computed` | ຄຳນວນຄ່າຈາກ state ອື່ນ | ສູດຄຳນວນອັດຕະໂນມັດ |
| `watch` | ເຝົ້າເບິ່ງຄ່າທີ່ປ່ຽນ ແລ້ວສັ່ງໃຫ້ເຮັດວຽກ | ຖ້າຄ່ານີ້ປ່ຽນ ໃຫ້ເຮັດສິ່ງນີ້ |
| `onMounted` | ໂຫຼດຂໍ້ມູນຕອນເຂົ້າໜ້າ | ເປີດໜ້າປຸ໊ບ ເຮັດວຽກປັ໊ບ |

## ວິທີໄລ່ໂຄດ Frontend ແບບ Flow

ຢ່າເລີ່ມຈາກການອ່ານທັງໄຟລ໌. ໃຫ້ເລີ່ມຈາກການຖາມວ່າ user ເຮັດຫຍັງ.

ຕົວຢ່າງຄຳຖາມ:

```text
user ກົດ login ແລ້ວເກີດຫຍັງຂຶ້ນ
user ກົດສ້າງຄອສແລ້ວເກີດຫຍັງຂຶ້ນ
user ກົດສະໝັກຮຽນແລ້ວເກີດຫຍັງຂຶ້ນ
user ກົດອັບໂຫຼດສະລິບແລ້ວເກີດຫຍັງຂຶ້ນ
```

ຈາກນັ້ນໄລ່ຕາມເສັ້ນທາງນີ້:

```text
ໜ້າ Vue
-> function ໃນ script setup
-> store ຖ້າມີ
-> api file
-> backend endpoint
```

## ຕົວຢ່າງ Flow: Login

ເລີ່ມຈາກໜ້າ:

```text
client/src/views/LoginPage.vue
```

ໃຫ້ຫາໃນ `<template>` ວ່າ form submit ໄປທີ່ function ໃດ ເຊັ່ນ:

```vue
<form @submit.prevent="handleLogin">
```

ແປວ່າ:

```text
ພໍກົດ submit ຈະບໍ່ reload ໜ້າເວັບ
ແລ້ວເອີ້ນ function handleLogin
```

ຈາກນັ້ນໄປເບິ່ງໃນ `<script setup>`:

```ts
const handleLogin = async () => {
  ...
}
```

ໃນ function ນີ້ໃຫ້ເບິ່ງ 4 ຢ່າງ:

```text
1. ກ່ອນເອີ້ນ API set loading ບໍ່
2. ສົ່ງ email/password ໄປທີ່ໃດ
3. ຖ້າສຳເລັດ ເຮັດຫຍັງຕໍ່
4. ຖ້າຜິດພາດ catch error ແນວໃດ
```

ເສັ້ນທາງ login ໂດຍລວມ:

```text
LoginPage.vue
-> authStore.ts
-> authApi.ts
-> POST /api/login
-> backend ກວດ email/password
-> frontend ເກັບ token
-> router.push ໄປໜ້າ dashboard ຫຼື home
```

## ຕົວຢ່າງ Flow: Courses Page

ເວລາເປີດໜ້າລາຍການຄອສ ໃຫ້ຫາ:

```ts
onMounted(...)
```

ຖ້າເຈີປະມານນີ້:

```ts
onMounted(async () => {
  courses.value = await getCourses()
})
```

ແປວ່າ:

```text
ພໍເປີດໜ້າ CoursesPage.vue
frontend ເອີ້ນ getCourses()
getCourses ຢູ່ໃນ client/src/api/courseApi.ts
courseApi.ts ຍິງ GET /api/courses
server ສົ່ງລາຍການຄອສກັບມາ
ໜ້າເວັບເອົາ courses ໄປສະແດງໃນ template
```

ຖ້າໃນ template ມີ:

```vue
<CourseCard
  v-for="course in courses"
  :key="course.course_id"
  :course="course"
/>
```

ແປວ່າ:

```text
ວົນ courses ເທື່ອລະຕົວ
ແລ້ວສົ່ງ course ເຂົ້າ component CourseCard ເພື່ອສະແດງເປັນ card
```

## ຕົວຢ່າງ Flow: Course Detail

ເສັ້ນທາງໂດຍລວມ:

```text
CourseDetailPage.vue
-> ອ່ານ courseId ຈາກ route
-> getCourseById(courseId)
-> GET /api/courses/:courseId
-> ເກັບຂໍ້ມູນຄອສລົງ state
-> ສົ່ງຂໍ້ມູນຕໍ່ໃຫ້ component ຍ່ອຍ ເຊັ່ນ lessons, reviews, purchase card
```

ສິ່ງທີ່ຄວນຫາໃນໄຟລ໌:

```ts
useRoute()
route.params.courseId
getCourseById(...)
onMounted(...)
```

ຖ້າເຫັນ `route.params.courseId` ແປວ່າ:

```text
ໜ້ານີ້ດຶງ ID ຈາກ URL ເຊັ່ນ /courses/123
ແລ້ວໃຊ້ 123 ໄປຂໍຂໍ້ມູນ course ຈາກ backend
```

## ຕົວຢ່າງ Flow: Create Course

ເສັ້ນທາງໂດຍລວມ:

```text
CreateCoursePage.vue
-> form ເກັບ title, category, price, lesson
-> createCourse(payload)
-> POST /api/courses
-> upload cover ຖ້າມີໄຟລ໌
-> create lessons ຖ້າມີບົດຮຽນ
-> router.push ໄປໜ້າ dashboard ຫຼື course detail
```

ສິ່ງທີ່ຄວນເບິ່ງ:

```text
state ຂອງ form
function submit
ການເອີ້ນ createCourse
ການສ້າງ payload ວ່າສົ່ງ field ຫຍັງໄປ backend
```

## ຕົວຢ່າງ Flow: Payment

ເສັ້ນທາງໂດຍລວມ:

```text
PaymentDialog.vue
-> user ເລືອກວິທີຊຳລະເງິນ
-> createPayment(courseId, paymentMethod)
-> POST /api/payments
-> user upload slip
-> uploadPaymentSlip(paymentId, file)
-> POST /api/payments/:paymentId/slip
```

ສິ່ງທີ່ຄວນເບິ່ງ:

```text
paymentId ມາຈາກໃດ
file ຖືກ append ເຂົ້າ FormData ແນວໃດ
ຫຼັງ upload ສຳເລັດ ໜ້າເວັບສະແດງສະຖານະຫຍັງ
```

## ເວລາເຈີໄຟລ໌ໃຫຍ່ ໃຫ້ເບິ່ງຕາມລຳດັບນີ້

1. ເບິ່ງຊື່ໄຟລ໌ກ່ອນ ເຊັ່ນ `LoginPage.vue` ແມ່ນໜ້າ login
2. ເປີດ `<script setup>` ກ່ອນ
3. ຫາ `ref`, `reactive` ເພື່ອເບິ່ງ state
4. ຫາ `onMounted` ເພື່ອເບິ່ງວ່າເປີດໜ້າແລ້ວໂຫຼດຫຍັງ
5. ຫາ function ທີ່ຊື່ `handle...`, `load...`, `submit...`, `create...`, `update...`
6. ເບິ່ງວ່າ function ເອີ້ນ API ໃດ
7. ກັບໄປເບິ່ງ `<template>` ວ່າປຸ່ມຫຼື form ເອີ້ນ function ນັ້ນຕອນໃດ

## ຄຳທີ່ຄວນ Search ເວລາອ່ານໂຄດ

```text
ref(
reactive(
computed(
watch(
onMounted(
async
await
try
catch
router.push
useRoute
http.get
http.post
http.patch
http.put
http.delete
```

ຄຳພວກນີ້ຄືຈຸດທີ່ມີ logic ແທ້ໆ.

## ປະໂຫຍກໄວ້ຕອບຕອນ Present

ຖ້າໂດນຖາມວ່າ frontend ເຮັດວຽກແນວໃດ ຕອບໄດ້ປະມານນີ້:

```text
ຝັ່ງ frontend ໃຊ້ Vue 3 ໂດຍແຕ່ລະໜ້າຢູ່ໃນ src/views ແລະແຍກ component ຍ່ອຍໄວ້ໃນ src/components.
logic ຂອງໜ້າຢູ່ໃນ script setup ເຊັ່ນ state, function, lifecycle ແລະການເອີ້ນ API.
ເວລາ user ກົດປຸ່ມຫຼື submit form ຈະເອີ້ນ function ໃນໜ້ານັ້ນ ຈາກນັ້ນ function ຈະເອີ້ນໄຟລ໌ໃນ src/api ເພື່ອສົ່ງ request ໄປ backend.
ຖ້າ backend response ກັບມາ frontend ຈະເອົາຂໍ້ມູນມາເກັບໃນ state ແລ້ວ Vue ຈະ render ໜ້າໃໝ່ໃຫ້ອັດຕະໂນມັດ.
```

ຖ້າໂດນຖາມວ່າ `ref` ແມ່ນຫຍັງ:

```text
ref ແມ່ນ state ແບບ reactive ຂອງ Vue ໃຊ້ເກັບຄ່າທີ່ປ່ຽນແລ້ວໃຫ້ໜ້າເວັບອັບເດດຕາມ ເຊັ່ນ email, loading, error ຫຼື list courses.
```

ຖ້າໂດນຖາມວ່າ `onMounted` ແມ່ນຫຍັງ:

```text
onMounted ແມ່ນ lifecycle ທີ່ເຮັດວຽກຕອນ component ເປີດຂຶ້ນມາຄັ້ງທຳອິດ ໃຊ້ໂຫຼດຂໍ້ມູນເລີ່ມຕົ້ນຈາກ API ເຊັ່ນ ໂຫຼດ courses ຫຼື course detail.
```
