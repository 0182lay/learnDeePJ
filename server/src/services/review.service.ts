import { prisma } from "../lib/prisma";

const validateRating = (rating: number) => {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error("INVALID_RATING");
    }
};

export const getReviewsService = async (course_id: string) => {
    const course = await prisma.course.findUnique({
        where: { course_id },
    });

    if (!course) throw new Error("COURSE_NOT_FOUND");

    return prisma.courseReview.findMany({
        where: { course_id },
        include: {
            student: {
                include: { profile: true },
            },
        },
        orderBy: { created_at: "desc" },
    });
};

export const getReviewStatsService = async (course_id: string) => {
    const result = await prisma.courseReview.aggregate({
        where: { course_id },
        _avg: {
            rating: true,
        },
        _count: {
            review_id: true,
        },
    });

    return {
        average_rating: Number((result._avg.rating ?? 0).toFixed(1)),
        review_count: result._count.review_id,
    };
};

export const createReviewService = async (
    course_id: string,
    student_id: string,
    data: {
        rating: number;
        comment?: string;
    },
) => {
    const course = await prisma.course.findUnique({
        where: { course_id },
    });

    if (!course) throw new Error("COURSE_NOT_FOUND");

    const enrollment = await prisma.enrollment.findUnique({
        where: {
            student_id_course_id: { student_id, course_id },
        },
    });

    if (!enrollment) throw new Error("NOT_ENROLLED");

    validateRating(data.rating);

    return prisma.courseReview.upsert({
        where: {
            course_id_student_id: { course_id, student_id },
        },
        create: {
            course_id,
            student_id,
            rating: data.rating,
            comment: data.comment,
        },
        update: {
            rating: data.rating,
            comment: data.comment,
        },
        include: {
            student: {
                include: { profile: true },
            },
        },
    });
};

export const updateReviewService = async (
    review_id: string,
    student_id: string,
    userRole: string,
    data: {
        rating?: number;
        comment?: string;
    },
) => {
    const review = await prisma.courseReview.findUnique({
        where: { review_id },
    });

    if (!review) throw new Error("REVIEW_NOT_FOUND");

    if (userRole !== "admin" && review.student_id !== student_id) {
        throw new Error("FORBIDDEN");
    }

    if (data.rating !== undefined) {
        validateRating(data.rating);
    }

    return prisma.courseReview.update({
        where: { review_id },
        data,
        include: {
            student: {
                include: { profile: true },
            },
        },
    });
};

export const deleteReviewService = async (
    review_id: string,
    student_id: string,
    userRole: string,
) => {
    const review = await prisma.courseReview.findUnique({
        where: { review_id },
    });

    if (!review) throw new Error("REVIEW_NOT_FOUND");

    if (userRole !== "admin" && review.student_id !== student_id) {
        throw new Error("FORBIDDEN");
    }

    await prisma.courseReview.delete({
        where: { review_id },
    });

    return { message: "Review deleted" };
};
