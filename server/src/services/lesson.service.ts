import { prisma } from "../lib/prisma";
import { deleteUploadedFiles } from "../utils/uploadFile";

type LessonAccessUser = {
    userId?: string;
    role?: string;
};

const getFreshUserRole = async (userId: string) => {
    const freshUser = await prisma.user.findUnique({
        where: { user_id: userId },
        select: { role: true },
    });

    return freshUser?.role;
};

const isPaidCourse = (price: unknown) => {
    return Number(String(price || 0).replace(/,/g, "")) > 0;
};

export const canAccessCourseLessons = async (
    course_id: string,
    user: LessonAccessUser,
) => {
    //ເຊັກວ່າ course ມີຢູ່ແທ້ບໍ່
    const course = await prisma.course.findUnique({
        where: {
            course_id,
        },
    });

    if (!course) throw new Error("COURSE_NOT_FOUND");

    if (!user.userId) {
        throw new Error("NOT_ENROLLED");
    }

    const effectiveRole = await getFreshUserRole(user.userId);

    if (!effectiveRole) {
        throw new Error("NOT_ENROLLED");
    }

    if (effectiveRole === "admin") {
        return { course, canAccessLockedLessons: true };
    }

    if (effectiveRole === "instructor") {
        if (course.instructor_id !== user.userId) {
            throw new Error("FORBIDDEN");
        }

        return { course, canAccessLockedLessons: true };
    }

    const enrollment = await prisma.enrollment.findUnique({
        where: {
            student_id_course_id: {
                student_id: user.userId,
                course_id,
            },
        },
    });

    if (!enrollment || enrollment.status === "dropped") {
        throw new Error("NOT_ENROLLED");
    }

    if (isPaidCourse(course.price) && !enrollment.is_paid) {
        throw new Error("PAYMENT_REQUIRED");
    }

    return { course, canAccessLockedLessons: true };
};

export const assertLessonAccess = async (
    course_id: string,
    lesson_id: string,
    user: LessonAccessUser,
) => {
    const lesson = await prisma.lesson.findFirst({
        where: {
            lesson_id,
            course_id,
        },
        include: {
            course: true,
        },
    });

    if (!lesson) throw new Error("LESSON_NOT_FOUND");

    if (lesson.is_free_preview) {
        return lesson;
    }

    await canAccessCourseLessons(course_id, user);

    return lesson;
};

export const assertLessonAccessByLessonId = async (
    lesson_id: string,
    user: LessonAccessUser,
) => {
    const lesson = await prisma.lesson.findUnique({
        where: { lesson_id },
        include: { course: true },
    });

    if (!lesson) throw new Error("LESSON_NOT_FOUND");

    if (lesson.is_free_preview) {
        return lesson;
    }

    await canAccessCourseLessons(lesson.course_id, user);

    return lesson;
};

export const getLessonsService = async (
    course_id: string,
    user: LessonAccessUser,
) => {
    let canAccessFiles = true;

    try {
        await canAccessCourseLessons(course_id, user);
    } catch (error: any) {
        if (error.message === "COURSE_NOT_FOUND") {
            throw error;
        }

        canAccessFiles = false;
    }

    const lessons = await prisma.lesson.findMany({
        where: { course_id },
        include: {
            files: true,
        },
        orderBy: {
            order_index: "asc",
        },
    });

    if (canAccessFiles) {
        return lessons;
    }

    return lessons.map((lesson) => {
        if (lesson.is_free_preview) {
            return lesson;
        }

        return {
            ...lesson,
            files: [],
        };
    });
};

export const getLessonByIdService = async (
    course_id: string,
    lesson_id: string,
    user: LessonAccessUser,
) => {
    await assertLessonAccess(course_id, lesson_id, user);

    const lesson = await prisma.lesson.findFirst({
        where: {
            lesson_id,
            course_id, // ← ເຊັກເບິ່ງວ່າ lesson ນີ້ຢູ່ໃນ course ມີແທ້ບໍ່
        },
        include: {
            files: true,
        },
    });
    if (!lesson) throw new Error("LESSON_NOT_FOUND");

    return lesson;
};

export const createLessonService = async (
    course_id: string,
    instructor_id: string,
    userRole: string,
    data: {
        title: string;
        lesson_type?: string;
        content?: string;
        description?: string;
        order_index?: number;
        is_free_preview?: boolean;
        is_last_lesson?: boolean;
    },
) => {
    //ເຊັກຄອສວ່າມີບໍ່
    const course = await prisma.course.findUnique({
        where: {
            course_id,
        },
    });
    if (!course) throw new Error("COURSE_NOT_FOUND");

    //ເຊັກວ່າເປັນເຈົ້າຂອງ course ບໍ່
    if (userRole !== "admin" && course.instructor_id !== instructor_id) {
        throw new Error("FORBIDDEN");
    }

    const lesson = await prisma.lesson.create({
        data: {
            course_id,
            ...data,
        },
    });
    return lesson;
};

export const updateLessonService = async (
    course_id: string,
    lesson_id: string,
    instructor_id: string,
    userRole: string,
    data: {
        title?: string;
        lesson_type?: string;
        content?: string;
        description?: string;
        order_index?: number;
        is_free_preview?: boolean;
        is_last_lesson?: boolean;
    },) => {
    //ເຊັກວ່າ lesson ມີຢູ່ແທ້ ແລະ ຢູ່ໃນ course ນີ້ບໍ
    const lesson = await prisma.lesson.findFirst({
        where: {
            lesson_id,
            course_id,
        },
        include: {
            course: true,
            files: true,
        },
    });
    if (!lesson) throw new Error("LESSON_NOT_FOUND");

    //ເຊັກ ownership
    if (userRole !== "admin" && lesson.course.instructor_id !== instructor_id) {
        throw new Error("FORBIDDEN");
    }

    const updated = await prisma.lesson.update({
        where: { lesson_id },
        data,
    });
    return updated;
};

export const deleteLessonService = async (
    course_id: string,
    lesson_id: string,
    instructor_id: string,
    userRole: string,
) => {
    //ເຊັກກ່ອນວ່າ lesson ມີຢູ່ຈິງ ແລະ ຢູ່ໃນ course ນີ້ບໍ
    const lesson = await prisma.lesson.findFirst({
        where: { lesson_id, course_id },
        include: {
            course: true,
            files: true,
        },
    });

    if (!lesson) throw new Error("LESSON_NOT_FOUND");

    //ເຊັກ ownership
    if (userRole !== "admin" && lesson.course.instructor_id !== instructor_id) {
        throw new Error("FORBIDDEN");
    }

    const uploadedFileUrls = lesson.files.map((file) => file.file_url);

    await prisma.lesson.delete({
        where: { lesson_id },
    });

    await deleteUploadedFiles(uploadedFileUrls);

    return { message: "ລົບ Lesson ສຳເລັດ" };
};
