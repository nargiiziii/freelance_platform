import express from "express";
import { createEscrow, releaseFunds, refundFunds } from "../controllers/escrowController.js";
import { verifyToken } from "../middleware/jwtMiddleware.js"; // ✅ ESM-совместимый импорт

const router = express.Router();

// 💰 Работодатель замораживает средства
router.post("/", verifyToken, createEscrow);

// ✅ Работодатель выпускает средства
router.post("/:escrowId/release", verifyToken, releaseFunds);

// ❌ Возврат средств работодателю
router.post("/:escrowId/refund", verifyToken, refundFunds);

export default router;
