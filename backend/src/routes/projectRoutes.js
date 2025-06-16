import express from 'express';
import {
  createProject,
  getEmployerProjects,
  getOpenProjects,
  submitWork,
  completeProject
} from '../controllers/projectController.js';
import { verifyToken } from '../middleware/jwtMiddleware.js'; // ✅ Не забудь этот импорт
import { getFreelancerProjects } from "../controllers/projectController.js";


const router = express.Router();

router.post('/', verifyToken, createProject);
router.get('/my-projects', verifyToken, getEmployerProjects);
router.get('/', getOpenProjects);
router.patch('/:projectId/submit-work', verifyToken, submitWork);
router.patch('/:projectId/complete', verifyToken, completeProject);
router.get("/freelancer-projects", verifyToken, getFreelancerProjects);

export default router;
