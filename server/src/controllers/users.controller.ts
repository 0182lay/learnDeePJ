import { Request, Response } from "express";
import {
    getUsersService,
    getByIdService,
    getMeService,
    updateMyProfileService,
    requestInstructorService,
    updateUserService,
    deleteUserService,
} from "../services/users.service";

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await getUsersService();

        return res.status(200).json({ data: users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "server error",
        });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.user?.id as string;
        const user = await getMeService(userId);

        return res.status(200).json({ data: user });
    } catch (error: any) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ message: "USER_NOT_FOUND" });
        }

        console.log(error);
        return res.status(500).json({ message: "server error" });
    }
};

export const updateMyProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.user?.id as string;
        const { first_name, last_name, avatar_url, bio, phone } = req.body;

        const updated = await updateMyProfileService(userId, {
            first_name,
            last_name,
            avatar_url,
            bio,
            phone,
        });

        return res.status(200).json({
            message: "PROFILE_UPDATED",
            data: updated,
        });
    } catch (error: any) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ message: "USER_NOT_FOUND" });
        }

        console.log(error);
        return res.status(500).json({ message: "server error" });
    }
};

export const requestInstructor = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.user?.id as string;
        const updated = await requestInstructorService(userId);

        return res.status(200).json({
            message: "INSTRUCTOR_REQUEST_CREATED",
            data: updated,
        });
    } catch (error: any) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ message: "USER_NOT_FOUND" });
        }

        if (error.message === "ALREADY_INSTRUCTOR") {
            return res.status(400).json({ message: "ALREADY_INSTRUCTOR" });
        }

        if (error.message === "ADMIN_CANNOT_REQUEST") {
            return res.status(400).json({ message: "ADMIN_CANNOT_REQUEST" });
        }

        console.log(error);
        return res.status(500).json({ message: "server error" });
    }
};

export const uploadMyAvatar = async (req: Request, res: Response) => {
    try {
        const uploadedFile = req.file;

        if (!uploadedFile) {
            return res.status(400).json({
                message: "AVATAR_REQUIRED",
            });
        }

        return res.status(201).json({
            message: "AVATAR_UPLOADED",
            data: {
                url: `/${uploadedFile.path.replace(/\\/g, "/")}`,
                original_name: uploadedFile.originalname,
                size_bytes: uploadedFile.size,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "UPLOAD_AVATAR_FAILED" });
    }
};

export const getById = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;

        const user = await getByIdService(userId);

        // ຕັດ password_hash ອອກກ່ອນ return

        return res.status(200).json({
            data: user,
        });
    } catch (error: any) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({
                message: "ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້",
            });
        }
        console.log(error);
        return res.status(500).json({
            message: "server error",
        });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;
        const { email, role, is_active, first_name, last_name, avatar_url, bio, phone } =
            req.body;
        const updated = await updateUserService(userId, {
            email,
            role,
            is_active,
            first_name,
            last_name,
            avatar_url,
            bio,
            phone,
        });

        return res.status(200).json({
            message: "ອັບເດດສຳເລັດ!!!",
            data: updated,
        });
    } catch (error: any) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({
                message: "ບໍ່ພົບຜູ້ໃຊ້ງານ",
            });
        }
        console.log(error);
        return res.status(500).json({
            message: "server error",
        });
    }
};
//DELETE http://localhost:3000/users/abc-1234-uuid =>ແມ່ນ params
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string; // ← ບອກ TypeScript ວ່າເປັນ string

        await deleteUserService(userId);

        return res.status(200).json({
            message: "ລົບຜູ້ໃຊ້ສຳເລັດແລ້ວ",
        });
    } catch (error: any) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({
                message: "ບໍ່ພົບຜູ້ໃຊ້",
            });
        }
        console.log(error);
        return res.status(500).json({
            message: "server error",
        });
    }
};
