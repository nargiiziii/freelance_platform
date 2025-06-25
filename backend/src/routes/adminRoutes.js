import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  blockUser,
  unblockUser,
  deleteUser,
} from "../controllers/adminController.js";
import { verifyToken, isAdmin } from "../middleware/jwtMiddleware.js";

const router = express.Router();

router.get("/dashboard-stats", verifyToken, isAdmin, getDashboardStats);
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.put("/block-user/:id", verifyToken, isAdmin, blockUser);
router.put("/unblock-user/:id", verifyToken, isAdmin, unblockUser);
router.delete("/delete-user/:id", verifyToken, isAdmin, deleteUser);

export default router;
