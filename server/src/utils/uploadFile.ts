import fs from "fs/promises";
import path from "path";

const uploadsRoot = path.resolve(process.cwd(), "uploads");

export const deleteUploadedFile = async (fileUrl?: string | null) => {
    if (!fileUrl) return;

    const relativePath = fileUrl.replace(/^\/+/, "");
    const absolutePath = path.resolve(process.cwd(), relativePath);

    if (
        absolutePath !== uploadsRoot &&
        !absolutePath.startsWith(`${uploadsRoot}${path.sep}`)
    ) {
        return;
    }

    try {
        await fs.unlink(absolutePath);
    } catch (error: any) {
        if (error?.code !== "ENOENT") {
            console.log("Delete uploaded file failed:", absolutePath, error);
        }
    }
};

export const deleteUploadedFiles = async (fileUrls: Array<string | null | undefined>) => {
    await Promise.all(fileUrls.map((fileUrl) => deleteUploadedFile(fileUrl)));
};
