import express from "express";
import {
  createProject,
  getEmployerProjects,
  getOpenProjects,
  submitWork,
  completeProject,
  getFreelancerProjects,
  updateProjectById,
  deleteProjectById,
  getProjectById,
} from "../controllers/projectController.js";

import { verifyToken } from "../middleware/jwtMiddleware.js";

const router = express.Router();

// 🔒 Только авторизованные работодатели могут:
router.post("/", verifyToken, createProject);
router.get("/my-projects", verifyToken, getEmployerProjects);
router.get("/freelancer-projects", verifyToken, getFreelancerProjects);
router.patch("/:projectId/submit-work", verifyToken, submitWork);
router.patch("/:projectId/complete", verifyToken, completeProject);
router.get("/:id", verifyToken, getProjectById); // <-- ДО / !!!
router.patch("/:id", verifyToken, updateProjectById);
router.delete("/:id", verifyToken, deleteProjectById);
router.get("/", getOpenProjects); // <-- В САМОМ НИЗУ


export default router;
