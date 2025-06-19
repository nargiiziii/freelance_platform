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


// ======= Роуты, требующие авторизации =======

// Создание проекта (только для авторизованных работодателей)
router.post("/", verifyToken, createProject);

// Получение всех проектов текущего работодателя
router.get("/my-projects", verifyToken, getEmployerProjects);

// Получение проектов, назначенных текущему фрилансеру
router.get("/freelancer-projects", verifyToken, getFreelancerProjects);

// Фрилансер отправляет выполненную работу по проекту
router.patch("/:projectId/submit-work", verifyToken, submitWork);

// Завершение проекта работодателем
router.patch("/:projectId/complete", verifyToken, completeProject);

// Получение одного проекта по его ID
router.get("/:id", verifyToken, getProjectById);

// Обновление проекта по его ID
router.patch("/:id", verifyToken, updateProjectById);

// Удаление проекта по его ID
router.delete("/:id", verifyToken, deleteProjectById);


// ======= Публичный роут (без авторизации) =======

// Получение списка всех открытых проектов (доступно всем пользователям)
router.get("/", getOpenProjects);


export default router;
