import { Request, Response } from "express";
import {
    getLessonsService,
    getLessonByIdService,
    createLessonService,
    updateLessonService,
    deleteLessonService,
} from "../services/lesson.service";

export const getLessons = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.courseId as string;
        const userId = (req as any).user?.user?.id;
        const userRole = (req as any).user?.user?.role;
        const lessons = await getLessonsService(courseId, {
            userId,
            role: userRole,
        });
        return res.status(200).json({
            message: "ດຶງຂໍ້ມູນສຳເັລດ",
            data: lessons,
        });
    } catch (error: any) {
        if (error.message === "COURSE_NOT_FOUND") {
            return res.status(404).json({ message: "ບໍ່ພົບ Course" });
        }
        if (error.message === "NOT_ENROLLED") {
            return res.status(403).json({ message: "ກະລຸນາລົງທະບຽນຄອສກ່ອນເຂົ້າຮຽນ" });
        }
        if (error.message === "PAYMENT_REQUIRED") {
            return res.status(402).json({ message: "ກະລຸນາຊຳລະເງິນ ແລະ ລໍຖ້າອະນຸມັດກ່ອນເຂົ້າຮຽນ" });
        }
        if (error.message === "FORBIDDEN") {
            return res.status(403).json({ message: "ບໍ່ມີສິດເບິ່ງບົດຮຽນຂອງຄອສນີ້" });
        }
        console.log(error);
        return res.status(500).json({ message: "ດຶງຂໍ້ມູນ Lesson ບໍ່ສຳເລັດ" });
    }
};

export const getLessonById = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.courseId as string;
        const lessonId = req.params.lessonId as string;
        const userId = (req as any).user?.user?.id;
        const userRole = (req as any).user?.user?.role;
        const lesson = await getLessonByIdService(courseId, lessonId, {
            userId,
            role: userRole,
        });
        return res.status(200).json({
            message: "ດຶງຂໍ້ມູນສຳເລັດ ",
            data: lesson,
        });
    } catch (error: any) {
        console.log(error);
        if (error.message === "LESSON_NOT_FOUND") {
            return res.status(404).json({
                message: "ບໍ່ພົບ Lesson",
            });
        }
        if (error.message === "NOT_ENROLLED") {
            return res.status(403).json({ message: "ກະລຸນາລົງທະບຽນຄອສກ່ອນເຂົ້າຮຽນ" });
        }
        if (error.message === "PAYMENT_REQUIRED") {
            return res.status(402).json({ message: "ກະລຸນາຊຳລະເງິນ ແລະ ລໍຖ້າອະນຸມັດກ່ອນເຂົ້າຮຽນ" });
        }
        if (error.message === "FORBIDDEN") {
            return res.status(403).json({ message: "ບໍ່ມີສິດເບິ່ງບົດຮຽນຂອງຄອສນີ້" });
        }
        return res.status(500).json({
            message: "ດຶງຂໍ້ມູນ Lesson ບໍ່ສຳເລັດ",
        });
    }
};

export const createLesson = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.courseId as string;
        const instructor_id = (req as any).user?.user?.id;
        const userRole = (req as any).user?.user?.role;
        const { title, lesson_type, content, description, order_index, is_free_preview, is_last_lesson } =
            req.body;
        const lesson = await createLessonService(courseId, instructor_id, userRole, {
            title,
            lesson_type,
            content,
            description,
            order_index,
            is_free_preview,
            is_last_lesson,
        });
        return res
            .status(201)
            .json({ message: "ສ້າງ Lesson ສຳເລັດ", data: lesson });
    } catch (error: any) {
        console.log(error);
        if (error.message === "COURSE_NOT_FOUND") {
            return res.status(404).json({ message: "ບໍ່ພົບ Course" });
        }
        if (error.message === "FORBIDDEN") {
            return res.status(403).json({ message: "ບໍ່ມີສິດສ້າງ Lesson" });
        }
        return res.status(500).json({ message: "ສ້າງ Lesson ບໍ່ສຳເລັດ" });
    }
};

export const updateLesson = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.courseId as string;
        const lessonId = req.params.lessonId as string;
        const instructor_id = (req as any).user?.user?.id;
        const userRole = (req as any).user?.user?.role;
        const { title, lesson_type, content, description, order_index, is_free_preview, is_last_lesson } =
            req.body;

        const lesson = await updateLessonService(
            courseId,
            lessonId,
            instructor_id,
            userRole,
            { title, lesson_type, content, description, order_index, is_free_preview, is_last_lesson },
        );
        return res.status(200).json({ message: "ອັບເດດ Lesson ສຳເລັດ", data: lesson });
    } catch (error: any) {
        console.log(error);
        if (error.message === "LESSON_NOT_FOUND") {
            return res.status(404).json({ message: "ບໍ່ພົບ Lesson" });
        }
        if (error.message === "FORBIDDEN") {
            return res.status(403).json({ message: "ບໍ່ມີສິດແກ້ໄຂ Lesson" });
        }
        return res.status(500).json({ message: "ອັບເດດ Lesson ບໍ່ສຳເລັດ" });
    }
};

export const deleteLesson = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.courseId as string;
        const lessonId = req.params.lessonId as string;
        const instructor_id = (req as any).user?.user?.id;
        const userRole = (req as any).user?.user?.role;

        await deleteLessonService(courseId, lessonId, instructor_id, userRole);
        return res.status(200).json({ message: "ລົບ Lesson ສຳເລັດ" });
    } catch (error: any) {
        console.log(error);
        if (error.message === "LESSON_NOT_FOUND") {
            return res.status(404).json({ message: "ບໍ່ພົບ Lesson" });
        }
        if (error.message === "FORBIDDEN") {
            return res.status(403).json({ message: "ບໍ່ມີສິດລົບ Lesson" });
        }
        return res.status(500).json({ message: "ລົບ Lesson ບໍ່ສຳເລັດ" });
    }
};
