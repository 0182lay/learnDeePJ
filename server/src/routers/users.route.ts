import express from "express";
import {
    getUsers,
    getById,
    getMe,
    updateMyProfile,
    requestInstructor,
    uploadMyAvatar,
    updateUser,
    deleteUser,
} from "../controllers/users.controller";

import { auth } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { uploadProfileAvatar } from "../middlewares/upload.middleware";


const router = express.Router();

router.get("/me", auth, getMe);
router.patch("/me/profile", auth, updateMyProfile);
router.post("/me/instructor-request", auth, requestInstructor);
router.post("/me/avatar/upload", auth, uploadProfileAvatar.single("file"), uploadMyAvatar);

router.get("/users", auth, authorizeRoles("admin"), getUsers);
router.get("/users/:userId", auth, authorizeRoles("admin"), getById);
router.put("/users/:userId", auth, authorizeRoles("admin"), updateUser);
router.delete("/users/:userId", auth, authorizeRoles("admin"), deleteUser);

export default router;
