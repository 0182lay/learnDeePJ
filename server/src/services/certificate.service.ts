import { prisma } from "../lib/prisma";

const PASS_PERCENT = 70;

const buildCertificateCode = () => {
    const date = new Date();
    const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();

    return `LD-${yyyymmdd}-${random}`;
};

export const getMyCertificatesService = async (student_id: string) => {
    return prisma.certificate.findMany({
        where: { student_id },
        include: {
            course: {
                include: {
                    category: true,
                    instructor: {
                        include: { profile: true },
                    },
                },
            },
        },
        orderBy: { issued_at: "desc" },
    });
};

export const issueCertificateService = async (
    course_id: string,
    student_id: string,
) => {
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            student_id_course_id: {
                student_id,
                course_id,
            },
        },
        include: {
            course: {
                include: {
                    lessons: {
                        include: {
                            quiz: {
                                include: {
                                    submissions: {
                                        where: { student_id },
                                        orderBy: { submitted_at: "desc" },
                                    },
                                },
                            },
                        },
                        orderBy: { order_index: "asc" },
                    },
                    instructor: {
                        include: { profile: true },
                    },
                    category: true,
                },
            },
            progress: true,
        },
    });

    if (!enrollment) {
        throw new Error("ENROLLMENT_NOT_FOUND");
    }

    if (!enrollment.is_paid) {
        throw new Error("COURSE_NOT_PAID");
    }

    const lessons = enrollment.course.lessons;
    const completedLessonIds = new Set(
        enrollment.progress
            .filter((progress) => progress.is_completed)
            .map((progress) => progress.lesson_id),
    );

    const lastLesson = lessons.find((l) => (l as any).is_last_lesson);
    const hasCompletedAllLessons = lastLesson
        ? completedLessonIds.has(lastLesson.lesson_id)
        : (lessons.length > 0 && lessons.every((lesson) => completedLessonIds.has(lesson.lesson_id)));

    if (!hasCompletedAllLessons) {
        throw new Error("COURSE_NOT_COMPLETE");
    }

    const quizzes = lessons
        .map((lesson) => lesson.quiz)
        .filter((quiz): quiz is NonNullable<typeof quiz> => Boolean(quiz));

    const hasPassedAllQuizzes = quizzes.every((quiz) => {
        return quiz.submissions.some((submission) => {
            if (!submission.total) return false;

            return (submission.score / submission.total) * 100 >= PASS_PERCENT;
        });
    });

    if (!hasPassedAllQuizzes) {
        throw new Error("QUIZ_NOT_PASSED");
    }

    const existingCertificate = await prisma.certificate.findUnique({
        where: {
            student_id_course_id: {
                student_id,
                course_id,
            },
        },
        include: {
            course: {
                include: {
                    category: true,
                    instructor: {
                        include: { profile: true },
                    },
                },
            },
        },
    });

    if (existingCertificate) {
        return existingCertificate;
    }

    return prisma.certificate.create({
        data: {
            student_id,
            course_id,
            certificate_code: buildCertificateCode(),
        },
        include: {
            course: {
                include: {
                    category: true,
                    instructor: {
                        include: { profile: true },
                    },
                },
            },
        },
    });
};
