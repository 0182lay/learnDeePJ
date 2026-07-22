import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { FileType } from "../../generated/prisma/enums";
import {
    getLessonFilesService,
    getLessonFileContentService,
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
const JWT_SECRET = process.env.JWT_SECRET as string;

const getUserFromRequest = (req: Request) => {
    const authHeader = req.headers.authorization;
    const queryToken = typeof req.query.token === "string" ? req.query.token : "";
    const rawToken = authHeader || queryToken;
    const token = rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;

    if (!token) {
        throw new Error("NO_TOKEN");
    }

    return jwt.verify(token, JWT_SECRET) as any;
};

export const getLessonFiles = async (req: Request, res: Response) => {
    try {
        const lessonId = req.params.lessonId as string;
        const userId = (req as any).user?.user?.id;
        const userRole = (req as any).user?.user?.role;
        const files = await getLessonFilesService(lessonId, userId, userRole);
        return res
            .status(200)
            .json({ message: "ດຶງຂໍ້ມູນສຳເລັດ", data: files });
    } catch (error: any) {
        console.log(error);
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
            return res.status(403).json({ message: "ບໍ່ມີສິດເບິ່ງໄຟລ໌ຂອງບົດຮຽນນີ້" });
        }
        return res.status(500).json({ message: "ດຶງຂໍ້ມູນ File ບໍ່ສຳເລັດ" });
    }
};

export const getLessonFileContent = async (req: Request, res: Response) => {
    try {
        const fileId = req.params.fileId as string;
        const decoded = getUserFromRequest(req);
        const file = await getLessonFileContentService(
            fileId,
            decoded?.user?.id,
            decoded?.user?.role,
        );
        const uploadsRoot = path.resolve(process.cwd(), "uploads");
        const filePath = path.resolve(process.cwd(), file.file_url.replace(/^\/+/, ""));

        if (
            filePath !== uploadsRoot &&
            !filePath.startsWith(`${uploadsRoot}${path.sep}`)
        ) {
            return res.status(400).json({ message: "INVALID_FILE_PATH" });
        }

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "ບໍ່ພົບ File" });
        }

        return res.sendFile(filePath);
    } catch (error: any) {
        if (error.message === "NO_TOKEN" || error?.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "INVALID_TOKEN" });
        }
        if (error.message === "FILE_NOT_FOUND") {
            return res.status(404).json({ message: "ບໍ່ພົບ File" });
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
            return res.status(403).json({ message: "ບໍ່ມີສິດເບິ່ງໄຟລ໌ຂອງບົດຮຽນນີ້" });
        }

        console.log(error);
        return res.status(500).json({ message: "ດຶງ File ບໍ່ສຳເລັດ" });
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

        if (fileType === FileType.video && durationSeconds && durationSeconds > 1200) {
            if (uploadedFile) {
                fs.unlink(uploadedFile.path, () => {});
            }

            return res.status(400).json({
                message: "Video must be 20 minutes or less",
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
