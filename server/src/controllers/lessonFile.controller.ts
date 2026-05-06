import { Request, Response } from "express";
import fs from "fs";
import { FileType } from "../../generated/prisma/enums";
import {
    getLessonFilesService,
    createLessonFileService,
    deleteLessonFileService,
} from "../services/lessonFile.service";

const getFileTypeFromUpload = (file?: Express.Multer.File) => {
    if (!file) return undefined;
    if (file.mimetype.startsWith("video/")) return FileType.video;
    if (file.mimetype.startsWith("image/")) return FileType.image;
    return FileType.document;
};

const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;

export const getLessonFiles = async (req: Request, res: Response) => {
    try {
        const lessonId = req.params.lessonId as string;
        const files = await getLessonFilesService(lessonId);
        return res
            .status(200)
            .json({ message: "ດຶງຂໍ້ມູນສຳເລັດ", data: files });
    } catch (error: any) {
        console.log(error);
        if (error.message === "LESSON_NOT_FOUND") {
            return res.status(404).json({ message: "ບໍ່ພົບ Lesson" });
        }
        return res.status(500).json({ message: "ດຶງຂໍ້ມູນ File ບໍ່ສຳເລັດ" });
    }
};

export const createLessonFile = async (req: Request, res: Response) => {
    try {
        const lessonId = req.params.lessonId as string;
        const instructor_id = (req as any).user?.user?.id;
        const userRole = (req as any).user?.user?.role;
        const uploadedFile = req.file;
        const { duration_seconds, order_index } = req.body;
        const fileType = req.body.file_type || getFileTypeFromUpload(uploadedFile);
        const durationSeconds = duration_seconds ? Number(duration_seconds) : undefined;

        if (fileType === FileType.video && durationSeconds && durationSeconds > 120) {
            if (uploadedFile) {
                fs.unlink(uploadedFile.path, () => {});
            }

            return res.status(400).json({
                message: "Video must be 2 minutes or less",
            });
        }

        if (
            fileType === FileType.document &&
            uploadedFile &&
            uploadedFile.size > MAX_DOCUMENT_SIZE
        ) {
            fs.unlink(uploadedFile.path, () => {});

            return res.status(400).json({
                message: "Document must be 20MB or less",
            });
        }

        const fileUrl = uploadedFile
            ? `/${uploadedFile.path.replace(/\\/g, "/")}`
            : req.body.file_url;
        const originalName = uploadedFile
            ? uploadedFile.originalname
            : req.body.original_name;
        const sizeBytes = uploadedFile
            ? uploadedFile.size
            : req.body.size_bytes;

        if (!fileType) {
            return res.status(400).json({ message: "file_type is required" });
        }

        const file = await createLessonFileService(lessonId, instructor_id, userRole, {
            file_type: fileType,
            file_url: fileUrl,
            original_name: originalName,
            duration_seconds: durationSeconds,
            size_bytes: sizeBytes ? Number(sizeBytes) : undefined,
            order_index: order_index ? Number(order_index) : undefined,
        });
        return res
            .status(201)
            .json({ message: "ສ້າງ File ສຳເລັດ", data: file });
    } catch (error: any) {
        console.log(error);
        if (error.message === "LESSON_NOT_FOUND") {
            return res.status(404).json({ message: "ບໍ່ພົບ Lesson" });
        }
        if (error.message === "FORBIDDEN") {
            return res.status(403).json({ message: "ບໍ່ມີສິດສ້າງ File" });
        }
        return res.status(500).json({ message: "ສ້າງ File ບໍ່ສຳເລັດ" });
    }
};

export const deleteLessonFile = async (req: Request, res: Response) => {
    try {
        const fileId = req.params.fileId as string;
        const instructor_id = (req as any).user?.user?.id;
        const userRole = (req as any).user?.user?.role;

        await deleteLessonFileService(fileId, instructor_id, userRole);

        return res.status(200).json({
            message: "ລົບ file ສຳເລັດ",
        });
    } catch (error: any) {
        console.log(error);
        if (error.message === "FILE_NOT_FOUND") {
            return res.status(404).json({ message: "ບໍ່ພົບ File" });
        }
        if (error.message === "FORBIDDEN") {
            return res.status(403).json({ message: "ບໍ່ມີສິດລົບ File" });
        }
        return res.status(500).json({ message: "ລົບ File ບໍ່ສຳເລັດ" });
    }
};
