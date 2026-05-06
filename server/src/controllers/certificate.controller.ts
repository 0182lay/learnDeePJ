import { Request, Response } from "express";
import {
    getMyCertificatesService,
    issueCertificateService,
} from "../services/certificate.service";

export const getMyCertificates = async (req: Request, res: Response) => {
    try {
        const student_id = (req as any).user?.user?.id;
        const certificates = await getMyCertificatesService(student_id);

        return res.status(200).json({
            message: "ດຶງຂໍ້ມູນໃບປະກາດສຳເລັດ",
            data: certificates,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "ດຶງຂໍ້ມູນໃບປະກາດບໍ່ສຳເລັດ",
        });
    }
};

export const issueCertificate = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.courseId as string;
        const student_id = (req as any).user?.user?.id;
        const certificate = await issueCertificateService(courseId, student_id);

        return res.status(201).json({
            message: "ອອກໃບປະກາດສຳເລັດ",
            data: certificate,
        });
    } catch (error: any) {
        if (error.message === "ENROLLMENT_NOT_FOUND") {
            return res.status(404).json({ message: "ຍັງບໍ່ໄດ້ລົງທະບຽນຄອສນີ້" });
        }
        if (error.message === "COURSE_NOT_PAID") {
            return res.status(403).json({ message: "ຕ້ອງຊຳລະເງິນກ່ອນຮັບໃບປະກາດ" });
        }
        if (error.message === "COURSE_NOT_COMPLETE") {
            return res.status(400).json({ message: "ຕ້ອງຮຽນບົດຮຽນໃຫ້ຄົບກ່ອນ" });
        }
        if (error.message === "QUIZ_NOT_PASSED") {
            return res.status(400).json({ message: "ຕ້ອງຜ່ານແບບທົດສອບກ່ອນ" });
        }

        console.log(error);
        return res.status(500).json({
            message: "ອອກໃບປະກາດບໍ່ສຳເລັດ",
        });
    }
};
