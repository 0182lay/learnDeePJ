<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCategories } from '../api/categoryApi'
import { createCourse, uploadCourseCover } from '../api/courseApi'
import { createLesson, uploadLessonFile } from '../api/lessonApi'
import { createQuiz } from '../api/quizApi'
import CourseInfoForm from '../components/create-course/CourseInfoForm.vue'
import CourseSteps from '../components/create-course/CourseSteps.vue'
import CourseTabs from '../components/create-course/CourseTabs.vue'
import LessonsPanel from '../components/create-course/LessonsPanel.vue'
import type { Category } from '../types/category'
import type { CourseForm, CreateCourseTab, DraftLesson } from '../types/createCourse'

const router = useRouter()
const categories = ref<Category[]>([])
const activeTab = ref<CreateCourseTab>('info')
const selectedLessonId = ref(1)
const isLoading = ref(false)
const isSubmitting = ref(false)
const isUploadingCover = ref(false)
const errorMessage = ref('')
const submitMessage = ref('')
const localCoverPreview = ref('')

const form = ref<CourseForm>({
  category_id: '',
  title: '',
  description: '',
  price: '0',
  thumbnail_url: '',
  level: 'beginner',
})

const createEmptyQuestion = () => {
  return {
    id: Date.now(),
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
  }
}

const createEmptyLesson = (id: number): DraftLesson => {
  return {
    id,
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
  }
}

const lessons = ref<DraftLesson[]>([createEmptyLesson(1)])

const coverPreview = computed(() => {
  return localCoverPreview.value || form.value.thumbnail_url.trim()
})

const selectedLesson = computed(() => {
  return lessons.value.find((lesson) => lesson.id === selectedLessonId.value)
})

const hasLessonContent = (lesson: DraftLesson) => {
  const hasNewFile = Boolean(lesson.videoFile || lesson.imageFile || lesson.documentFile)
  const hasExercise = lesson.questions.some((question) => {
    return question.question.trim() && question.options.some((option) => option.trim())
  })

  return Boolean(lesson.title.trim() && (lesson.description.trim() || hasNewFile || hasExercise))
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

const fetchCategories = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    categories.value = await getCategories()

    const firstCategory = categories.value[0]
    if (firstCategory) {
      form.value.category_id = firstCategory.category_id
    }
  } catch (error) {
    console.log(error)
    errorMessage.value = 'ໂຫຼດໝວດໝູ່ບໍ່ສຳເລັດ'
  } finally {
    isLoading.value = false
  }
}

const wait = (milliseconds: number) => {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
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

const submitCourse = async (isPublished = false) => {
  try {
    isSubmitting.value = true
    errorMessage.value = ''
    submitMessage.value = 'ກຳລັງສ້າງຄອສ...'

    if (isPublished && !canPublish.value) {
      errorMessage.value = 'ຍັງເປີດສອນບໍ່ໄດ້: ກວດ checklist ໃຫ້ຄົບກ່ອນ'
      submitMessage.value = ''
      return
    }

    const createdCourse = await createCourse({
      category_id: form.value.category_id,
      title: form.value.title,
      description: form.value.description || undefined,
      price: form.value.price,
      thumbnail_url: form.value.thumbnail_url || undefined,
      level: form.value.level,
      is_published: isPublished,
    })

    const lessonsToCreate = lessons.value.filter((lesson) => {
      return (
        lesson.title.trim() ||
        lesson.description.trim() ||
        lesson.videoFile ||
        lesson.imageFile ||
        lesson.documentFile ||
        getValidQuestions(lesson).length > 0
      )
    })

    const totalVideos = lessonsToCreate.filter((lesson) => lesson.type === 'video' && lesson.videoFile).length
    let uploadedVideoCount = 0

    for (const [index, lesson] of lessonsToCreate.entries()) {
      const questions = getValidQuestions(lesson)

      submitMessage.value = `ກຳລັງສ້າງບົດຮຽນ ${index + 1}/${lessonsToCreate.length}...`

      const createdLesson = await createLesson(createdCourse.course_id, {
        title:
          lesson.title.trim() ||
          (lesson.type === 'exercise' ? `ແບບຝຶກຫັດ ${index + 1}` : `ບົດຮຽນ ${index + 1}`),
        lesson_type: lesson.type,
        content: lesson.type === 'text' ? lesson.description : undefined,
        description: lesson.description || undefined,
        order_index: index + 1,
        is_free_preview: lesson.isFreePreview,
        is_last_lesson: lesson.isLastLesson,
      })

      if (lesson.type === 'video' && lesson.videoFile) {
        uploadedVideoCount += 1
        submitMessage.value = `ກຳລັງອັບໂຫຼດວິດີໂອ ${uploadedVideoCount}/${totalVideos}: ${lesson.videoName}`
        await uploadLessonFile(createdLesson.lesson_id, lesson.videoFile, lesson.durationSeconds)
        await wait(800)
      }

      if (lesson.type === 'image' && lesson.imageFile) {
        submitMessage.value = `ກຳລັງອັບໂຫຼດຮູບ: ${lesson.imageName}`
        await uploadLessonFile(createdLesson.lesson_id, lesson.imageFile)
        await wait(500)
      }

      if (lesson.type === 'document' && lesson.documentFile) {
        submitMessage.value = `ກຳລັງອັບໂຫຼດເອກະສານ: ${lesson.documentName}`
        await uploadLessonFile(createdLesson.lesson_id, lesson.documentFile)
        await wait(500)
      }

      if (questions.length > 0) {
        submitMessage.value = `ກຳລັງສ້າງຄຳຖາມຂອງບົດຮຽນ ${index + 1}/${lessonsToCreate.length}...`
        await createQuiz(createdLesson.lesson_id, {
          title: `Quiz - ${createdLesson.title}`,
          description: `ຄຳຖາມຂອງບົດຮຽນ ${createdLesson.title}`,
          questions,
        })
      }
    }

    router.push('/dashboard')
  } catch (error) {
    console.log(error)

    if (axios.isAxiosError<{ message: string }>(error)) {
      errorMessage.value = error.response?.data?.message || 'ສ້າງຄອສບໍ່ສຳເລັດ'
      return
    }

    errorMessage.value = 'ສ້າງຄອສບໍ່ສຳເລັດ'
  } finally {
    isSubmitting.value = false
    submitMessage.value = ''
  }
}

const handleCoverFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

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

const addLesson = () => {
  const id = Date.now()
  lessons.value.push(createEmptyLesson(id))
  selectedLessonId.value = id
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

  if (!file || !selectedLesson.value) {
    return
  }

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

  if (!file || !selectedLesson.value) {
    return
  }

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

  if (!file || !selectedLesson.value) {
    return
  }

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

const removeLesson = (id: number) => {
  if (lessons.value.length === 1) {
    return
  }

  lessons.value = lessons.value.filter((lesson) => lesson.id !== id)

  if (selectedLessonId.value === id) {
    selectedLessonId.value = lessons.value[0]?.id || 1
  }
}

const updateSelectedLesson = (patch: Partial<DraftLesson>) => {
  if (!selectedLesson.value) return

  Object.assign(selectedLesson.value, patch)
}

const addLessonQuestion = () => {
  if (!selectedLesson.value) {
    return
  }

  selectedLesson.value.questions.push(createEmptyQuestion())
}

const removeLessonQuestion = (id: number) => {
  if (!selectedLesson.value || selectedLesson.value.questions.length === 1) {
    return
  }

  selectedLesson.value.questions = selectedLesson.value.questions.filter((question) => {
    return question.id !== id
  })
}

onMounted(() => {
  fetchCategories()
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

          <h1 class="mt-3 text-3xl font-black text-slate-950">ສ້າງຄອສໃໝ່</h1>
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            :disabled="isSubmitting || categories.length === 0"
            class="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#142b63] shadow-sm transition hover:border-[#142b63]"
            @click="submitCourse(false)"
          >
            ບັນທຶກແບບຮ່າງ
          </button>

          <button
            type="button"
            :disabled="isSubmitting || categories.length === 0"
            class="rounded-xl bg-[#142b63] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0e214d] disabled:cursor-not-allowed disabled:bg-slate-400"
            @click="submitCourse(true)"
          >
            {{ isSubmitting ? 'ກຳລັງສ້າງ...' : 'ເຜີຍແຜ່ຄອສ' }}
          </button>
        </div>
      </div>

      <CourseSteps :lessons-count="lessons.length" />
      <CourseTabs v-model="activeTab" />

      <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-sm font-black text-[#0f1f4d]">Publish checklist</h2>
            <p class="mt-1 text-xs font-medium text-slate-500">
              ຖ້າຈະເປີດສອນ ຄອສຄວນມີຂໍ້ມູນຫຼັກໃຫ້ຄົບກ່ອນ
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
        ກຳລັງໂຫຼດໝວດໝູ່...
      </p>

      <p v-if="errorMessage" class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
        {{ errorMessage }}
      </p>

      <p v-if="submitMessage" class="mt-6 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm">
        {{ submitMessage }}
      </p>

      <CourseInfoForm
        v-if="activeTab === 'info'"
        v-model:form="form"
        :categories="categories"
        :cover-preview="coverPreview"
        :is-uploading-cover="isUploadingCover"
        @submit="submitCourse(false)"
        @cover-file-change="handleCoverFileChange"
      />

      <LessonsPanel
        v-else-if="activeTab === 'lessons'"
        v-model:selected-lesson-id="selectedLessonId"
        :lessons="lessons"
        :selected-lesson="selectedLesson"
        @add-lesson="addLesson"
        @remove-lesson="removeLesson"
        @video-change="handleLessonVideoChange"
        @image-change="handleLessonImageChange"
        @document-change="handleLessonDocumentChange"
        @update-lesson="updateSelectedLesson"
        @add-question="addLessonQuestion"
        @remove-question="removeLessonQuestion"
      />
    </section>
  </main>
</template>
