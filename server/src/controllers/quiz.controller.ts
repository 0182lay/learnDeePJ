import { Request, Response } from "express";
import {
    getQuizService,
    createQuizService,
    updateQuizService,
    deleteQuizService,
    submitQuizService,
    getQuizResultService,
} from "../services/quiz.service";
import { assertLessonAccessByLessonId } from "../services/lesson.service";

export const getQuiz = async (req: Request, res: Response) => {
    try {
        const lessonId = req.params.lessonId as string;
        const userId = (req as any).user?.user?.id;
        const userRole = (req as any).user?.user?.role;
        await assertLessonAccessByLessonId(lessonId, { userId, role: userRole });
        const quiz = await getQuizService(lessonId);
        return res.status(200).json({ message: "ດຶງຂໍ້ມູນສຳເລັດ", data: quiz });
    } catch (error: any) {
        if (error.message === "QUIZ_NOT_FOUND") {
            return res.status(404).json({ message: "ບໍ່ພົບ Quiz" });
        }
        if (error.message === "LESSON_NOT_FOUND") {
            return res.status(404).json({ message: "ບໍ່ພົບ Lesson" });
        }
        if (error.message === "NOT_ENROLLED") {
            return res.status(403).json({ message: "ກະລຸນາລົງທະບຽນຄອສກ່ອນເຂົ້າຮຽນ" });
        }
        if (error.message === "PAYMENT_REQUIRED") {
            return res.status(402).json({ message: "ກະລຸນາຊຳລະເງິນ ແລະ ລໍຖ້າອະນຸມັດກ່ອນເຂົ້າຮຽນ" });
        }
        if (error.message === "FORBIDDEN") {
            return res.status(403).json({ message: "ບໍ່ມີສິດເບິ່ງ Quiz ຂອງບົດຮຽນນີ້" });
        }
        return res.status(500).json({ message: "ດຶງຂໍ້ມູນ Quiz ບໍ່ສຳເລັດ" });
    }
};

export const createQuiz = async (req: Request, res: Response) => {
    try {
        const lessonId = req.params.lessonId as string;
        const instructor_id = (req as any).user?.user?.id;
        const userRole = (req as any).user?.user?.role;
        const { title, description, questions } = req.body;

        const quiz = await createQuizService(
            lessonId,
            instructor_id,
            userRole,
            {
                title,
                description,
                questions,
            },
        );

        return res
            .status(201)
            .json({ message: "ສ້າງ Quiz ສຳເລັດ", data: quiz });
    } catch (error: any) {
        if (error.message === "LESSON_NOT_FOUND") {
            return res.status(404).json({ message: "ບໍ່ພົບ Lesson" });
        }
        if (error.message === "FORBIDDEN") {
            return res.status(403).json({ message: "ບໍ່ມີສິດສ້າງ Quiz" });
        }
        if (error.message === "QUIZ_ALREADY_EXISTS") {
            return res.status(400).json({ message: "Lesson ນີ້ມີ Quiz ແລ້ວ" });
        }
        return res.status(500).json({ message: "ສ້າງ Quiz ບໍ່ສຳເລັດ" });
    }
};

export const updateQuiz = async (req: Request, res: Response) => {
    try {
        const lessonId = req.params.lessonId as string;
        const instructor_id = (req as any).user?.user?.id;
        const userRole = (req as any).user?.user?.role;
        const { title, description, questions } = req.body;

        const quiz = await updateQuizService(
            lessonId,
            instructor_id,
            userRole,
            {
                title,
                description,
                questions,
            },
        );

        return res
            .status(200)
            .json({ message: "ອັບເດດ Quiz ສຳເລັດ", data: quiz });
    } catch (error: any) {
        if (error.message === "QUIZ_NOT_FOUND") {
            return res.status(404).json({ message: "ບໍ່ພົບ Quiz" });
        }
        if (error.message === "FORBIDDEN") {
            return res.status(403).json({ message: "ບໍ່ມີສິດແກ້ໄຂ Quiz" });
        }
        return res.status(500).json({ message: "ອັບເດດ Quiz ບໍ່ສຳເລັດ" });
    }
};

export const deleteQuiz = async (req: Request, res: Response) => {
    try {
        const lessonId = req.params.lessonId as string;
        const instructor_id = (req as any).user?.user?.id;
        const userRole = (req as any).user?.user?.role;

        await deleteQuizService(lessonId, instructor_id, userRole);

        return res.status(200).json({ message: "ລົບ Quiz ສຳເລັດ" });
    } catch (error: any) {
        if (error.message === "QUIZ_NOT_FOUND") {
            return res.status(404).json({ message: "ບໍ່ພົບ Quiz" });
        }
        if (error.message === "FORBIDDEN") {
            return res.status(403).json({ message: "ບໍ່ມີສິດລົບ Quiz" });
        }
        return res.status(500).json({ message: "ລົບ Quiz ບໍ່ສຳເລັດ" });
    }
};

export const submitQuiz = async (req: Request, res: Response) => {
    try {
        const lessonId = req.params.lessonId as string;
        const student_id = (req as any).user?.user?.id;
        const userRole = (req as any).user?.user?.role;
        const { answers } = req.body;
        await assertLessonAccessByLessonId(lessonId, { userId: student_id, role: userRole });

        const result = await submitQuizService(lessonId, student_id, answers);

        return res.status(201).json({
            message: "ສົ່ງ Quiz ສຳເລັດ",
            data: {
                score: result.score,
                total: result.total,
                percent: result.percent,
                passed: result.passed,
                pass_percent: result.pass_percent,
                submission: result.submission,
            },
        });
    } catch (error: any) {
        if (error.message === "QUIZ_NOT_FOUND") {
            return res.status(404).json({ message: "ບໍ່ພົບ Quiz" });
        }
        if (error.message === "LESSON_NOT_FOUND") {
            return res.status(404).json({ message: "ບໍ່ພົບ Lesson" });
        }
        if (error.message === "NOT_ENROLLED") {
            return res.status(403).json({ message: "ກະລຸນາລົງທະບຽນຄອສກ່ອນເຂົ້າຮຽນ" });
        }
        if (error.message === "PAYMENT_REQUIRED") {
            return res.status(402).json({ message: "ກະລຸນາຊຳລະເງິນ ແລະ ລໍຖ້າອະນຸມັດກ່ອນເຂົ້າຮຽນ" });
        }
        if (error.message === "FORBIDDEN") {
            return res.status(403).json({ message: "ບໍ່ມີສິດສົ່ງ Quiz ຂອງບົດຮຽນນີ້" });
        }
        return res.status(500).json({ message: "ສົ່ງ Quiz ບໍ່ສຳເລັດ" });
    }
};

export const getQuizResult = async (req: Request, res: Response) => {
    try {
        const lessonId = req.params.lessonId as string;
        const student_id = (req as any).user?.user?.id;
        const userRole = (req as any).user?.user?.role;
        await assertLessonAccessByLessonId(lessonId, { userId: student_id, role: userRole });

        const result = await getQuizResultService(lessonId, student_id);

        return res
            .status(200)
            .json({ message: "ດຶງຂໍ້ມູນສຳເລັດ", data: result });
    } catch (error: any) {
        if (error.message === "QUIZ_NOT_FOUND") {
            return res.status(404).json({ message: "ບໍ່ພົບ Quiz" });
        }
        if (error.message === "SUBMISSION_NOT_FOUND") {
            return res.status(404).json({ message: "ຍັງບໍ່ໄດ້ສົ່ງ Quiz" });
        }
        if (error.message === "LESSON_NOT_FOUND") {
            return res.status(404).json({ message: "ບໍ່ພົບ Lesson" });
        }
        if (error.message === "NOT_ENROLLED") {
            return res.status(403).json({ message: "ກະລຸນາລົງທະບຽນຄອສກ່ອນເຂົ້າຮຽນ" });
        }
        if (error.message === "PAYMENT_REQUIRED") {
            return res.status(402).json({ message: "ກະລຸນາຊຳລະເງິນ ແລະ ລໍຖ້າອະນຸມັດກ່ອນເຂົ້າຮຽນ" });
        }
        if (error.message === "FORBIDDEN") {
            return res.status(403).json({ message: "ບໍ່ມີສິດເບິ່ງຜົນ Quiz ຂອງບົດຮຽນນີ້" });
        }
        return res.status(500).json({ message: "ດຶງຂໍ້ມູນ Result ບໍ່ສຳເລັດ" });
    }
};
