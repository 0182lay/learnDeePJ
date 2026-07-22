<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import axios from 'axios'
import confetti from 'canvas-confetti'
import { API_URL, resolveAssetUrl } from '../api/config'
import { getCourseById } from '../api/courseApi'
import { getMyEnrollments } from '../api/enrollmentApi'
import { getLessonById, getLessonsByCourseId } from '../api/lessonApi'
import { getMyCertificates, issueCertificate } from '../api/certificateApi'
import { getProgress, updateProgress } from '../api/progressApi'
import {
  getQuizByLessonId,
  getQuizResult,
  submitQuiz,
  type Quiz,
  type QuizSubmission,
} from '../api/quizApi'
import type { CourseDetail } from '../types/course'
import type { Lesson } from '../types/lesson'
import type { LearningProgress } from '../types/progress'

const route = useRoute()
const course = ref<CourseDetail | null>(null)
const lesson = ref<Lesson | null>(null)
const lessons = ref<Lesson[]>([])
const quiz = ref<Quiz | null>(null)
const quizAnswerIndexes = ref<Record<string, number>>({})
const quizResult = ref<QuizSubmission | null>(null)
const quizMessage = ref('')
const isSubmittingQuiz = ref(false)
const currentQuizQuestionIndex = ref(0)
const currentEnrollmentId = ref('')
const progressList = ref<LearningProgress[]>([])
const localCompletedLessonIds = ref<string[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const completeMessage = ref('')
const markingLessonId = ref('')
const videoShell = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const videoViewMode = ref<'normal' | 'wide' | 'fullscreen'>('normal')
const isPlaying = ref(false)
const currentTime = ref(0)
const videoDuration = ref(0)
const volume = ref(1)
const isMuted = ref(false)
const playbackRate = ref(1)
const videoQualityMode = ref<'auto' | '480p' | '720p' | '1080p'>('auto')
const openVideoMenu = ref<'quality' | 'speed' | null>(null)

const playbackRateOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

const videoQualityOptions = [
  { value: 'auto', label: 'Auto' },
  { value: '480p', label: '480p' },
  { value: '720p', label: '720p' },
  { value: '1080p', label: '1080p' },
] as const

const courseId = computed(() => route.params.courseId as string)
const lessonId = computed(() => route.params.lessonId as string)

const currentLessonIndex = computed(() => {
  return lessons.value.findIndex((item) => item.lesson_id === lessonId.value)
})

const completedLessonCount = computed(() => {
  return lessons.value.filter((item) => isLessonCompleted(item.lesson_id)).length
})

const progressPercent = computed(() => {
  if (lessons.value.length === 0) return 0
  return Math.round((completedLessonCount.value / lessons.value.length) * 100)
})

const quizScorePercent = computed(() => {
  if (!quizResult.value?.total) return 0
  return Math.round((quizResult.value.score / quizResult.value.total) * 100)
})

const isQuizPassed = computed(() => {
  return quizResult.value ? quizScorePercent.value >= 70 : false
})

const lessonHasQuiz = computed(() => {
  return Boolean(quiz.value && quiz.value.questions.length > 0)
})

const canMarkCurrentLessonComplete = computed(() => {
  return !lessonHasQuiz.value || isQuizPassed.value
})

const hasClaimedCertificate = ref(false)
const isClaimingCertificate = ref(false)

const isLastLesson = computed(() => {
  if (lesson.value?.is_last_lesson) return true
  const hasConfiguredLastLesson = lessons.value.some((l) => l.is_last_lesson)
  if (hasConfiguredLastLesson) {
    return Boolean(lesson.value?.is_last_lesson)
  }
  return lessons.value.length > 0 && currentLessonIndex.value === lessons.value.length - 1
})

const isCourseFinished = computed(() => {
  if (lessons.value.length === 0) return false
  const configuredLastLesson = lessons.value.find((l) => l.is_last_lesson)
  if (configuredLastLesson) {
    return isLessonCompleted(configuredLastLesson.lesson_id)
  }
  return completedLessonCount.value === lessons.value.length
})

const claimCertificate = async () => {
  if (isClaimingCertificate.value) return

  try {
    isClaimingCertificate.value = true
    await issueCertificate(courseId.value)
    hasClaimedCertificate.value = true
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
    })
  } catch (error) {
    console.log(error)
    alert('ຍັງອອກໃບປະກາດບໍ່ໄດ້ ກວດວ່າຮຽນຄົບ ແລະ ຜ່ານ quiz ແລ້ວຫຼືຍັງ')
  } finally {
    isClaimingCertificate.value = false
  }
}

const currentQuizQuestion = computed(() => {
  return quiz.value?.questions[currentQuizQuestionIndex.value] || null
})

const quizQuestionCount = computed(() => {
  return quiz.value?.questions.length || 0
})

const quizAnsweredCount = computed(() => {
  if (!quiz.value) return 0

  return quiz.value.questions.filter((question) => {
    return quizAnswerIndexes.value[question.question_id] !== undefined
  }).length
})

const lessonLayoutClass = computed(() => {
  if (videoViewMode.value === 'wide' || videoViewMode.value === 'fullscreen') {
    return 'grid flex-1 lg:grid-cols-[minmax(0,1fr)]'
  }

  return 'grid flex-1 lg:grid-cols-[minmax(0,1fr)_360px]'
})

const playerHeightClass = computed(() => {
  if (videoViewMode.value === 'fullscreen') return 'min-h-screen'
  if (videoViewMode.value === 'wide') return 'min-h-[calc(100vh-64px)]'
  return 'min-h-[520px]'
})

const videoSizeClass = computed(() => {
  if (videoViewMode.value === 'fullscreen') return 'h-screen max-h-screen'
  if (videoViewMode.value === 'wide') return 'h-full max-h-[calc(100vh-64px)]'
  return 'h-full max-h-[calc(100vh-170px)]'
})

const videoQualityClass = computed(() => {
  if (videoQualityMode.value === '1080p') return 'contrast-[1.08] saturate-[1.08] brightness-[1.02]'
  if (videoQualityMode.value === '720p') return 'contrast-[1.03] saturate-[1.03]'
  if (videoQualityMode.value === '480p') return 'contrast-[0.96] saturate-[0.95] brightness-[0.98]'

  return ''
})

const selectedVideoQualityLabel = computed(() => {
  return (
    videoQualityOptions.find((option) => option.value === videoQualityMode.value)?.label || 'Auto'
  )
})

const videoProgressPercent = computed(() => {
  if (!videoDuration.value) return 0
  return (currentTime.value / videoDuration.value) * 100
})

const videoFile = computed(() => {
  return lesson.value?.files?.find((file) => file.file_type === 'video') || null
})

const imageFile = computed(() => {
  return lesson.value?.files?.find((file) => file.file_type === 'image') || null
})

const documentFile = computed(() => {
  return lesson.value?.files?.find((file) => file.file_type === 'document') || null
})

const getPublicFileUrl = (url: string | undefined) => {
  return resolveAssetUrl(url)
}

const getProtectedLessonFileUrl = (fileId: string | undefined) => {
  const token = localStorage.getItem('token')

  if (!fileId || !token) {
    return ''
  }

  return `${API_URL}/lesson-files/${fileId}/content?token=${encodeURIComponent(token)}`
}

const videoUrl = computed(() => getProtectedLessonFileUrl(videoFile.value?.file_id))

const imageUrl = computed(() => getPublicFileUrl(imageFile.value?.file_url))

const documentUrl = computed(() => getProtectedLessonFileUrl(documentFile.value?.file_id))

const downloadableUrl = computed(() => videoUrl.value || imageUrl.value || documentUrl.value)

const isExercise = computed(() => {
  return lesson.value?.lesson_type === 'exercise'
})

const isTextLesson = computed(() => {
  return lesson.value?.lesson_type === 'text'
})

const getLessonTypeLabel = (item: Lesson | null) => {
  if (item?.lesson_type === 'exercise') return 'ແບບຝຶກຫັດ'
  if (item?.lesson_type === 'document') return 'ເອກະສານ'
  if (item?.lesson_type === 'text') return 'ບົດຄວາມ'
  return 'ວິດີໂອ'
}

const formatDuration = (seconds: number | null | undefined) => {
  if (!seconds) {
    return ''
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

const formatVideoTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '0:00'

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

const isLessonCompleted = (targetLessonId: string) => {
  return (
    localCompletedLessonIds.value.includes(targetLessonId) ||
    progressList.value.some((progress) => {
      return progress.lesson_id === targetLessonId && progress.is_completed
    })
  )
}

const getQuizAnswer = (question: Quiz['questions'][number]) => {
  const selectedIndex = quizAnswerIndexes.value[question.question_id]

  if (selectedIndex === undefined) {
    return ''
  }

  return question.options[selectedIndex] || ''
}

const isQuizOptionSelected = (questionId: string, optionIndex: number) => {
  return quizAnswerIndexes.value[questionId] === optionIndex
}

const hasQuizBeenSubmitted = computed(() => {
  return Boolean(quizResult.value)
})

const isQuizQuestionCorrect = (question: Quiz['questions'][number]) => {
  return getQuizAnswer(question) === question.correct_answer
}

const getQuizOptionClass = (
  question: Quiz['questions'][number],
  option: string,
  optionIndex: number,
) => {
  const isSelected = isQuizOptionSelected(question.question_id, optionIndex)
  const isCorrect = option === question.correct_answer

  if (hasQuizBeenSubmitted.value && isCorrect) {
    return isSelected
      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
      : 'border-slate-200 text-slate-600'
  }

  if (hasQuizBeenSubmitted.value && isSelected && !isCorrect) {
    return 'border-red-300 bg-red-50 text-red-600'
  }

  if (isSelected) {
    return 'border-[#f5a400] bg-[#fff7e8] text-[#142b63]'
  }

  return 'border-slate-200 text-slate-600 hover:border-[#f5a400]'
}

const markCurrentLessonComplete = async () => {
  if (!lesson.value || isLessonCompleted(lesson.value.lesson_id) || markingLessonId.value) {
    return
  }

  const targetLessonId = lesson.value.lesson_id

  if (!canMarkCurrentLessonComplete.value) {
    completeMessage.value = 'ຕ້ອງຜ່ານແບບທົດສອບກ່ອນ ຈຶ່ງຈະນັບວ່າຮຽນຈົບບົດນີ້'
    return
  }

  localCompletedLessonIds.value.push(targetLessonId)

  if (!currentEnrollmentId.value) {
    localCompletedLessonIds.value = localCompletedLessonIds.value.filter((id) => id !== targetLessonId)
    completeMessage.value = 'ສະແດງວ່າຮຽນຈົບແລ້ວ. ຖ້າຕ້ອງການບັນທຶກຖາວອນ ຕ້ອງລົງທະບຽນຄອສກ່ອນ.'
    return
  }

  try {
    markingLessonId.value = targetLessonId

    const updated = await updateProgress(currentEnrollmentId.value, targetLessonId, {
      is_completed: true,
    })

    const index = progressList.value.findIndex((progress) => {
      return progress.lesson_id === updated.lesson_id
    })

    if (index >= 0) {
      progressList.value[index] = updated
    } else {
      progressList.value.push(updated)
    }

    completeMessage.value = 'ບັນທຶກວ່າຮຽນຈົບບົດນີ້ແລ້ວ'
  } catch (error) {
    console.log(error)
    localCompletedLessonIds.value = localCompletedLessonIds.value.filter((id) => id !== targetLessonId)
    if (axios.isAxiosError<{ message: string }>(error)) {
      completeMessage.value = error.response?.data?.message || 'ບັນທຶກ progress ບໍ່ສຳເລັດ'
      return
    }
    completeMessage.value = 'ສະແດງວ່າຮຽນຈົບແລ້ວ ແຕ່ບັນທຶກ progress ບໍ່ສຳເລັດ'
  } finally {
    markingLessonId.value = ''
  }
}

const submitCurrentQuiz = async () => {
  if (!quiz.value || isSubmittingQuiz.value) return

  const answers = quiz.value.questions.map((question) => ({
    question_id: question.question_id,
    answer: getQuizAnswer(question),
  }))

  const hasMissingAnswer = answers.some((answer) => !answer.answer)

  if (hasMissingAnswer) {
    quizMessage.value = 'ກະລຸນາຕອບຄຳຖາມໃຫ້ຄົບກ່ອນສົ່ງ'
    return
  }

  try {
    isSubmittingQuiz.value = true
    quizMessage.value = ''

    const result = await submitQuiz(lessonId.value, answers)
    quizResult.value = result.submission

    if (result.passed) {
      quizMessage.value = 'ຜ່ານແບບທົດສອບແລ້ວ'
      confetti({
        particleCount: 160,
        spread: 85,
        origin: { y: 0.5 }
      })
      await markCurrentLessonComplete()
    } else {
      quizMessage.value = 'ຄະແນນຍັງບໍ່ຜ່ານ ລອງເຮັດອີກຄັ້ງ'
    }
  } catch (error) {
    console.log(error)
    quizMessage.value = 'ສົ່ງແບບທົດສອບບໍ່ສຳເລັດ'
  } finally {
    isSubmittingQuiz.value = false
  }
}

const goToQuizQuestion = (index: number) => {
  if (!quiz.value) return

  currentQuizQuestionIndex.value = Math.min(Math.max(index, 0), quiz.value.questions.length - 1)
}

const goToPreviousQuizQuestion = () => {
  goToQuizQuestion(currentQuizQuestionIndex.value - 1)
}

const goToNextQuizQuestion = () => {
  goToQuizQuestion(currentQuizQuestionIndex.value + 1)
}

const syncVideoState = (video: HTMLVideoElement) => {
  currentTime.value = video.currentTime
  videoDuration.value = video.duration || 0
  isPlaying.value = !video.paused
  volume.value = video.volume
  isMuted.value = video.muted
  playbackRate.value = video.playbackRate
}

const handleVideoLoadedMetadata = (event: Event) => {
  const video = event.target as HTMLVideoElement
  video.playbackRate = playbackRate.value
  syncVideoState(video)
}

const handleVideoTimeUpdate = (event: Event) => {
  const video = event.target as HTMLVideoElement
  syncVideoState(video)

  if (!video.duration) {
    return
  }

  const watchedRatio = video.currentTime / video.duration

  if (watchedRatio >= 0.95) {
    markCurrentLessonComplete()
  }
}

const togglePlay = async () => {
  const video = videoRef.value
  if (!video) return

  if (video.paused) {
    await video.play()
  } else {
    video.pause()
  }

  syncVideoState(video)
}

const seekVideo = (event: Event) => {
  const video = videoRef.value
  const input = event.target as HTMLInputElement

  if (!video) return

  video.currentTime = Number(input.value)
  syncVideoState(video)
}

const changeVolume = (event: Event) => {
  const video = videoRef.value
  const input = event.target as HTMLInputElement

  if (!video) return

  video.volume = Number(input.value)
  video.muted = video.volume === 0
  syncVideoState(video)
}

const toggleMute = () => {
  const video = videoRef.value
  if (!video) return

  video.muted = !video.muted
  syncVideoState(video)
}

const changePlaybackRate = (nextRate: number) => {
  const video = videoRef.value

  playbackRate.value = nextRate
  openVideoMenu.value = null

  if (!video) return

  video.playbackRate = nextRate
  syncVideoState(video)
}

const changeVideoQuality = (quality: typeof videoQualityMode.value) => {
  videoQualityMode.value = quality
  openVideoMenu.value = null
}

const toggleVideoMenu = (menu: 'quality' | 'speed') => {
  openVideoMenu.value = openVideoMenu.value === menu ? null : menu
}

const toggleTheaterMode = () => {
  openVideoMenu.value = null
  videoViewMode.value = videoViewMode.value === 'wide' ? 'normal' : 'wide'
}

const toggleFullscreen = async () => {
  if (document.fullscreenElement) {
    await document.exitFullscreen()
    videoViewMode.value = 'normal'
    return
  }

  videoViewMode.value = 'fullscreen'
  await videoShell.value?.requestFullscreen?.()
}

const handleFullscreenChange = () => {
  if (!document.fullscreenElement && videoViewMode.value === 'fullscreen') {
    videoViewMode.value = 'normal'
  }
}

const loadLesson = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    completeMessage.value = ''

    const [courseData, lessonsData, lessonData] = await Promise.all([
      getCourseById(courseId.value),
      getLessonsByCourseId(courseId.value),
      getLessonById(courseId.value, lessonId.value),
    ])

    course.value = courseData
    lessons.value = lessonsData
    lesson.value = lessonData
    quiz.value = null
    quizAnswerIndexes.value = {}
    quizResult.value = null
    quizMessage.value = ''
    currentQuizQuestionIndex.value = 0
    currentEnrollmentId.value = ''
    progressList.value = []
    isPlaying.value = false
    currentTime.value = 0
    videoDuration.value = 0

    try {
      const enrollments = await getMyEnrollments()
      const currentEnrollment = enrollments.find((enrollment) => {
        return enrollment.course_id === courseId.value
      })

      if (currentEnrollment) {
        currentEnrollmentId.value = currentEnrollment.enrollment_id
        progressList.value = await getProgress(currentEnrollment.enrollment_id)
      }
    } catch (error) {
      console.log(error)
    }

    try {
      hasClaimedCertificate.value = false
      const certificateList = await getMyCertificates()
      hasClaimedCertificate.value = certificateList.some((c) => c.course_id === courseId.value)
    } catch (error) {
      console.log('Failed to fetch certificates:', error)
    }

    try {
      quiz.value = await getQuizByLessonId(lessonId.value)
      try {
        const submissions = await getQuizResult(lessonId.value)
        quizResult.value = submissions[0] || null
      } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 404) {
          throw error
        }
      }
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        throw error
      }
    }
  } catch (error) {
    console.log(error)

    if (axios.isAxiosError<{ message: string }>(error)) {
      if (error.response?.status === 402 || error.response?.status === 403) {
        errorMessage.value =
          error.response.data?.message ||
          'ບົດຮຽນນີ້ຖືກລັອກ. ກະລຸນາລົງທະບຽນ ຫຼື ລໍຖ້າການອະນຸມັດກ່ອນ.'
        return
      }

      if (error.response?.status === 404) {
        errorMessage.value = 'ບໍ່ພົບບົດຮຽນນີ້'
        return
      }
    }

    errorMessage.value = 'ໂຫຼດບົດຮຽນບໍ່ສຳເລັດ'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadLesson()
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})

watch(
  () => route.fullPath,
  () => {
    loadLesson()
  },
)

interface Sparkle {
  id: number
  x: number
  y: number
  color: string
  size: number
  tx: number
  ty: number
}

const sparkles = ref<Sparkle[]>([])
let sparkleId = 0

const spawnSparkles = (e: MouseEvent) => {
  const colors = ['#f5a400', '#294a78', '#10b981', '#6366f1', '#ec4899', '#f43f5e']
  const container = e.currentTarget as HTMLElement
  const rect = container.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const clickY = e.clientY - rect.top

  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * 45 + 15
    const tx = Math.cos(angle) * distance
    const ty = Math.sin(angle) * distance
    const size = Math.random() * 6 + 3
    const color = colors[Math.floor(Math.random() * colors.length)] || '#f5a400'

    const newSparkle = {
      id: sparkleId++,
      x: clickX,
      y: clickY,
      color,
      size,
      tx,
      ty,
    }
    sparkles.value.push(newSparkle)

    setTimeout(() => {
      sparkles.value = sparkles.value.filter((s) => s.id !== newSparkle.id)
    }, 800)
  }
}
</script>

<template>
  <main class="min-h-screen bg-background text-foreground transition-colors duration-300">
    <section class="flex min-h-screen flex-col">
      <header class="flex h-16 items-center justify-between border-b border-border bg-card px-6 text-foreground shadow-sm lg:px-10">
        <div class="flex min-w-0 items-center gap-4">
          <RouterLink
            :to="`/courses/${courseId}`"
            class="rounded-xl px-3 py-2 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-primary"
          >
            ← ກັບຄືນ
          </RouterLink>

          <div class="h-6 w-px bg-border"></div>

          <p class="truncate text-sm font-black text-foreground md:text-base">
            {{ course?.title || 'Course' }}
          </p>
        </div>

        <RouterLink
          :to="`/courses/${courseId}`"
          class="grid h-9 w-9 place-items-center rounded-xl text-lg font-bold text-muted-foreground transition hover:bg-muted hover:text-primary"
          aria-label="Close lesson"
        >
          ×
        </RouterLink>
      </header>

      <section v-if="isLoading" class="grid flex-1 place-items-center text-muted-foreground">
        ກຳລັງໂຫຼດ...
      </section>

      <section v-else-if="errorMessage" class="grid flex-1 place-items-center px-6">
        <p class="rounded-2xl bg-red-50/10 border border-red-500/20 px-5 py-4 text-red-600 dark:text-red-400">{{ errorMessage }}</p>
      </section>

      <section v-else-if="lesson" :class="lessonLayoutClass">
        <div
          ref="videoShell"
          class="flex flex-col"
          :class="[playerHeightClass, isExercise ? 'bg-background' : 'bg-black']"
        >
          <div
            class="grid flex-1 place-items-center p-0"
            :class="isExercise ? 'bg-background px-6 py-8' : 'bg-black'"
          >
            <div
              v-if="isExercise"
              @click="spawnSparkles"
              class="relative overflow-hidden w-full rounded-[1.75rem] bg-card p-6 shadow-[0_24px_70px_rgba(15,31,77,0.10)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.4)] ring-1 ring-border md:p-8 cursor-default"
            >
              <!-- Click sparkle particles layer -->
              <div class="absolute inset-0 pointer-events-none z-50">
                <span
                  v-for="sparkle in sparkles"
                  :key="sparkle.id"
                  class="absolute rounded-full animate-sparkle"
                  :style="{
                    left: `${sparkle.x}px`,
                    top: `${sparkle.y}px`,
                    width: `${sparkle.size}px`,
                    height: `${sparkle.size}px`,
                    backgroundColor: sparkle.color,
                    '--tx': `${sparkle.tx}px`,
                    '--ty': `${sparkle.ty}px`
                  }"
                ></span>
              </div>
              <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span
                    class="rounded-full bg-[#f5a400]/15 px-3 py-1 text-xs font-black text-[#b87900]"
                  >
                    ແບບທົດສອບ
                  </span>
                  <h1 class="mt-4 text-3xl font-black text-slate-950">
                    {{ quiz?.title || lesson.title }}
                  </h1>
                  <p class="mt-3 text-sm leading-7 text-slate-500">
                    {{
                      quiz?.description ||
                      lesson.description ||
                      'ຕອບຄຳຖາມເພື່ອກວດຄວາມເຂົ້າໃຈຂອງບົດຮຽນນີ້'
                    }}
                  </p>
                </div>

                <div
                  v-if="quizResult"
                  class="rounded-2xl border px-4 py-3 text-center"
                  :class="
                    isQuizPassed
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-[#f5a400]/30 bg-[#f5a400]/10 text-[#9a6500]'
                  "
                >
                  <p class="text-xs font-black uppercase">Score</p>
                  <p class="font-number text-2xl font-black">
                    {{ quizResult.score }}/{{ quizResult.total }}
                  </p>
                  <p class="text-xs font-bold">{{ quizScorePercent }}%</p>
                </div>
              </div>

              <div v-if="currentQuizQuestion" class="mt-6">
                <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div class="flex flex-wrap items-center gap-2">
                    <button
                      v-for="(_question, questionIndex) in quiz?.questions"
                      :key="questionIndex"
                      type="button"
                      class="grid h-9 w-9 place-items-center rounded-full border text-sm font-black transition"
                      :class="
                        questionIndex === currentQuizQuestionIndex
                          ? 'border-[#142b63] bg-[#142b63] text-white'
                          : quizAnswerIndexes[_question.question_id] !== undefined
                            ? 'border-[#f5a400] bg-[#fff7e8] text-[#9a6500]'
                            : 'border-slate-200 bg-white text-slate-400 hover:border-[#f5a400]'
                      "
                      @click="goToQuizQuestion(questionIndex)"
                    >
                      {{ questionIndex + 1 }}
                    </button>
                  </div>

                  <p class="text-sm font-bold text-slate-500">
                    {{ quizAnsweredCount }}/{{ quizQuestionCount }} ຕອບແລ້ວ
                  </p>
                </div>

                <article class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 md:p-6">
                  <p class="text-sm font-black text-[#142b63]">
                    ຄຳຖາມ {{ currentQuizQuestionIndex + 1 }} / {{ quizQuestionCount }}
                  </p>
                  <h2 class="mt-3 text-xl font-black leading-8 text-slate-950">
                    {{ currentQuizQuestion.question_text }}
                  </h2>

                  <div class="mt-6 grid gap-3 md:grid-cols-2">
                    <label
                      v-for="(option, optionIndex) in currentQuizQuestion.options"
                      :key="`${option}-${optionIndex}`"
                      class="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-bold transition"
                      :class="getQuizOptionClass(currentQuizQuestion, option, optionIndex)"
                    >
                      <input
                        v-model="quizAnswerIndexes[currentQuizQuestion.question_id]"
                        type="radio"
                        :name="currentQuizQuestion.question_id"
                        :value="optionIndex"
                        class="accent-[#f5a400]"
                      />
                      {{ option }}
                    </label>
                  </div>

                  <div
                    v-if="hasQuizBeenSubmitted"
                    class="mt-5 rounded-xl px-4 py-3 text-sm font-bold"
                    :class="
                      isQuizQuestionCorrect(currentQuizQuestion)
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-600'
                    "
                  >
                    <span v-if="isQuizQuestionCorrect(currentQuizQuestion)">
                      ຖືກຕ້ອງ
                    </span>
                    <span v-else>
                      ຍັງບໍ່ຖືກ. ລອງເຮັດອີກຄັ້ງ
                    </span>
                  </div>
                </article>

                <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    :disabled="currentQuizQuestionIndex === 0"
                    class="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-[#142b63] transition hover:border-[#142b63] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    @click="goToPreviousQuizQuestion"
                  >
                    ກ່ອນໜ້າ
                  </button>

                  <button
                    v-if="currentQuizQuestionIndex < quizQuestionCount - 1"
                    type="button"
                    class="rounded-xl bg-[#142b63] px-6 py-3 text-sm font-black text-white transition hover:bg-[#0e214d]"
                    @click="goToNextQuizQuestion"
                  >
                    ຄຳຖາມຖັດໄປ
                  </button>

                  <button
                    v-else
                    type="button"
                    :disabled="isSubmittingQuiz"
                    class="rounded-xl bg-[#142b63] px-6 py-3 text-sm font-black text-white transition hover:bg-[#0e214d] disabled:cursor-not-allowed disabled:bg-slate-400"
                    @click="submitCurrentQuiz"
                  >
                    <span v-if="isSubmittingQuiz">ກຳລັງສົ່ງ...</span>
                    <span v-else-if="quizResult">ສົ່ງອີກຄັ້ງ</span>
                    <span v-else>ສົ່ງຄຳຕອບ</span>
                  </button>
                </div>

                <p
                  v-if="quizMessage"
                  class="mt-5 rounded-xl px-4 py-3 text-sm font-bold"
                  :class="
                    isQuizPassed
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-[#f5a400]/10 text-[#9a6500]'
                  "
                >
                  {{ quizMessage }}
                </p>
              </div>

              <p v-else class="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                ບົດຮຽນນີ້ຍັງບໍ່ມີຄຳຖາມ
              </p>
            </div>

            <div
              v-else-if="videoUrl"
              class="group relative grid h-full w-full place-items-center bg-black"
            >
              <video
                ref="videoRef"
                :src="videoUrl"
                autoplay
                class="w-full bg-black object-contain transition-[filter] duration-200"
                :class="[videoSizeClass, videoQualityClass]"
                @click="togglePlay"
                @ended="markCurrentLessonComplete"
                @loadedmetadata="handleVideoLoadedMetadata"
                @pause="syncVideoState($event.target as HTMLVideoElement)"
                @play="syncVideoState($event.target as HTMLVideoElement)"
                @timeupdate="handleVideoTimeUpdate"
              ></video>

              <button
                v-if="!isPlaying"
                type="button"
                class="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#f5a400]/90 pl-1 text-3xl text-slate-950 shadow-[0_18px_50px_rgba(245,164,0,0.32)] transition hover:scale-105"
                @click="togglePlay"
              >
                ▶
              </button>

              <div
                class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-5 pb-4 pt-16 opacity-0 transition group-hover:opacity-100"
              >
                <input
                  type="range"
                  min="0"
                  :max="videoDuration || 0"
                  step="0.1"
                  :value="currentTime"
                  class="h-1 w-full cursor-pointer accent-[#f5a400]"
                  :style="{ background: `linear-gradient(to right, #f5a400 ${videoProgressPercent}%, rgba(255,255,255,0.32) ${videoProgressPercent}%)` }"
                  @input="seekVideo"
                />

                <div class="mt-3 flex flex-wrap items-center justify-between gap-4 text-white">
                  <div class="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      class="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-sm font-black transition hover:bg-white/20"
                      @click="togglePlay"
                    >
                      {{ isPlaying ? '❚❚' : '▶' }}
                    </button>

                    <button
                      type="button"
                      class="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-sm transition hover:bg-white/20"
                      @click="toggleMute"
                    >
                      {{ isMuted || volume === 0 ? '🔇' : '🔊' }}
                    </button>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      :value="isMuted ? 0 : volume"
                      class="hidden h-1 w-20 cursor-pointer accent-[#f5a400] sm:block"
                      @input="changeVolume"
                    />

                    <span class="font-number text-xs font-bold text-white/85">
                      {{ formatVideoTime(currentTime) }} / {{ formatVideoTime(videoDuration) }}
                    </span>
                  </div>

                  <div class="flex flex-wrap items-center justify-end gap-2">
                    <div class="relative">
                      <button
                        type="button"
                        class="inline-flex h-10 min-w-[132px] items-center justify-between gap-3 rounded-lg bg-white/10 px-3 text-xs font-black text-white/90 transition hover:bg-white/20"
                        title="Video quality"
                        @click="toggleVideoMenu('quality')"
                      >
                        <span>Quality</span>
                        <span class="inline-flex items-center gap-2">
                          {{ selectedVideoQualityLabel }}
                          <span class="text-[10px]">⌄</span>
                        </span>
                      </button>

                      <div
                        v-if="openVideoMenu === 'quality'"
                        class="absolute bottom-12 right-0 z-20 w-36 overflow-hidden rounded-xl border border-white/15 bg-slate-950/95 py-1 text-sm font-black text-white shadow-2xl backdrop-blur"
                      >
                        <button
                          v-for="option in videoQualityOptions"
                          :key="option.value"
                          type="button"
                          class="flex w-full items-center justify-between px-4 py-2.5 text-left transition hover:bg-white/12"
                          :class="videoQualityMode === option.value ? 'bg-[#f5a400] text-slate-950' : ''"
                          @click="changeVideoQuality(option.value)"
                        >
                          <span>{{ option.label }}</span>
                          <span v-if="videoQualityMode === option.value">✓</span>
                        </button>
                      </div>
                    </div>

                    <div class="relative">
                      <button
                        type="button"
                        class="inline-flex h-10 min-w-[112px] items-center justify-between gap-3 rounded-lg bg-white/10 px-3 text-xs font-black text-white/90 transition hover:bg-white/20"
                        title="Playback speed"
                        @click="toggleVideoMenu('speed')"
                      >
                        <span>Speed</span>
                        <span class="inline-flex items-center gap-2 font-number">
                          {{ playbackRate }}x
                          <span class="text-[10px]">⌄</span>
                        </span>
                      </button>

                      <div
                        v-if="openVideoMenu === 'speed'"
                        class="absolute bottom-12 right-0 z-20 w-28 overflow-hidden rounded-xl border border-white/15 bg-slate-950/95 py-1 text-sm font-black text-white shadow-2xl backdrop-blur"
                      >
                        <button
                          v-for="rate in playbackRateOptions"
                          :key="rate"
                          type="button"
                          class="flex w-full items-center justify-between px-4 py-2.5 text-left font-number transition hover:bg-white/12"
                          :class="playbackRate === rate ? 'bg-[#f5a400] text-slate-950' : ''"
                          @click="changePlaybackRate(rate)"
                        >
                          <span>{{ rate }}x</span>
                          <span v-if="playbackRate === rate">✓</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      class="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-base font-black transition hover:bg-white/20"
                      :title="videoViewMode === 'wide' ? 'Normal mode' : 'Theater mode'"
                      @click="toggleTheaterMode"
                    >
                      ▭
                    </button>

                    <button
                      type="button"
                      class="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-base font-black transition hover:bg-white/20"
                      title="Fullscreen"
                      @click="toggleFullscreen"
                    >
                      ⛶
                    </button>
                  </div>
                </div>
              </div>

              <div class="hidden">
                <button
                  type="button"
                  class="grid h-9 w-9 place-items-center rounded-lg border border-white/15 bg-black/55 text-base font-black text-white/90 shadow-lg backdrop-blur transition hover:bg-black/80 hover:text-white"
                  :title="videoViewMode === 'wide' ? 'Normal mode' : 'Theater mode'"
                  @click="toggleTheaterMode"
                >
                  ▭
                </button>
              </div>
            </div>

            <img
              v-else-if="imageUrl"
              :src="imageUrl"
              :alt="lesson.title"
              class="max-h-[calc(100vh-210px)] w-full max-w-7xl rounded-[1.25rem] bg-white object-contain shadow-[0_28px_90px_rgba(0,0,0,0.28)] ring-1 ring-white/10"
            />

            <div
              v-else-if="documentUrl"
              class="w-full max-w-3xl rounded-2xl bg-white p-8 text-center shadow-2xl"
            >
              <div class="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-[#f5a400]/15 text-4xl text-[#f5a400]">
                📄
              </div>
              <h1 class="mt-6 text-2xl font-black text-slate-950">{{ lesson.title }}</h1>
              <p class="mt-3 text-sm leading-7 text-slate-500">
                {{ documentFile?.original_name || 'Document file' }}
              </p>
              <div class="mt-6 flex justify-center gap-3">
                <a
                  :href="documentUrl"
                  target="_blank"
                  class="rounded-xl bg-[#142b63] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0e214d]"
                  @click="markCurrentLessonComplete"
                >
                  ເປີດເບິ່ງ
                </a>
                <a
                  :href="documentUrl"
                  download
                  class="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-[#142b63] transition hover:border-[#142b63]"
                >
                  ດາວໂຫຼດ
                </a>
              </div>
            </div>

            <div
              v-else-if="isTextLesson"
              class="w-full max-w-4xl rounded-2xl bg-white p-8 shadow-2xl"
            >
              <span class="rounded-full bg-[#f5a400]/15 px-3 py-1 text-xs font-black text-[#b87900]">
                Text
              </span>
              <h1 class="mt-4 text-3xl font-black text-slate-950">{{ lesson.title }}</h1>
              <p class="mt-5 whitespace-pre-line text-base leading-8 text-slate-600">
                {{ lesson.content || lesson.description || 'ບົດຮຽນນີ້ຍັງບໍ່ມີເນື້ອຫາ' }}
              </p>
            </div>

            <div v-else-if="!isExercise" class="text-center text-white/70">
              <div class="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#f5a400]/20 text-3xl text-[#f5a400]">
                ▶
              </div>
              <h1 class="mt-6 text-2xl font-black text-white">{{ lesson.title }}</h1>
              <p class="mt-2">ບົດຮຽນນີ້ຍັງບໍ່ມີວິດີໂອ</p>
            </div>
          </div>

          <div class="border-t border-slate-200 bg-white px-6 py-5 shadow-[0_-18px_60px_rgba(15,23,42,0.06)] lg:px-10">
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div class="flex items-center gap-3">
                  <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-[#142b63]">
                    {{ getLessonTypeLabel(lesson) }}
                  </span>
                  <span v-if="videoFile?.duration_seconds" class="text-sm font-bold text-slate-500">
                    {{ formatDuration(videoFile.duration_seconds) }}
                  </span>
                  <span
                    v-if="isLessonCompleted(lesson.lesson_id)"
                    class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600"
                  >
                    ✓ ສຳເລັດ
                  </span>
                  <span
                    v-if="isLastLesson"
                    class="rounded-full bg-red-50 border border-red-100 px-3 py-1 text-xs font-black text-red-700"
                  >
                    🏁 ບົດຮຽນສຸດທ້າຍ
                  </span>
                </div>

                <h1 class="mt-3 text-2xl font-black text-slate-950">{{ lesson.title }}</h1>
              </div>

              <div class="flex gap-3">
                <button
                  type="button"
                  :disabled="
                    isLessonCompleted(lesson.lesson_id) ||
                    Boolean(markingLessonId) ||
                    !canMarkCurrentLessonComplete
                  "
                  class="rounded-xl bg-[#142b63] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0e214d] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  @click="markCurrentLessonComplete"
                >
                  {{ isLessonCompleted(lesson.lesson_id) ? 'ຮຽນຈົບແລ້ວ' : 'ໝາຍວ່າຮຽນຈົບ' }}
                </button>

                <a
                  v-if="downloadableUrl && !isExercise"
                  :href="downloadableUrl"
                  download
                  class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-[#142b63] transition hover:border-[#142b63]"
                >
                  ดາວໂຫຼດ
                </a>
                <button
                  type="button"
                  class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-[#142b63] transition hover:border-[#142b63]"
                >
                  ແຊຣ໌
                </button>
              </div>
            </div>

            <!-- Congratulations Banner when Course is Completed -->
            <div
              v-if="isCourseFinished"
              class="mt-6 p-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div class="flex items-center gap-4">
                <div class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-2xl">
                  🏅
                </div>
                <div class="text-left">
                  <h3 class="text-base font-black text-emerald-950">ຍິນດີດ້ວຍ! ທ່ານຮຽນຈົບຄອສນີ້ແລ້ວ</h3>
                  <p class="mt-1 text-xs font-semibold text-emerald-700">
                    ທ່ານໄດ້ຮຽນຈົບບົດຮຽນທັງໝົດ ແລະ ພ້ອມທີ່ຈະຮັບໃບຢືນຢັນການຮຽນຈົບແລ້ວ
                  </p>
                </div>
              </div>
              
              <button
                v-if="!hasClaimedCertificate"
                type="button"
                :disabled="isClaimingCertificate"
                class="shrink-0 rounded-xl bg-[#142b63] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0e214d] disabled:cursor-not-allowed disabled:bg-slate-400"
                @click="claimCertificate"
              >
                {{ isClaimingCertificate ? 'ກຳລັງອອກໃບປະກາດ...' : 'ຮັບໃບປະກາດ' }}
              </button>
              
              <RouterLink
                v-else
                to="/dashboard"
                class="shrink-0 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700"
              >
                ເບິ່ງໃບປະກາດຂອງທ່ານ
              </RouterLink>
            </div>

            <div class="mt-8">
              <h2 class="text-xl font-black text-slate-950">ກ່ຽວກັບບົດຮຽນນີ້</h2>
              <p v-if="completeMessage" class="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-600">
                {{ completeMessage }}
              </p>
              <p class="mt-3 max-w-4xl text-sm leading-7 text-slate-500">
                {{ lesson.description || 'ບໍ່ມີຄຳອະທິບາຍສຳລັບບົດຮຽນນີ້' }}
              </p>
            </div>
          </div>
        </div>

        <aside v-if="videoViewMode === 'normal'" class="border-l border-slate-200 bg-[#fbfcff]">
          <div class="border-b border-slate-200 px-6 py-5">
            <h2 class="text-lg font-black text-slate-950">ລາຍການບົດຮຽນ</h2>
            <p class="mt-1 text-sm text-slate-500">
              {{ lessons.length }} ບົດຮຽນ
              <span v-if="currentLessonIndex >= 0">· ກຳລັງຮຽນບົດ {{ currentLessonIndex + 1 }}</span>
            </p>
          </div>

          <div class="border-b border-slate-200 bg-white px-6 py-4">
            <div class="flex items-center justify-between text-xs font-black text-slate-500">
              <span>{{ completedLessonCount }}/{{ lessons.length }} ສຳເລັດ</span>
              <span>{{ progressPercent }}%</span>
            </div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-[#f5a400] transition-all"
                :style="{ width: `${progressPercent}%` }"
              ></div>
            </div>
          </div>

          <div class="max-h-[calc(100vh-201px)] overflow-y-auto p-4">
            <RouterLink
              v-for="(item, idx) in lessons"
              :key="item.lesson_id"
              :to="`/courses/${courseId}/learn/${item.lesson_id}`"
              class="mb-3 flex gap-3 rounded-2xl border px-4 py-4 transition"
              :class="item.lesson_id === lessonId ? 'border-[#f5a400]/30 bg-[#fff7e8] shadow-sm' : 'border-transparent bg-white hover:border-slate-200 hover:shadow-sm'"
            >
              <div class="w-6 pt-2 text-center">
                <span
                  v-if="isLessonCompleted(item.lesson_id)"
                  class="inline-grid h-6 w-6 place-items-center rounded-full bg-[#f5a400]/15 text-xs font-black text-[#f5a400]"
                >
                  ✓
                </span>
                <span
                  v-else
                  class="inline-grid h-6 w-6 place-items-center rounded-full border border-slate-300 bg-white text-xs font-black text-slate-300"
                >
                </span>
              </div>

              <div
                class="grid h-10 w-10 shrink-0 place-items-center rounded-full"
                :class="
                  isLessonCompleted(item.lesson_id)
                    ? 'bg-emerald-500 text-white'
                    : item.lesson_id === lessonId
                      ? 'bg-[#f5a400] text-slate-950'
                      : 'bg-slate-100 text-slate-500'
                "
              >
                {{ isLessonCompleted(item.lesson_id) ? '✓' : '▶' }}
              </div>

              <div class="min-w-0">
                <h3
                  class="truncate text-sm font-black"
                  :class="item.lesson_id === lessonId ? 'text-[#f5a400]' : 'text-slate-950'"
                >
                  {{ item.title }}
                </h3>
                <p class="mt-1 text-xs font-medium text-slate-500">
                  {{ getLessonTypeLabel(item) }}
                  <span v-if="item.files?.[0]?.duration_seconds">
                    · {{ formatDuration(item.files[0].duration_seconds) }}
                  </span>
                  <span
                    v-if="item.is_last_lesson || (lessons.some((l) => l.is_last_lesson) ? false : idx === lessons.length - 1)"
                    class="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-black text-red-700"
                  >
                    ບົດຮຽນສຸດທ້າຍ
                  </span>
                </p>
              </div>
            </RouterLink>
          </div>
        </aside>
      </section>
    </section>
  </main>
</template>
