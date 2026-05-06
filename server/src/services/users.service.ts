import { prisma } from "../lib/prisma";
import { Role } from "../../generated/prisma/client";

export const getUsersService = async () => {
    const users = await prisma.user.findMany({
        select: {
            user_id: true,
            email: true,
            role: true,
            is_active: true,
            created_at: true,
            updated_at: true,
            profile: true,
        },
    });
    return users;
};

export const getByIdService = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            user_id: userId,
        },
        include: {
            profile: true,
        },
    });

    if (!user) throw new Error("USER_NOT_FOUND");

    const { password_hash: _, ...safeUser } = user;

    return safeUser;
};

export const getMeService = async (userId: string) => {
    return getByIdService(userId);
};

export const updateMyProfileService = async (
    userId: string,
    data: {
        first_name?: string;
        last_name?: string;
        avatar_url?: string;
        bio?: string;
        phone?: string;
    },
) => {
    const user = await prisma.user.findUnique({
        where: { user_id: userId },
        include: { profile: true },
    });

    if (!user) throw new Error("USER_NOT_FOUND");

    const updated = await prisma.user.update({
        where: { user_id: userId },
        data: {
            profile: {
                upsert: {
                    create: {
                        first_name: data.first_name || "",
                        last_name: data.last_name || "",
                        avatar_url: data.avatar_url,
                        bio: data.bio,
                        phone: data.phone,
                    },
                    update: {
                        first_name: data.first_name,
                        last_name: data.last_name,
                        avatar_url: data.avatar_url,
                        bio: data.bio,
                        phone: data.phone,
                    },
                },
            },
        },
        select: {
            user_id: true,
            email: true,
            role: true,
            is_active: true,
            created_at: true,
            updated_at: true,
            profile: true,
        },
    });

    return updated;
};

export const requestInstructorService = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { user_id: userId },
    });

    if (!user) throw new Error("USER_NOT_FOUND");
    if (user.role === "admin") throw new Error("ADMIN_CANNOT_REQUEST");
    if (user.role === "instructor" && user.is_active) {
        throw new Error("ALREADY_INSTRUCTOR");
    }

    const updated = await prisma.user.update({
        where: { user_id: userId },
        data: {
            role: "instructor",
            is_active: false,
        },
        select: {
            user_id: true,
            email: true,
            role: true,
            is_active: true,
            created_at: true,
            updated_at: true,
            profile: true,
        },
    });

    return updated;
};

export const updateUserService = async (
    userId: string,
    data: {
        email?: string;
        role?: Role;
        is_active?: boolean;
        first_name?: string;
        last_name?: string;
        avatar_url?: string;
        bio?: string;
        phone?: string;
    },
) => {
    // 1. ເຊັກອີເມວ in DB
    const user = await prisma.user.findUnique({
        where: {
            user_id: userId,
        },
    });
    if (!user) throw new Error("USER_NOT_FOUND");

    // 2. update
    const updated = await prisma.user.update({
        where: { user_id: userId },
        data: {
            email: data.email,
            role: data.role,
            is_active: data.is_active,
            profile: {
                update: {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    avatar_url: data.avatar_url,
                    bio: data.bio,
                    phone: data.phone,
                },
            },
        },
        select: {
            user_id: true,
            email: true,
            role: true,
            is_active: true,
            created_at: true,
            updated_at: true,
            profile: true,
        },
    });
    return updated;
};

export const deleteUserService = async (userId: string) => {
    //ເຊັກກ່ອນວ່າ user id ນີ້ມີບໍ່
    const user = await prisma.user.findUnique({
        where: {
            user_id: userId,
        },
    });
    if (!user) throw new Error("USER_NOT_FOUND");

    //delete
    await prisma.user.delete({
        where: {
            user_id: userId,
        },
    });
    return user;
};
