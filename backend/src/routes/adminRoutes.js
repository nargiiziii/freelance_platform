import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
  getAllProjects,
  deleteProject,
  getAllProposals,
  deleteProposal,
  getAllEscrows,
  forceReleaseEscrow,
  forceRefundEscrow,
  getAllReviews,
  deleteReview,
} from "../controllers/adminController.js";

import { verifyToken, isAdmin } from "../middleware/jwtMiddleware.js";

const router = express.Router();

// 📊 Статистика
router.get("/dashboard-stats", verifyToken, isAdmin, getDashboardStats);

// 👥 Пользователи
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.put("/block-user/:id", verifyToken, isAdmin, blockUser);
router.put("/unblock-user/:id", verifyToken, isAdmin, unblockUser);
router.delete("/delete-user/:id", verifyToken, isAdmin, deleteUser);

// 📁 Проекты
router.get("/projects", verifyToken, isAdmin, getAllProjects);
router.delete("/projects/:id", verifyToken, isAdmin, deleteProject);
// ❌ Удалено: router.patch("/projects/:id", ...) — теперь используется PATCH /api/projects/:id

// 📝 Отклики
router.get("/proposals", verifyToken, isAdmin, getAllProposals);
router.delete("/proposals/:id", verifyToken, isAdmin, deleteProposal);

// 💰 Escrow
router.get("/escrows", verifyToken, isAdmin, getAllEscrows);
router.post("/escrows/:id/force-release", verifyToken, isAdmin, forceReleaseEscrow);
router.post("/escrows/:id/force-refund", verifyToken, isAdmin, forceRefundEscrow);

// ⭐ Отзывы
router.get("/reviews", verifyToken, isAdmin, getAllReviews);
router.delete("/reviews/:id", verifyToken, isAdmin, deleteReview);

export default router;
