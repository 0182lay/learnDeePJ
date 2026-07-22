import multer from "multer";
import path from "path";
import fs from "fs";

const getUploadFolder = (mimetype: string) => {
    if (mimetype.startsWith("video/")) return "uploads/videos";
    if (mimetype.startsWith("image/")) return "uploads/images";

    if (documentTypes.includes(mimetype)) return "uploads/documents";

    return "uploads/others";
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = getUploadFolder(file.mimetype);
        fs.mkdirSync(folder, { recursive: true });
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, filename);
    },
});

const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = "uploads/profiles";
        fs.mkdirSync(folder, { recursive: true });
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, filename);
    },
});

const paymentSlipStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = "uploads/payment-slips";
        fs.mkdirSync(folder, { recursive: true });
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, filename);
    },
});

const documentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "application/zip",
    "application/x-zip-compressed",
];

const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
) => {
    const isVideo = file.mimetype.startsWith("video/");
    const isImage = file.mimetype.startsWith("image/");
    const isDocument = documentTypes.includes(file.mimetype);

    if (isVideo || isImage || isDocument) {
        cb(null, true);
    } else {
        cb(new Error("INVALID_FILE_TYPE"));
    }
};

export const uploadLessonFile = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024,
    },
});

export const uploadCourseCover = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("INVALID_IMAGE_TYPE"));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

export const uploadProfileAvatar = multer({
    storage: profileStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("INVALID_IMAGE_TYPE"));
        }
    },
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
});

export const uploadPaymentSlip = multer({
    storage: paymentSlipStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("INVALID_IMAGE_TYPE"));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
