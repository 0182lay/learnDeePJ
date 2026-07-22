<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getCategories } from '../api/categoryApi'
import { getCourseById, updateCourse, uploadCourseCover } from '../api/courseApi'
import {
  createLesson,
  deleteLessonFile,
  deleteLesson,
  getLessonsByCourseId,
  updateLesson,
  uploadLessonFile,
} from '../api/lessonApi'
import {
  createQuiz,
  deleteQuiz,
  getQuizByLessonId,
  updateQuiz,
  type QuizQuestion,
} from '../api/quizApi'
import CourseInfoForm from '../components/create-course/CourseInfoForm.vue'
import CourseTabs from '../components/create-course/CourseTabs.vue'
import LessonsPanel from '../components/create-course/LessonsPanel.vue'
import type { Category } from '../types/category'
import type { CourseForm, CreateCourseTab, DraftLesson, DraftQuizQuestion } from '../types/createCourse'
import type { Lesson } from '../types/lesson'

const route = useRoute()
const courseId = computed(() => String(route.params.courseId || ''))

const categories = ref<Category[]>([])
const lessons = ref<DraftLesson[]>([])
const activeTab = ref<CreateCourseTab>('info')
const selectedLessonId = ref(1)
const isLoading = ref(false)
const isSaving = ref(false)
const isUploadingCover = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const localCoverPreview = ref('')
const isPublished = ref(false)

const form = ref<CourseForm>({
  category_id: '',
  title: '',
  description: '',
  price: '0',
  thumbnail_url: '',
  level: 'beginner',
})

const coverPreview = computed(() => {
  return localCoverPreview.value || form.value.thumbnail_url.trim()
})

const selectedLesson = computed(() => {
  return lessons.value.find((lesson) => lesson.id === selectedLessonId.value)
})

const hasLessonContent = (lesson: DraftLesson) => {
  const hasExistingFile = lesson.existingFiles.length > 0
  const hasNewFile = Boolean(lesson.videoFile || lesson.imageFile || lesson.documentFile)
  const hasExercise = lesson.questions.some((question) => {
    return question.question.trim() && question.options.some((option) => option.trim())
  })

  return Boolean(lesson.title.trim() && (lesson.description.trim() || hasExistingFile || hasNewFile || hasExercise))
}

const publishChecks = computed(() => {
  return [
    { label: 'ມີຊື່ຄອສ', done: Boolean(form.value.title.trim()) },
    { label: 'ເລືອກໝວດໝູ່', done: Boolean(form.value.category_id) },
    { label: 'ມີຮູບປົກ', done: Boolean(form.value.thumbnail_url.trim()) },
    { label: 'ມີບົດຮຽນຢ່າງໜ້ອຍ 1 ບົດ', done: lessons.value.some(hasLessonContent) },
  ]
})

const canPublish = computed(() => publishChecks.value.every((item) => item.done))

const createEmptyQuestion = () => ({
  id: Date.now(),
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
})

const createEmptyLesson = (id: number): DraftLesson => ({
  id,
  quizId: undefined,
  title: '',
  type: 'video',
  duration: '',
  durationSeconds: 0,
  description: '',
  isFreePreview: false,
  isLastLesson: false,
  videoFile: null,
  videoPreviewUrl: '',
  videoName: '',
  imageFile: null,
  imagePreviewUrl: '',
  imageName: '',
  documentFile: null,
  documentName: '',
  existingFiles: [],
  questions: [createEmptyQuestion()],
})

const formatDuration = (seconds: number | null | undefined) => {
  if (!seconds) return ''

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

const mapLessonToDraft = (lesson: Lesson, index: number): DraftLesson => {
  const firstFile = lesson.files?.[0]

  return {
    id: index + 1,
    lessonId: lesson.lesson_id,
    quizId: undefined,
    title: lesson.title,
    type: lesson.lesson_type || firstFile?.file_type || 'video',
    duration: formatDuration(firstFile?.duration_seconds),
    durationSeconds: firstFile?.duration_seconds || 0,
    description: lesson.description || '',
    isFreePreview: lesson.is_free_preview,
    isLastLesson: lesson.is_last_lesson || false,
    videoFile: null,
    videoPreviewUrl: '',
    videoName: firstFile?.file_type === 'video' ? firstFile.original_name : '',
    imageFile: null,
    imagePreviewUrl: '',
    imageName: firstFile?.file_type === 'image' ? firstFile.original_name : '',
    documentFile: null,
    documentName: firstFile?.file_type === 'document' ? firstFile.original_name : '',
    existingFiles: lesson.files || [],
    questions: [createEmptyQuestion()],
  }
}

const mapQuizQuestionToDraft = (question: QuizQuestion, index: number): DraftQuizQuestion => {
  const options = [...question.options]

  while (options.length < 4) {
    options.push('')
  }

  const correctIndex = options.findIndex((option) => option === question.correct_answer)

  return {
    id: Date.now() + index,
    questionId: question.question_id,
    question: question.question_text,
    options: options.slice(0, 4),
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  }
}

const attachQuizToDraftLesson = async (lesson: DraftLesson) => {
  if (!lesson.lessonId) return lesson

  try {
    const quiz = await getQuizByLessonId(lesson.lessonId)

    lesson.quizId = quiz.quiz_id
    lesson.type = 'exercise'
    lesson.questions = quiz.questions.length
      ? quiz.questions.map(mapQuizQuestionToDraft)
      : [createEmptyQuestion()]
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) {
      throw error
    }
  }

  return lesson
}

const wait = (milliseconds: number) => {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
}

const loadEditData = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const [course, categoryList, lessonList] = await Promise.all([
      getCourseById(courseId.value),
      getCategories(),
      getLessonsByCourseId(courseId.value),
    ])

    categories.value = categoryList
    form.value = {
      category_id: course.category.category_id,
      title: course.title,
      description: course.description || '',
      price: course.price,
      thumbnail_url: course.thumbnail_url || '',
      level: course.level || 'beginner',
    }
    isPublished.value = course.is_published

    lessons.value = await Promise.all(lessonList.map(mapLessonToDraft).map(attachQuizToDraftLesson))

    if (lessons.value.length === 0) {
      lessons.value = [createEmptyLesson(1)]
    }

    selectedLessonId.value = lessons.value[0]?.id || 1
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ໂຫຼດຂໍ້ມູນຄອສບໍ່ສຳເລັດ'
  } finally {
    isLoading.value = false
  }
}

const handleCoverFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  try {
    isUploadingCover.value = true
    errorMessage.value = ''
    localCoverPreview.value = URL.createObjectURL(file)

    const uploaded = await uploadCourseCover(file)
    form.value.thumbnail_url = uploaded.url
  } catch (error) {
    console.log(error)

    if (axios.isAxiosError<{ message: string }>(error)) {
      errorMessage.value = error.response?.data?.message || 'ອັບໂຫຼດຮູບປົກບໍ່ສຳເລັດ'
      return
    }

    errorMessage.value = 'ອັບໂຫຼດຮູບປົກບໍ່ສຳເລັດ'
  } finally {
    isUploadingCover.value = false
  }
}

const removeExistingLessonFiles = async (lesson: DraftLesson) => {
  if (!lesson.lessonId || lesson.existingFiles.length === 0) return

  for (const file of lesson.existingFiles) {
    await deleteLessonFile(lesson.lessonId, file.file_id)
    await wait(200)
  }

  lesson.existingFiles = []
  lesson.videoName = lesson.videoFile ? lesson.videoName : ''
  lesson.imageName = lesson.imageFile ? lesson.imageName : ''
  lesson.documentName = lesson.documentFile ? lesson.documentName : ''
}

const uploadSelectedLessonFile = async (lessonId: string, lesson: DraftLesson) => {
  const hasNewFile = Boolean(lesson.videoFile || lesson.imageFile || lesson.documentFile)

  if (hasNewFile || lesson.type === 'text' || lesson.type === 'exercise') {
    await removeExistingLessonFiles(lesson)
  }

  if (lesson.type === 'video' && lesson.videoFile) {
    await uploadLessonFile(lessonId, lesson.videoFile, lesson.durationSeconds)
    await wait(800)
  }

  if (lesson.type === 'image' && lesson.imageFile) {
    await uploadLessonFile(lessonId, lesson.imageFile)
    await wait(500)
  }

  if (lesson.type === 'document' && lesson.documentFile) {
    await uploadLessonFile(lessonId, lesson.documentFile)
    await wait(500)
  }
}

const getValidQuestions = (lesson: DraftLesson) => {
  return lesson.questions
    .filter((question) => {
      return question.question.trim() && question.options.every((option) => option.trim())
    })
    .map((question, questionIndex) => ({
      question_text: question.question.trim(),
      question_type: 'multiple_choice' as const,
      options: question.options.map((option) => option.trim()),
      correct_answer: (question.options[question.correctIndex] || '').trim(),
      order_index: questionIndex + 1,
    }))
}

const syncLessonQuiz = async (lesson: DraftLesson) => {
  if (!lesson.lessonId) return

  const questions = getValidQuestions(lesson)

  if (lesson.type !== 'exercise' || questions.length === 0) {
    if (lesson.quizId) {
      await deleteQuiz(lesson.lessonId)
      lesson.quizId = undefined
    }

    return
  }

  const payload = {
    title: `Quiz - ${lesson.title.trim() || 'Lesson'}`,
    description: `Questions for ${lesson.title.trim() || 'lesson'}`,
    questions,
  }

  if (lesson.quizId) {
    const quiz = await updateQuiz(lesson.lessonId, payload)
    lesson.quizId = quiz.quiz_id
    return
  }

  try {
    const quiz = await createQuiz(lesson.lessonId, payload)
    lesson.quizId = quiz.quiz_id
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      const quiz = await updateQuiz(lesson.lessonId, payload)
      lesson.quizId = quiz.quiz_id
      return
    }

    throw error
  }
}

const saveLessons = async () => {
  for (const [index, lesson] of lessons.value.entries()) {
    const payload = {
      title: lesson.title.trim() || `ບົດຮຽນ ${index + 1}`,
      lesson_type: lesson.type,
      content: lesson.type === 'text' ? lesson.description : undefined,
      description: lesson.description || undefined,
      order_index: index + 1,
      is_free_preview: lesson.isFreePreview,
      is_last_lesson: lesson.isLastLesson,
    }

    if (lesson.lessonId) {
      await updateLesson(courseId.value, lesson.lessonId, payload)
      await uploadSelectedLessonFile(lesson.lessonId, lesson)
      await syncLessonQuiz(lesson)
      continue
    }

    const createdLesson = await createLesson(courseId.value, payload)
    lesson.lessonId = createdLesson.lesson_id
    await uploadSelectedLessonFile(createdLesson.lesson_id, lesson)
    await syncLessonQuiz(lesson)
  }
}

const handleSaveCourse = async () => {
  try {
    isSaving.value = true
    errorMessage.value = ''
    successMessage.value = ''

    if (isPublished.value && !canPublish.value) {
      errorMessage.value = 'ກະລຸນາເຮັດ checklist ໃຫ້ຄົບກ່ອນເປີດສອນ'
      return
    }

    await updateCourse(courseId.value, {
      category_id: form.value.category_id,
      title: form.value.title,
      description: form.value.description || undefined,
      price: form.value.price,
      thumbnail_url: form.value.thumbnail_url || undefined,
      level: form.value.level,
      is_published: isPublished.value,
    })

    await saveLessons()

    successMessage.value = 'ບັນທຶກການແກ້ໄຂຄອສແລ້ວ'
    await loadEditData()
  } catch (error) {
    console.log(error)

    if (axios.isAxiosError<{ message: string }>(error)) {
      errorMessage.value = error.response?.data?.message || 'ແກ້ໄຂຄອສບໍ່ສຳເລັດ'
      return
    }

    errorMessage.value = 'ແກ້ໄຂຄອສບໍ່ສຳເລັດ'
  } finally {
    isSaving.value = false
  }
}

const handleTogglePublish = async () => {
  if (!isPublished.value && !canPublish.value) {
    errorMessage.value = 'ຍັງເປີດສອນບໍ່ໄດ້: ກວດ checklist ດ້ານລຸ່ມກ່ອນ'
    activeTab.value = 'info'
    return
  }

  isPublished.value = !isPublished.value
  await handleSaveCourse()
}

const addLesson = () => {
  const id = Date.now()
  lessons.value.push(createEmptyLesson(id))
  selectedLessonId.value = id
  activeTab.value = 'lessons'
}

const removeLesson = async (id: number) => {
  if (lessons.value.length === 1) return

  const lesson = lessons.value.find((item) => item.id === id)

  if (lesson?.lessonId) {
    const confirmed = window.confirm(`ຕ້ອງການລົບບົດຮຽນ "${lesson.title}" ແທ້ບໍ?`)
    if (!confirmed) return

    await deleteLesson(courseId.value, lesson.lessonId)
  }

  lessons.value = lessons.value.filter((item) => item.id !== id)

  if (selectedLessonId.value === id) {
    selectedLessonId.value = lessons.value[0]?.id || 1
  }
}

const removeLessonFile = async (fileId: string) => {
  if (!selectedLesson.value?.lessonId) return

  const confirmed = window.confirm('ຕ້ອງການລົບໄຟລ໌ນີ້ອອກຈາກບົດຮຽນແທ້ບໍ?')
  if (!confirmed) return

  await deleteLessonFile(selectedLesson.value.lessonId, fileId)
  selectedLesson.value.existingFiles = selectedLesson.value.existingFiles.filter(
    (file) => file.file_id !== fileId,
  )

  if (!selectedLesson.value.existingFiles.some((file) => file.file_type === 'video')) {
    selectedLesson.value.videoName = ''
  }
  if (!selectedLesson.value.existingFiles.some((file) => file.file_type === 'image')) {
    selectedLesson.value.imageName = ''
  }
  if (!selectedLesson.value.existingFiles.some((file) => file.file_type === 'document')) {
    selectedLesson.value.documentName = ''
  }
}

const updateSelectedLesson = (patch: Partial<DraftLesson>) => {
  if (!selectedLesson.value) return

  Object.assign(selectedLesson.value, patch)
}

const formatVideoDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

const readVideoDuration = (file: File) => {
  return new Promise<number>((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)

    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(video.duration)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('INVALID_VIDEO'))
    }
    video.src = url
  })
}

const handleLessonVideoChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file || !selectedLesson.value) return

  if (!file.type.startsWith('video/')) {
    errorMessage.value = 'ກະລຸນາເລືອກໄຟລ໌ວິດີໂອເທົ່ານັ້ນ'
    input.value = ''
    return
  }

  const duration = await readVideoDuration(file)

  if (duration > 1200) {
    errorMessage.value = 'ວິດີໂອຕ້ອງບໍ່ເກີນ 20 ນາທີ'
    input.value = ''
    return
  }

  errorMessage.value = ''
  selectedLesson.value.videoFile = file
  selectedLesson.value.videoPreviewUrl = URL.createObjectURL(file)
  selectedLesson.value.videoName = file.name
  selectedLesson.value.durationSeconds = Math.round(duration)
  selectedLesson.value.duration = formatVideoDuration(duration)
  selectedLesson.value.type = 'video'
}

const handleLessonImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file || !selectedLesson.value) return

  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'ກະລຸນາເລືອກໄຟລ໌ຮູບພາບເທົ່ານັ້ນ'
    input.value = ''
    return
  }

  errorMessage.value = ''
  selectedLesson.value.imageFile = file
  selectedLesson.value.imagePreviewUrl = URL.createObjectURL(file)
  selectedLesson.value.imageName = file.name
  selectedLesson.value.type = 'image'
}

const handleLessonDocumentChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file || !selectedLesson.value) return

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
  ]
  const maxDocumentSize = 20 * 1024 * 1024

  if (!allowedTypes.includes(file.type)) {
    errorMessage.value = 'ກະລຸນາເລືອກໄຟລ໌ PDF, Word, PowerPoint, Excel, TXT ຫຼື ZIP'
    input.value = ''
    return
  }

  if (file.size > maxDocumentSize) {
    errorMessage.value = 'ເອກະສານຕ້ອງບໍ່ເກີນ 20MB'
    input.value = ''
    return
  }

  errorMessage.value = ''
  selectedLesson.value.documentFile = file
  selectedLesson.value.documentName = file.name
  selectedLesson.value.type = 'document'
}

const addLessonQuestion = () => {
  selectedLesson.value?.questions.push(createEmptyQuestion())
}

const removeLessonQuestion = (id: number) => {
  if (!selectedLesson.value || selectedLesson.value.questions.length === 1) return

  selectedLesson.value.questions = selectedLesson.value.questions.filter((question) => question.id !== id)
}

onMounted(() => {
  loadEditData()
})
</script>

<template>
  <main class="min-h-screen bg-[#fafafa]">
    <section class="mx-auto max-w-[1700px] px-8 py-8 lg:px-20 2xl:px-28">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <RouterLink
            to="/dashboard"
            class="text-sm font-bold text-slate-500 transition hover:text-[#142b63]"
          >
            ← ກັບຄືນແດຊບອດ
          </RouterLink>

          <h1 class="mt-3 text-3xl font-black text-slate-950">ແກ້ໄຂຄອສ</h1>
          <p class="mt-2 text-sm text-slate-500">ແກ້ໄຂຂໍ້ມູນຄອສ ແລະ ບົດຮຽນພື້ນຖານ</p>
        </div>

        <div class="flex gap-3">
          <RouterLink
            :to="`/courses/${courseId}`"
            class="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#142b63] shadow-sm transition hover:border-[#142b63]"
          >
            ເບິ່ງຄອສ
          </RouterLink>

          <button
            type="button"
            :disabled="isSaving || isLoading"
            class="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold shadow-sm transition hover:border-[#142b63] disabled:cursor-not-allowed disabled:text-slate-400"
            :class="isPublished ? 'text-slate-600' : 'text-[#f5a400]'"
            @click="handleTogglePublish"
          >
            {{ isPublished ? 'ປິດການເຜີຍແຜ່' : 'ເຜີຍແຜ່' }}
          </button>

          <button
            type="button"
            :disabled="isSaving || isLoading"
            class="rounded-xl bg-[#142b63] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0e214d] disabled:cursor-not-allowed disabled:bg-slate-400"
            @click="handleSaveCourse"
          >
            {{ isSaving ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກ' }}
          </button>
        </div>
      </div>

      <CourseTabs v-model="activeTab" />

      <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-sm font-black text-[#0f1f4d]">ລາຍການກວດກ່ອນເຜີຍແຜ່</h2>
            <p class="mt-1 text-xs font-medium text-slate-500">
              ເພື່ອບໍ່ໃຫ້ຄອສວ່າງໄປສະແດງໃນໜ້າຄອສ
            </p>
          </div>
          <span
            class="rounded-full px-3 py-1 text-xs font-black"
            :class="canPublish ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f5a400]/10 text-[#9a6500]'"
          >
            {{ canPublish ? 'ພ້ອມເປີດສອນ' : 'ຍັງບໍ່ພ້ອມ' }}
          </span>
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="check in publishChecks"
            :key="check.label"
            class="flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold"
            :class="check.done ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'"
          >
            <span
              class="grid h-6 w-6 place-items-center rounded-full text-xs"
              :class="check.done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'"
            >
              {{ check.done ? '✓' : '!' }}
            </span>
            <span>{{ check.label }}</span>
          </div>
        </div>
      </section>

      <p v-if="isLoading" class="mt-6 rounded-xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
        ກຳລັງໂຫຼດຄອສ...
      </p>

      <p v-if="errorMessage" class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
        {{ errorMessage }}
      </p>

      <p v-if="successMessage" class="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        {{ successMessage }}
      </p>

      <CourseInfoForm
        v-if="!isLoading && activeTab === 'info'"
        v-model:form="form"
        :categories="categories"
        :cover-preview="coverPreview"
        :is-uploading-cover="isUploadingCover"
        @submit="handleSaveCourse"
        @cover-file-change="handleCoverFileChange"
      />

      <LessonsPanel
        v-else-if="!isLoading && activeTab === 'lessons'"
        v-model:selected-lesson-id="selectedLessonId"
        :course-id="courseId"
        :lessons="lessons"
        :selected-lesson="selectedLesson"
        @add-lesson="addLesson"
        @remove-lesson="removeLesson"
        @video-change="handleLessonVideoChange"
        @image-change="handleLessonImageChange"
        @document-change="handleLessonDocumentChange"
        @remove-file="removeLessonFile"
        @update-lesson="updateSelectedLesson"
        @add-question="addLessonQuestion"
        @remove-question="removeLessonQuestion"
      />
    </section>
  </main>
</template>
