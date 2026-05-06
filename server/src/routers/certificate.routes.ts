import express from "express";
import {
    getMyCertificates,
    issueCertificate,
} from "../controllers/certificate.controller";
import { auth } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/certificates", auth, getMyCertificates);
router.post("/courses/:courseId/certificate", auth, issueCertificate);

export default router;
