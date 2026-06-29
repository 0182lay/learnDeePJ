import { Router } from "express";
import {
    getLessonFiles,
    getLessonFileContent,
    createLessonFile,
    deleteLessonFile,
} from "../controllers/lessonFile.controller";
import { auth } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { uploadLessonFile } from "../middlewares/upload.middleware";

const router = Router({ mergeParams: true });

router.get("/lessons/:lessonId/files", auth, getLessonFiles);
router.get("/lesson-files/:fileId/content", getLessonFileContent);

router.post(
    "/lessons/:lessonId/files",
    auth,
    authorizeRoles("instructor", "admin"),
    createLessonFile,
);

router.delete(
    "/lessons/:lessonId/files/:fileId",
    auth,
    authorizeRoles("instructor", "admin"),
    deleteLessonFile,
);

// upload lesson file
router.post(
    "/lessons/:lessonId/files/upload",
    auth,
    authorizeRoles("instructor", "admin"),
    uploadLessonFile.single("file"),
    createLessonFile,
);

export default router;
