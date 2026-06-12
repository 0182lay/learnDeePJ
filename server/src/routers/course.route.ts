import { Router } from "express";
import {
    getCourses,
    getMyCourses,
    getCoursesById,
    createCourse,
    uploadCourseCover,
    updateCourse,
    deleteCourse,
} from "../controllers/course.controller";
import { auth } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { uploadCourseCover as uploadCourseCoverMiddleware } from "../middlewares/upload.middleware";

const router = Router();

router.get("/courses", getCourses);
router.get(
    "/my-courses",
    auth,
    authorizeRoles("instructor", "admin"),
    getMyCourses,
);
router.get("/courses/:courseId", getCoursesById);
router.post(
    "/courses",
    auth,
    authorizeRoles("instructor", "admin"),
    createCourse,
);
router.post(
    "/courses/cover/upload",
    auth,
    authorizeRoles("instructor", "admin"),
    uploadCourseCoverMiddleware.single("file"),
    uploadCourseCover,
);
router.patch(
    "/courses/:courseId",
    auth,
    authorizeRoles("instructor", "admin"),
    updateCourse,
);
router.delete(
    "/courses/:courseId",
    auth,
    authorizeRoles("instructor", "admin"),
    deleteCourse,
);

export default router;
