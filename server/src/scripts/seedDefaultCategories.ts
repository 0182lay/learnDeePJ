import { prisma } from "../lib/prisma";
import { getDefaultCategoriesService } from "../services/categories.service";

try {
    const categories = await getDefaultCategoriesService();
    console.log(`Default categories ready: ${categories.length}`);
} catch (error) {
    console.error(error);
    process.exitCode = 1;
} finally {
    await prisma.$disconnect();
}
