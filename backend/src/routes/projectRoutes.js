import express from 'express';
import {
  createProject,
  getEmployerProjects,
  getOpenProjects
} from '../controllers/projectController.js';
import {authMiddleware} from '../middleware/jwtMiddleware.js';

const router = express.Router();

// Создание проекта (только для employer)
router.post('/', authMiddleware, createProject);

// Получить проекты текущего employer
router.get('/my-projects', authMiddleware, getEmployerProjects);

// Получить открытые проекты для фрилансера
router.get('/', authMiddleware, getOpenProjects);

export default router;
