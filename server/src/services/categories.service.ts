import { prisma } from "../lib/prisma";

export const getCategoriesService = async () => {
    const [categories, courseCounts] = await Promise.all([
        prisma.category.findMany({
            select: {
                category_id: true,
                name: true,
                description: true,
                icon: true,
                created_at: true,
                updated_at: true,
            },
            orderBy: {
                created_at: "asc",
            },
        }),
        prisma.course.groupBy({
            by: ["category_id"],
            where: {
                is_published: true,
            },
            _count: {
                course_id: true,
            },
        }),
    ]);

    const countByCategoryId = new Map(
        courseCounts.map((item) => [item.category_id, item._count.course_id]),
    );

    return categories.map((category) => ({
        ...category,
        course_count: countByCategoryId.get(category.category_id) ?? 0,
    }));
};

export const getDefaultCategoriesService = async () => {
    const defaultCategories = [
        { name: "ການພັດທະນາເວັບ", description: "Web development courses", icon: "🌐" },
        { name: "ການອອກແບບ", description: "Design and UI/UX courses", icon: "🎨" },
        { name: "ທຸລະກິດ", description: "Business courses", icon: "💼" },
        { name: "ການຕະຫຼາດ", description: "Marketing courses", icon: "📈" },
        { name: "ພາສາ", description: "Language courses", icon: "🗣️" },
        { name: "ເທັກໂນໂລຊີ", description: "Technology courses", icon: "💻" },
        { name: "ການເງິນ", description: "Finance courses", icon: "💰" },
        { name: "ສຸຂະພາບ", description: "Health courses", icon: "⚕️" },
    ];

    const existingCategories = await prisma.category.findMany({
        select: {
            category_id: true,
            name: true,
            icon: true,
        },
    });

    const existingNames = new Set(existingCategories.map((category) => category.name));
    const categoriesToCreate = defaultCategories.filter(
        (category) => !existingNames.has(category.name),
    );

    if (categoriesToCreate.length > 0) {
        await prisma.category.createMany({
            data: categoriesToCreate,
            skipDuplicates: true,
        });
    }

    await Promise.all(
        defaultCategories.map((category) => {
            const existing = existingCategories.find((item) => item.name === category.name);

            if (!existing || (existing.icon && existing.icon !== "📚")) {
                return null;
            }

            return prisma.category.update({
                where: {
                    category_id: existing.category_id,
                },
                data: {
                    icon: category.icon,
                },
            });
        }),
    );

    return getCategoriesService();
};

export const getCategoryByIdService = async (categoryId: string) => {
    const category = await prisma.category.findUnique({
        where: {
            category_id: categoryId,
        },
    });

    if (!category) throw new Error("NO_CATEGORY_FOUND");

    return category;
};

export const createCategoryService = async (
    name: string,
    description?: string,
    icon?: string,
) => {
    const newCategory = await prisma.category.create({
        data: {
            name: name,
            description: description,
            icon: icon || "📚",
        },
    });
    return newCategory;
};

export const updateCategoryService = async (
    categoryId: string,
    data: {
        name?: string;
        description?: string;
        icon?: string;
    },
) => {
    const category = await prisma.category.findUnique({
        where: {
            category_id: categoryId,
        },
    });
    if (!category) throw new Error("NO_CATEGORY_FOUND");

    const updated = await prisma.category.update({
        where: { category_id: categoryId },
        data: {
            name: data.name,
            description: data.description,
            icon: data.icon,
        },
    });
    return updated;
};

export const deleteCategoryService = async (categoryId: string) => {
    //ເຊັກກ່ອນວ່າ  category id ມີບໍ່ in DB
    const category = await prisma.category.findUnique({
        where: {
            category_id: categoryId,
        },
    });
    if (!category) throw new Error("NO_CATEGORY_FOUND");

    await prisma.category.delete({
        where: {
            category_id: categoryId,
        },
    });
    return category;
};
