import express from "express";
import {
  createEscrow,
  releaseFunds,
  refundFunds,
  getTransactionHistory,
  topUpBalance
} from "../controllers/escrowController.js";
import { verifyToken } from "../middleware/jwtMiddleware.js"; 

const router = express.Router();

// Маршрут для создания escrow (работодатель замораживает средства при начале проекта)
router.post("/", verifyToken, createEscrow);

// Маршрут для выпуска средств фрилансеру после принятия выполненной работы
router.post("/:escrowId/release", verifyToken, releaseFunds);

// Маршрут для возврата средств работодателю (например, если работа отклонена)
router.post("/:escrowId/refund", verifyToken, refundFunds);

// Маршрут для получения истории всех транзакций текущего пользователя
router.get("/history", verifyToken, getTransactionHistory);

// Маршрут для пополнения баланса пользователя
router.post("/topup", verifyToken, topUpBalance);


export default router;
