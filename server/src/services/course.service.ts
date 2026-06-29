import { prisma } from "../lib/prisma";
import { deleteUploadedFile, deleteUploadedFiles } from "../utils/uploadFile";

const normalizePrice = (price?: string | number) => {
    if (price === undefined) {
        return undefined;
    }

    return String(price).replace(/,/g, "");
};

type CourseWithReviews = {
    reviews?: {
        rating: number;
    }[];
    _count?: {
        lessons?: number;
        enrollments?: number;
    };
};

const attachReviewStats = <T extends CourseWithReviews>(course: T) => {
    const reviews = course.reviews ?? [];
    const reviewCount = reviews.length;
    const averageRating =
        reviewCount > 0
            ? Number((reviews.reduce((total, review) => total + review.rating, 0) / reviewCount).toFixed(1))
            : 0;
    const { reviews: _reviews, _count, ...courseData } = course;

    return {
        ...courseData,
        average_rating: averageRating,
        review_count: reviewCount,
        lesson_count: _count?.lessons ?? 0,
        enrollment_count: _count?.enrollments ?? 0,
    };
};

export const getCoursesService = async () => {
    const courses = await prisma.course.findMany({
        where: {
            is_published: true,
        },
        include: {
            category: true,
            instructor: {
                include: {
                    profile: true,
                },
            },
            reviews: {
                select: {
                    rating: true,
                },
            },
            _count: {
                select: {
                    lessons: true,
                    enrollments: true,
                },
            },
        },
    });
    return courses.map(attachReviewStats);
};

export const getMyCoursesService = async (instructor_id: string, userRole: string) => {
    const courses = await prisma.course.findMany({
        where: userRole === "admin" ? undefined : { instructor_id },
        include: {
            category: true,
            instructor: {
                include: {
                    profile: true,
                },
            },
            reviews: {
                select: {
                    rating: true,
                },
            },
            _count: {
                select: {
                    lessons: true,
                    enrollments: true,
                },
            },
        },
        orderBy: {
            created_at: "desc",
        },
    });

    return courses.map(attachReviewStats);
};

export const getCoursesByIdService = async (course_id: string) => {
    const course = await prisma.course.findUnique({
        where: { course_id },
        include: {
            category: true,
            instructor: {
                include: {
                    profile: true,
                },
            },
            reviews: {
                select: {
                    rating: true,
                },
            },
            _count: {
                select: {
                    lessons: true,
                    enrollments: true,
                },
            },
        },
    });

    if (!course) throw new Error("COURSE_NOT_FOUND");

    return attachReviewStats(course);
};

export const createCourseService = async (
    instructor_id: string,
    category_id: string,
    title: string,
    description: string | undefined,
    price: string,
    thumbnail_url?: string,
    level?: string,
    is_published?: boolean,
) => {
    //ເຊັກວ່າ category ມີຢູ່ແທ້ບໍ່
    const category = await prisma.category.findUnique({
        where: { category_id },
    });

    if (!category) throw new Error("CATEGORY_NOT_FOUND");

    const course = await prisma.course.create({
        data: {
            instructor_id,
            category_id,
            title,
            description,
            price: normalizePrice(price),
            thumbnail_url,
            level,
            is_published,
        },
    });
    return course;
};

export const updateCourseService = async (
    course_id: string,
    instructor_id: string,
    userRole: string,
    data: {
        category_id?: string;
        title?: string;
        description?: string;
        price?: string | number;
        thumbnail_url?: string;
        level?: string;
        is_published?: boolean;
    },
) => {
    //ເຊັກວ່າ course ມີຢູ່ແທ້ບໍ່
    const course = await prisma.course.findUnique({
        where: { course_id },
    });

    if (!course) throw new Error("COURSE_NOT_FOUND");
    // ເັຊກ ownership ຄວາມເປັນເຈົ້າຂອງ - instructor ຕ້ອວເປັນເຈົ້າຂອງ
    if (userRole !== "admin" && course.instructor_id !== instructor_id) {
        throw new Error("FORBIDDEN");
    }

    const udpated = await prisma.course.update({
        where: { course_id },
        data: {
            ...data,
            price: normalizePrice(data.price),
        },
    });

    if (data.thumbnail_url && data.thumbnail_url !== course.thumbnail_url) {
        await deleteUploadedFile(course.thumbnail_url);
    }

    return udpated;
};

export const deleteCourseService = async (
    course_id: string,
    instructor_id: string,
    userRole: string,
) => {
    const course = await prisma.course.findUnique({
        where: {
            course_id,
        },
        include: {
            lessons: {
                include: {
                    files: true,
                },
            },
        },
    });

    if (!course) throw new Error("COURSE_NOT_FOUND");

    if (userRole !== "admin" && course.instructor_id !== instructor_id) {
        throw new Error("FORBIDDEN");
    }
    const uploadedFileUrls = [
        course.thumbnail_url,
        ...course.lessons.flatMap((lesson) => {
            return lesson.files.map((file) => file.file_url);
        }),
    ];

    await prisma.$transaction([
        prisma.certificate.deleteMany({
            where: {
                course_id,
            },
        }),
        prisma.course.delete({
            where: {
                course_id,
            },
        }),
    ]);

    await deleteUploadedFiles(uploadedFileUrls);

    return {
        message: "ລົບ Course ສຳເລັດ",
    };
};
