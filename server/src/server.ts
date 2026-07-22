import express from "express";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();
const port = 3003;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routersPath = path.join(__dirname, "routers");

app.use(cors());
app.disable("etag");
app.use(express.json());
app.use(morgan("dev"));
app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    return next();
});
app.use("/uploads/videos", (_req, res) => {
    return res.status(403).json({ message: "PROTECTED_LESSON_FILE" });
});
app.use("/uploads/documents", (_req, res) => {
    return res.status(403).json({ message: "PROTECTED_LESSON_FILE" });
});
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ ລໍຖ້າໃຫ້ທຸກເສັ້ນທາງໂຫຼດກ່ອນ ຈາກນັ້ນເລີ່ມເຊີບເວີ.
const loadRoutes = async () => {
    const files = fs.readdirSync(routersPath);

    for (const file of files) {
        const module = await import(`./routers/${file}`);
        app.use("/api", module.default);
        console.log(`✅ loaded: ${file}`);
    }

    const server = app.listen(port, () => {
        console.log(`==============================`);
        console.log(`server running on port ${port}`);
        console.log(`==============================`);
    });

    server.timeout = 25 * 60 * 1000;
    server.keepAliveTimeout = 25 * 60 * 1000;
    server.headersTimeout = 25 * 60 * 1000;
};

loadRoutes();
