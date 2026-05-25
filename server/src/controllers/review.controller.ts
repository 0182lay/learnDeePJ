import { Request, Response } from "express";
import {
    getReviewsService,
    getReviewStatsService,
    createReviewService,
    updateReviewService,
    deleteReviewService,
} from "../services/review.service";

export const getReviews = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.courseId as string;
        const [reviews, stats] = await Promise.all([
            getReviewsService(courseId),
            getReviewStatsService(courseId),
        ]);

        return res.status(200).json({
            message: "Reviews loaded",
            data: {
                reviews,
                stats,
            },
        });
    } catch (error: any) {
        if (error.message === "COURSE_NOT_FOUND") {
            return res.status(404).json({ message: "Course not found" });
        }

        return res.status(500).json({ message: "Load reviews failed" });
    }
};

export const createReview = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.courseId as string;
        const studentId = (req as any).user?.user?.id;
        const rating = Number(req.body.rating);
        const comment = req.body.comment as string | undefined;

        const review = await createReviewService(courseId, studentId, {
            rating,
            comment,
        });

        return res.status(201).json({ message: "Review saved", data: review });
    } catch (error: any) {
        if (error.message === "COURSE_NOT_FOUND") {
            return res.status(404).json({ message: "Course not found" });
        }
        if (error.message === "NOT_ENROLLED") {
            return res.status(400).json({ message: "Enroll before reviewing this course" });
        }
        if (error.message === "INVALID_RATING") {
            return res.status(400).json({ message: "Rating must be 1-5" });
        }

        return res.status(500).json({ message: "Save review failed" });
    }
};

export const updateReview = async (req: Request, res: Response) => {
    try {
        const reviewId = req.params.reviewId as string;
        const studentId = (req as any).user?.user?.id;
        const userRole = (req as any).user?.user?.role;
        const rating = req.body.rating === undefined ? undefined : Number(req.body.rating);
        const comment = req.body.comment as string | undefined;

        const review = await updateReviewService(reviewId, studentId, userRole, {
            rating,
            comment,
        });

        return res.status(200).json({ message: "Review updated", data: review });
    } catch (error: any) {
        if (error.message === "REVIEW_NOT_FOUND") {
            return res.status(404).json({ message: "Review not found" });
        }
        if (error.message === "FORBIDDEN") {
            return res.status(403).json({ message: "No permission to edit this review" });
        }
        if (error.message === "INVALID_RATING") {
            return res.status(400).json({ message: "Rating must be 1-5" });
        }

        return res.status(500).json({ message: "Update review failed" });
    }
};

export const deleteReview = async (req: Request, res: Response) => {
    try {
        const reviewId = req.params.reviewId as string;
        const studentId = (req as any).user?.user?.id;
        const userRole = (req as any).user?.user?.role;

        await deleteReviewService(reviewId, studentId, userRole);

        return res.status(200).json({ message: "Review deleted" });
    } catch (error: any) {
        if (error.message === "REVIEW_NOT_FOUND") {
            return res.status(404).json({ message: "Review not found" });
        }
        if (error.message === "FORBIDDEN") {
            return res.status(403).json({ message: "No permission to delete this review" });
        }

        return res.status(500).json({ message: "Delete review failed" });
    }
};
