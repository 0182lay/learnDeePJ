import express from "express";
import {
    getPayments,
    createPayment,
    getPaymentById,
    uploadPaymentSlip,
    updatePaymentStatus,
    deletePayment,
} from "../controllers/payment.controller";
import { auth } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import { uploadPaymentSlip as uploadPaymentSlipFile } from "../middlewares/upload.middleware";

const router = express.Router();

router.get("/payments", auth, getPayments);

router.get("/payments/:paymentId", auth, getPaymentById);

router.post("/payments", auth, createPayment);

router.post(
    "/payments/:paymentId/slip",
    auth,
    uploadPaymentSlipFile.single("slip"),
    uploadPaymentSlip,
);

router.patch(
    "/payments/:paymentId/status",
    auth,
    authorizeRoles("admin"),
    updatePaymentStatus,
);

router.delete(
    "/payments/:paymentId",
    auth,
    authorizeRoles("admin"),
    deletePayment,
);

export default router;
